from fastapi import FastAPI, APIRouter, HTTPException, Request, Query
from fastapi.responses import RedirectResponse, HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timedelta
import json
import random
from bson import ObjectId
import requests
from urllib.parse import urlencode
import base64
from simple_salesforce import Salesforce
import asyncio
from concurrent.futures import ThreadPoolExecutor

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Salesforce OAuth settings
SALESFORCE_CLIENT_ID = os.environ.get('SALESFORCE_CLIENT_ID')
SALESFORCE_CLIENT_SECRET = os.environ.get('SALESFORCE_CLIENT_SECRET')
SALESFORCE_CALLBACK_URL = os.environ.get('SALESFORCE_CALLBACK_URL')
SALESFORCE_LOGIN_URL = os.environ.get('SALESFORCE_LOGIN_URL', 'https://login.salesforce.com')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Thread pool for Salesforce API calls
executor = ThreadPoolExecutor(max_workers=4)

# Helper function to convert ObjectId to string
def convert_objectid(obj):
    """Convert MongoDB ObjectId to string for JSON serialization"""
    if isinstance(obj, dict):
        return {k: convert_objectid(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    return obj

# New models for department salary collection
class DepartmentSalaries(BaseModel):
    customer_service: Optional[int] = None
    sales: Optional[int] = None  
    marketing: Optional[int] = None
    engineering: Optional[int] = None
    executives: Optional[int] = None

# Stage Engine Models for Alex Hormozi Benchmarking System
class BusinessStage(BaseModel):
    stage: int
    name: str
    hc_range: str
    rev_range: str
    role: str
    headcount_min: int
    headcount_max: int
    revenue_min: int
    revenue_max: int
    bottom_line: str
    constraints_and_actions: List[str]

class BusinessInputs(BaseModel):
    annual_revenue: Optional[int] = 1000000  # Default $1M
    employee_headcount: Optional[int] = 50   # Default 50 employees

class AuditRequest(BaseModel):
    session_id: str
    department_salaries: Optional[DepartmentSalaries] = None
    use_quick_estimate: bool = True
    business_inputs: Optional[BusinessInputs] = None

class AssumptionsUpdate(BaseModel):
    admin_rate: Optional[float] = 40
    cleanup_time_per_field: Optional[float] = 0.25
    confusion_time_per_field: Optional[float] = 2
    reporting_efficiency: Optional[int] = 50
    email_alert_time: Optional[float] = 3

class AuditSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    org_name: str
    org_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "completed"
    findings_count: int
    estimated_savings: Dict[str, float]
    access_token: Optional[str] = None
    instance_url: Optional[str] = None

class AuditFinding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    title: str
    description: str
    impact: str  # High, Medium, Low
    time_savings_hours: float
    roi_estimate: float
    recommendation: str
    affected_objects: List[str]
    salesforce_data: Optional[Dict[str, Any]] = None

# Alex Hormozi Stage 0-9 Benchmarking System
BUSINESS_STAGES = [
    {
        "stage": 0, "name": "Improvise", "hc_range": "0", "rev_range": "0", "role": "Researcher",
        "headcount_min": 0, "headcount_max": 0, "revenue_min": 0, "revenue_max": 0,
        "bottom_line": "Get people to try your stuff for free",
        "constraints_and_actions": [
            "Product: Give away a free MVP, iterate fast",
            "Marketing: Leverage friends/family/social channels", 
            "Sales: Solicit feedback & test willingness to pay",
            "Customer Service: Hand‑hold early users",
            "Tech: Use free/basic tools and trials",
            "Setup: Register basic business entity, track expenses"
        ]
    },
    {
        "stage": 1, "name": "Monetize", "hc_range": "1", "rev_range": "0-100K", "role": "Starter",
        "headcount_min": 1, "headcount_max": 1, "revenue_min": 0, "revenue_max": 100000,
        "bottom_line": "Prove that people will pay consistently",
        "constraints_and_actions": [
            "Product: Ship a V1 people will pay for",
            "Marketing: Clarify value proposition",
            "Sales: Turn free‑user feedback into paid conversions",
            "Support: Elevate customer care standards",
            "Tech: Leverage free/trial software",
            "Operations: Set up payment processing & bookkeeping",
            "Legal: Use basic contracts/agreements"
        ]
    },
    {
        "stage": 2, "name": "Advertise", "hc_range": "1–4", "rev_range": "100K–500K", "role": "Doer",
        "headcount_min": 1, "headcount_max": 4, "revenue_min": 100000, "revenue_max": 500000,
        "bottom_line": "Build consistent customer pipeline",
        "constraints_and_actions": [
            "Product: Foundation must be solid before scaling",
            "Marketing: Move from ad hoc to daily outreach",
            "Lead Gen: Qualify & follow up on leads promptly",
            "Reporting: Track pipeline stages in a simple CRM",
            "Onboarding: Standardize customer welcome flow",
            "Hiring: Post basic job ads & set expectations",
            "Finance: Formalize payroll & bookkeeping"
        ]
    },
    {
        "stage": 3, "name": "Stabilize", "hc_range": "1–4", "rev_range": "500K–2M", "role": "Trainer",
        "headcount_min": 1, "headcount_max": 4, "revenue_min": 500000, "revenue_max": 2000000,
        "bottom_line": "Put stable systems in place",
        "constraints_and_actions": [
            "Focus: Pick your single biggest customer pain & fix it",
            "Marketing/Sales: Build trust with consistent content & follow‑up",
            "Tech: Standardize on one platform, secure data",
            "HR: Create an employee handbook & clear roles",
            "Finance: Implement P&L statements & basic insurance"
        ]
    },
    {
        "stage": 4, "name": "Prioritize", "hc_range": "5–9", "rev_range": "2M–5M", "role": "Manager",
        "headcount_min": 5, "headcount_max": 9, "revenue_min": 2000000, "revenue_max": 5000000,
        "bottom_line": "Say \"no\" & focus on your best customers",
        "constraints_and_actions": [
            "Constraints: Weak process governance, Data silos, Inefficient hand‑offs",
            "Quick Wins: Centralize customer data, Standardize reporting, Automate key hand‑offs"
        ]
    },
    {
        "stage": 5, "name": "Productize", "hc_range": "10–19", "rev_range": "5M–10M", "role": "Director",
        "headcount_min": 10, "headcount_max": 19, "revenue_min": 5000000, "revenue_max": 10000000,
        "bottom_line": "Turn from one‑hit wonder into multi‑product business",
        "constraints_and_actions": [
            "Launch a second product (start small, test with top customers)",
            "Professionalize all processes & branding",
            "Balance existing product health vs. new product R&D",
            "Invest in proper systems & roles"
        ]
    },
    {
        "stage": 6, "name": "Optimize", "hc_range": "20–49", "rev_range": "10M–20M", "role": "VP",
        "headcount_min": 20, "headcount_max": 49, "revenue_min": 10000000, "revenue_max": 20000000,
        "bottom_line": "Do better, not just bigger",
        "constraints_and_actions": [
            "Identify biggest bottlenecks, fix iteratively",
            "Measure impact rigorously",
            "Train teams on new processes",
            "Document & institutionalize improvements",
            "Harden security & compliance"
        ]
    },
    {
        "stage": 7, "name": "Categorize", "hc_range": "50–99", "rev_range": "20M–50M", "role": "SVP",
        "headcount_min": 50, "headcount_max": 99, "revenue_min": 20000000, "revenue_max": 50000000,
        "bottom_line": "Organize chaos into domains",
        "constraints_and_actions": [
            "Data & operations scattered across teams",
            "No clear ownership of key processes",
            "→ Sort into categories:",
            "Employees (who does what)",
            "Applicants (who to interview)",
            "Customers (which need attention)",
            "Money (where to invest/spend)",
            "Leads (where to focus)"
        ]
    },
    {
        "stage": 8, "name": "Specialize", "hc_range": "100–249", "rev_range": "50M–100M", "role": "C‑Suite",
        "headcount_min": 100, "headcount_max": 249, "revenue_min": 50000000, "revenue_max": 100000000,
        "bottom_line": "Build expert teams, not generalists",
        "constraints_and_actions": [
            "No one can do everything well",
            "Define precise roles & hire specialists",
            "Create hand‑off systems between teams",
            "Break big projects into focused streams"
        ]
    },
    {
        "stage": 9, "name": "Capitalize", "hc_range": "250–500", "rev_range": "≥100M", "role": "Chairman",
        "headcount_min": 250, "headcount_max": 500, "revenue_min": 100000000, "revenue_max": float('inf'),
        "bottom_line": "Leverage your scale for exponential returns",
        "constraints_and_actions": [
            "Capital allocation inefficiencies (paying retail on cash)",
            "Performance & governance gaps",
            "→ Actions:",
            "Renegotiate vendor pricing, lock in enterprise discounts",
            "Deploy treasury strategies (interest‑bearing accounts)",
            "Conduct regular internal audits",
            "Establish board‑level oversight & performance systems",
            "Identify strategic acquisition targets"
        ]
    }
]

# Domain classification for findings
FINDING_DOMAINS = ["Data Quality", "Automation", "Reporting", "Security", "Adoption"]

# Stage-Domain Priority Mapping (which domains are most important per stage)
STAGE_DOMAIN_PRIORITY = {
    0: {"Adoption": 3, "Data Quality": 2, "Automation": 1, "Reporting": 1, "Security": 1},
    1: {"Adoption": 3, "Data Quality": 3, "Automation": 1, "Reporting": 2, "Security": 1},
    2: {"Adoption": 2, "Data Quality": 3, "Automation": 2, "Reporting": 3, "Security": 1},
    3: {"Data Quality": 3, "Automation": 2, "Reporting": 3, "Adoption": 2, "Security": 2},
    4: {"Automation": 3, "Data Quality": 3, "Reporting": 3, "Adoption": 2, "Security": 2},
    5: {"Automation": 3, "Reporting": 3, "Data Quality": 2, "Security": 2, "Adoption": 2},
    6: {"Automation": 3, "Reporting": 3, "Security": 3, "Data Quality": 2, "Adoption": 1},
    7: {"Reporting": 3, "Automation": 3, "Data Quality": 3, "Security": 3, "Adoption": 1},
    8: {"Security": 3, "Automation": 3, "Reporting": 3, "Data Quality": 2, "Adoption": 1},
    9: {"Security": 3, "Automation": 2, "Reporting": 3, "Data Quality": 2, "Adoption": 1}
}

def determine_business_stage(revenue: int, headcount: int) -> dict:
    """
    Map business revenue and headcount to Alex Hormozi Stage 0-9
    
    Args:
        revenue: Annual revenue in USD
        headcount: Total employee count
    
    Returns:
        dict: Stage information with stage number, name, role, etc.
    """
    
    # Handle edge cases
    if revenue == 0 and headcount == 0:
        return BUSINESS_STAGES[0]  # Stage 0: Improvise
    
    # Find best matching stage based on both revenue and headcount
    best_stage = None
    best_score = -1
    
    for stage in BUSINESS_STAGES:
        score = 0
        
        # Check revenue fit
        if revenue >= stage["revenue_min"] and revenue <= stage["revenue_max"]:
            score += 2  # Perfect revenue match
        elif revenue >= stage["revenue_min"] * 0.8 and revenue <= stage["revenue_max"] * 1.2:
            score += 1  # Close revenue match
            
        # Check headcount fit  
        if headcount >= stage["headcount_min"] and headcount <= stage["headcount_max"]:
            score += 2  # Perfect headcount match
        elif headcount >= stage["headcount_min"] * 0.8 and headcount <= stage["headcount_max"] * 1.2:
            score += 1  # Close headcount match
            
        if score > best_score:
            best_score = score
            best_stage = stage
    
    # If no good match found, use revenue as primary factor
    if best_stage is None:
        for stage in BUSINESS_STAGES:
            if revenue >= stage["revenue_min"] and revenue <= stage["revenue_max"]:
                best_stage = stage
                break
                
        # Ultimate fallback - use headcount
        if best_stage is None:
            for stage in BUSINESS_STAGES:
                if headcount >= stage["headcount_min"] and headcount <= stage["headcount_max"]:
                    best_stage = stage
                    break
                    
        # Final fallback
        if best_stage is None:
            best_stage = BUSINESS_STAGES[2]  # Default to Stage 2: Advertise
    
    return best_stage

def classify_finding_domain(finding: dict) -> str:
    """
    Classify a finding into one of the 5 domains based on its characteristics
    
    Args:
        finding: Finding dictionary with category, title, description, etc.
        
    Returns:
        str: Domain name from FINDING_DOMAINS
    """
    
    title = finding.get('title', '').lower()
    category = finding.get('category', '').lower()
    description = finding.get('description', '').lower()
    
    # Classification rules based on keywords
    if any(keyword in title + description for keyword in ['unused', 'orphaned', 'missing', 'duplicate', 'stale', 'quality']):
        return "Data Quality"
    elif any(keyword in title + description for keyword in ['automation', 'manual', 'workflow', 'alert', 'assignment']):
        return "Automation"
    elif any(keyword in title + description for keyword in ['report', 'dashboard', 'forecast', 'pipeline', 'analytics']):
        return "Reporting"
    elif any(keyword in title + description for keyword in ['security', 'permission', 'profile', 'access', 'user']):
        return "Security"
    elif any(keyword in title + description for keyword in ['adoption', 'training', 'usage', 'layout', 'configuration']):
        return "Adoption"
    else:
        # Default classification based on category
        if 'time saving' in category:
            return "Automation"
        elif 'revenue leak' in category:
            return "Data Quality"
        elif 'automation opportunit' in category:
            return "Automation"
        else:
            return "Data Quality"  # Safe default

def calculate_finding_priority(finding: dict, business_stage: dict) -> int:
    """
    Calculate priority score for a finding based on stage alignment and impact
    
    Args:
        finding: Finding dictionary
        business_stage: Current business stage information
        
    Returns:
        int: Priority score (higher = more important)
    """
    
    base_priority = 1
    stage_num = business_stage['stage']
    
    # Classify finding domain
    domain = classify_finding_domain(finding)
    
    # Stage alignment bonus
    stage_bonus = STAGE_DOMAIN_PRIORITY.get(stage_num, {}).get(domain, 1)
    
    # Impact score based on severity and user count
    impact_multiplier = 1
    impact = finding.get('impact', 'Medium').lower()
    if impact == 'high':
        impact_multiplier = 3
    elif impact == 'medium':
        impact_multiplier = 2
    elif impact == 'low':
        impact_multiplier = 1
        
    # ROI boost for high-value findings
    roi_boost = 0
    roi_estimate = finding.get('roi_estimate', 0)
    if roi_estimate > 10000:  # > $10k annual
        roi_boost = 2
    elif roi_estimate > 5000:  # > $5k annual
        roi_boost = 1
        
    final_priority = base_priority + stage_bonus + impact_multiplier + roi_boost
    
# Enhanced Task-Based ROI Calculation Constants
TASK_BASED_ROI_CONSTANTS = {
    'admin_rate': 35,  # $35/hr for admin tasks
    'cleanup_time_per_field': 0.25,  # 15 min per field cleanup
    'user_confusion_per_field_per_day': 0.5,  # 30 seconds per day per user per field
    'weekly_navigation_time': 2,  # 2 min/week/user for navigation confusion
    'workdays_per_month': 22  # average workdays per month
}

# US Bureau of Labor average hourly rates by role
HOURLY_RATES_BY_ROLE = {
    'admin': 35,
    'sales': 55, 
    'customer_service': 25,
    'marketing': 45,
    'engineering': 75,
    'executives': 95
}

def calculate_task_based_roi(finding_data, org_context, business_stage, custom_assumptions=None):
    """
    Enhanced task-based ROI calculation with stage-specific adjustments
    
    Args:
        finding_data: Dict with finding details
        org_context: Org data (users, complexity, etc.)
        business_stage: Current business stage info
        custom_assumptions: Override default constants
    """
    
    # Use defaults, override with custom assumptions if provided
    constants = TASK_BASED_ROI_CONSTANTS.copy()
    if custom_assumptions:
        constants.update(custom_assumptions)
    
    active_users = org_context.get('active_users', 10)
    stage_num = business_stage['stage']
    
    # Stage-based hourly rate adjustments
    stage_multipliers = {0: 0.7, 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.3, 7: 1.4, 8: 1.5, 9: 1.6}
    stage_multiplier = stage_multipliers.get(stage_num, 1.0)
    
    result = {
        'finding_type': finding_data.get('type', 'unknown'),
        'business_stage': stage_num,
        'stage_multiplier': stage_multiplier,
        'task_breakdown': [],
        'role_attribution': {},
        'one_time_costs': {},
        'recurring_savings': {},
        'total_one_time_cost': 0,
        'total_monthly_savings': 0,
        'total_annual_roi': 0,
        'domain': classify_finding_domain(finding_data),
        'priority_score': 0,
        'confidence': 'Medium'
    }
    
    # Custom Fields Analysis
    if 'custom fields' in finding_data.get('title', '').lower():
        field_count = finding_data.get('field_count', 0)
        
        # One-time cleanup (Admin role)
        cleanup_hours = field_count * constants['cleanup_time_per_field']
        cleanup_cost = cleanup_hours * HOURLY_RATES_BY_ROLE['admin'] * stage_multiplier
        
        # Monthly recurring savings (User confusion elimination)
        daily_confusion_minutes = active_users * constants['user_confusion_per_field_per_day'] * field_count
        monthly_confusion_hours = (daily_confusion_minutes * constants['workdays_per_month']) / 60
        
        # Use weighted average of user roles
        avg_user_rate = (HOURLY_RATES_BY_ROLE['sales'] + HOURLY_RATES_BY_ROLE['customer_service']) / 2
        monthly_confusion_savings = monthly_confusion_hours * avg_user_rate * stage_multiplier
        
        # Task breakdown
        result['task_breakdown'] = [
            {
                'task': 'Custom field cleanup',
                'type': 'one_time',
                'hours': cleanup_hours,
                'cost': cleanup_cost,
                'role': 'Admin',
                'description': f'Remove {field_count} unused fields from page layouts'
            },
            {
                'task': 'User confusion elimination',
                'type': 'recurring',
                'hours_per_month': monthly_confusion_hours,
                'savings_per_month': monthly_confusion_savings,
                'role': 'All Users',
                'description': f'{active_users} users × {constants["user_confusion_per_field_per_day"]} min/field × {field_count} fields'
            }
        ]
        
        result['one_time_costs'] = {'cleanup': cleanup_cost}
        result['recurring_savings'] = {'confusion_elimination': monthly_confusion_savings}
        result['total_one_time_cost'] = cleanup_cost
        result['total_monthly_savings'] = monthly_confusion_savings
        result['total_annual_roi'] = (monthly_confusion_savings * 12) - cleanup_cost
        result['confidence'] = 'High'
        
    # Data Quality Issues
    elif finding_data.get('category', '') == 'Revenue Leaks':
        record_count = finding_data.get('record_count', 0)
        cleanup_time_per_record = 0.1  # 6 minutes per record
        
        cleanup_hours = record_count * cleanup_time_per_record
        cleanup_cost = cleanup_hours * HOURLY_RATES_BY_ROLE['admin'] * stage_multiplier
        
        # Ongoing efficiency gains
        monthly_efficiency_hours = min(active_users * 0.5, 8)  # Cap at 8 hours
        monthly_efficiency_savings = monthly_efficiency_hours * avg_user_rate * stage_multiplier
        
        result['task_breakdown'] = [{
            'task': 'Data cleanup',
            'type': 'one_time',
            'hours': cleanup_hours,
            'cost': cleanup_cost,
            'role': 'Admin',
            'description': f'Clean up {record_count} problematic records'
        }, {
            'task': 'Efficiency improvement',
            'type': 'recurring',
            'hours_per_month': monthly_efficiency_hours,
            'savings_per_month': monthly_efficiency_savings,
            'role': 'All Users',
            'description': 'Reduced confusion and better reporting'
        }]
        
        result['one_time_costs'] = {'cleanup': cleanup_cost}
        result['recurring_savings'] = {'efficiency': monthly_efficiency_savings}
        result['total_one_time_cost'] = cleanup_cost
        result['total_monthly_savings'] = monthly_efficiency_savings
        result['total_annual_roi'] = (monthly_efficiency_savings * 12) - cleanup_cost
        result['confidence'] = 'Medium'
        
    # Automation Opportunities
    elif finding_data.get('category', '') == 'Automation Opportunities':
        setup_hours = 4  # Hours to implement automation
        setup_cost = setup_hours * HOURLY_RATES_BY_ROLE['admin'] * stage_multiplier
        
        monthly_automation_hours = finding_data.get('estimated_monthly_hours', 8)
        monthly_automation_savings = monthly_automation_hours * avg_user_rate * stage_multiplier
        
        result['task_breakdown'] = [{
            'task': 'Automation setup',
            'type': 'one_time', 
            'hours': setup_hours,
            'cost': setup_cost,
            'role': 'Admin',
            'description': 'Configure automated workflows and rules'
        }, {
            'task': 'Manual work elimination',
            'type': 'recurring',
            'hours_per_month': monthly_automation_hours,
            'savings_per_month': monthly_automation_savings,
            'role': 'All Users',
            'description': 'Time saved from automated processes'
        }]
        
        result['one_time_costs'] = {'setup': setup_cost}
        result['recurring_savings'] = {'automation': monthly_automation_savings}
        result['total_one_time_cost'] = setup_cost
        result['total_monthly_savings'] = monthly_automation_savings
        result['total_annual_roi'] = (monthly_automation_savings * 12) - setup_cost
        result['confidence'] = 'Medium'
        
    # Default fallback
    else:
        time_hours = finding_data.get('time_savings_hours', 2.0)
        monthly_savings = time_hours * avg_user_rate * stage_multiplier
        
        result['task_breakdown'] = [{
            'task': finding_data.get('title', 'Process improvement'),
            'type': 'recurring',
            'hours_per_month': time_hours,
            'savings_per_month': monthly_savings,
            'role': 'Various',
            'description': 'Estimated time savings from improvement'
        }]
        
        result['total_monthly_savings'] = monthly_savings
        result['total_annual_roi'] = monthly_savings * 12
        result['confidence'] = 'Low'
    
    # Calculate priority score
    result['priority_score'] = calculate_finding_priority(finding_data, business_stage)
    
    return result

class SalesforceOAuthState(BaseModel):
    state: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

def calculate_roi_with_department_salaries(finding_data, department_salaries, active_users):
    """
    Calculate ROI using department-specific salaries and separating one-time vs recurring costs
    
    Args:
        finding_data: Dict with finding details
        department_salaries: Dict with department annual salaries
        active_users: Number of active users
    """
    
    # Constants
    ADMIN_HOURLY_RATE = 40  # Fixed U.S. average Salesforce admin rate
    HOURS_PER_YEAR = 2080
    
    # Default U.S. national averages (fallbacks)
    DEFAULT_SALARIES = {
        'customer_service': 45000,
        'sales': 65000, 
        'marketing': 60000,
        'engineering': 95000,
        'executives': 150000
    }
    
    # Convert department salaries to hourly rates
    dept_hourly_rates = {}
    
    # Ensure all departments are covered, even if not provided
    all_departments = ['customer_service', 'sales', 'marketing', 'engineering', 'executives']
    
    for dept in all_departments:
        salary = department_salaries.get(dept) if department_salaries else None
        
        if salary and salary > 0:
            dept_hourly_rates[dept] = salary / HOURS_PER_YEAR
            logger.info(f"Using custom salary for {dept}: ${salary:,} (${dept_hourly_rates[dept]:.2f}/hr)")
        else:
            # Use default if salary is None, 0, empty, or department not provided
            default_salary = DEFAULT_SALARIES.get(dept, 50000)
            dept_hourly_rates[dept] = default_salary / HOURS_PER_YEAR
            logger.info(f"Using default salary for {dept}: ${default_salary:,} (${dept_hourly_rates[dept]:.2f}/hr)")
    
    # Calculate weighted average hourly rate across all users
    # Assume even distribution across departments for now
    avg_hourly_rate = sum(dept_hourly_rates.values()) / len(dept_hourly_rates)
    
    # Time assumptions
    ADMIN_CLEANUP_TIME_PER_FIELD = 0.25  # 15 minutes per field
    USER_CONFUSION_TIME_PER_FIELD_PER_MONTH = 2  # 2 minutes per user per field per month
    
    # Calculate based on finding type
    if finding_data['category'] == 'Time Savings' and 'custom fields' in finding_data['title'].lower():
        # Custom fields calculation
        field_count = finding_data.get('field_count', 0)
        
        # One-time cleanup cost
        cleanup_hours = field_count * ADMIN_CLEANUP_TIME_PER_FIELD
        cleanup_cost = cleanup_hours * ADMIN_HOURLY_RATE
        
        # Monthly recurring savings (user confusion elimination)
        monthly_confusion_minutes = active_users * USER_CONFUSION_TIME_PER_FIELD_PER_MONTH * field_count
        monthly_confusion_hours = monthly_confusion_minutes / 60
        monthly_user_savings = monthly_confusion_hours * avg_hourly_rate
        
        # Annual savings
        annual_user_savings = monthly_user_savings * 12
        
        # Net ROI (annual savings minus one-time cost)
        net_annual_roi = annual_user_savings - cleanup_cost
        
        return {
            'cleanup_cost': round(cleanup_cost, 0),
            'cleanup_hours': round(cleanup_hours, 1),
            'monthly_user_savings': round(monthly_user_savings, 0),
            'monthly_savings_hours': round(monthly_confusion_hours, 1),
            'annual_user_savings': round(annual_user_savings, 0),
            'net_annual_roi': round(net_annual_roi, 0),
            'avg_hourly_rate': round(avg_hourly_rate, 2),
            'admin_hourly_rate': ADMIN_HOURLY_RATE,
            'calculation_details': {
                'field_count': field_count,
                'active_users': active_users,
                'cleanup_time_per_field_minutes': ADMIN_CLEANUP_TIME_PER_FIELD * 60,
                'confusion_time_per_user_per_field_minutes': USER_CONFUSION_TIME_PER_FIELD_PER_MONTH,
                'department_hourly_rates': {k: round(v, 2) for k, v in dept_hourly_rates.items()}
            }
        }
    
    elif finding_data['category'] == 'Revenue Leaks':
        # Data quality issues - mostly one-time cleanup
        record_count = finding_data.get('record_count', 0)
        cleanup_time_per_record = 0.17  # 10 minutes per record
        
        cleanup_hours = record_count * cleanup_time_per_record
        cleanup_cost = cleanup_hours * ADMIN_HOURLY_RATE
        
        # Ongoing efficiency gains (reduced confusion, better reporting)
        monthly_efficiency_hours = min(active_users * 0.5, 10)  # Cap at 10 hours
        monthly_efficiency_savings = monthly_efficiency_hours * avg_hourly_rate
        annual_efficiency_savings = monthly_efficiency_savings * 12
        
        net_annual_roi = annual_efficiency_savings - cleanup_cost
        
        return {
            'cleanup_cost': round(cleanup_cost, 0),
            'cleanup_hours': round(cleanup_hours, 1),
            'monthly_user_savings': round(monthly_efficiency_savings, 0),
            'monthly_savings_hours': round(monthly_efficiency_hours, 1),
            'annual_user_savings': round(annual_efficiency_savings, 0),
            'net_annual_roi': round(net_annual_roi, 0),
            'avg_hourly_rate': round(avg_hourly_rate, 2),
            'admin_hourly_rate': ADMIN_HOURLY_RATE,
            'calculation_details': {
                'record_count': record_count,
                'cleanup_time_per_record_minutes': cleanup_time_per_record * 60,
                'monthly_efficiency_hours': monthly_efficiency_hours
            }
        }
    
    elif finding_data['category'] == 'Automation Opportunities':
        # Process automation - mostly recurring savings
        process_setup_hours = 4  # Time to set up automation
        setup_cost = process_setup_hours * ADMIN_HOURLY_RATE
        
        # Monthly time savings from automation
        monthly_automation_hours = finding_data.get('estimated_monthly_hours', 10)
        monthly_automation_savings = monthly_automation_hours * avg_hourly_rate
        annual_automation_savings = monthly_automation_savings * 12
        
        net_annual_roi = annual_automation_savings - setup_cost
        
        return {
            'cleanup_cost': round(setup_cost, 0),
            'cleanup_hours': round(process_setup_hours, 1),
            'monthly_user_savings': round(monthly_automation_savings, 0),
            'monthly_savings_hours': round(monthly_automation_hours, 1),
            'annual_user_savings': round(annual_automation_savings, 0),
            'net_annual_roi': round(net_annual_roi, 0),
            'avg_hourly_rate': round(avg_hourly_rate, 2),
            'admin_hourly_rate': ADMIN_HOURLY_RATE,
            'calculation_details': {
                'setup_hours': process_setup_hours,
                'monthly_automation_hours': monthly_automation_hours
            }
        }
    
    # Default fallback
    return {
        'cleanup_cost': 0,
        'cleanup_hours': 0,
        'monthly_user_savings': 0,
        'monthly_savings_hours': 0,
        'annual_user_savings': 0,
        'net_annual_roi': 0,
        'avg_hourly_rate': round(avg_hourly_rate, 2),
        'admin_hourly_rate': ADMIN_HOURLY_RATE,
        'calculation_details': {}
    }
def calculate_enhanced_roi_with_tasks(finding_data, department_salaries, active_users, org_data, custom_assumptions=None):
    """
    Enhanced ROI calculation with task-specific breakdowns and role attribution
    
    Args:
        finding_data: Dict with finding details
        department_salaries: Dict with department annual salaries  
        active_users: Number of active users
        org_data: Real org data (record counts, etc.)
        custom_assumptions: Dict with custom calculation constants
    """
    
    # Default constants (can be overridden by custom_assumptions)
    defaults = {
        'admin_rate': 40,  # $/hr for all one-time cleanup
        'cleanup_time_per_field': 0.25,  # hours per custom field cleanup
        'confusion_time_per_field': 2,  # min/user/field/month  
        'reporting_efficiency': 50,  # % of manual reporting time that can be automated
        'email_alert_time': 3  # minutes saved per automated notification
    }
    
    # Override defaults with custom assumptions if provided
    if custom_assumptions:
        for key, value in custom_assumptions.items():
            if key in defaults and value is not None:
                defaults[key] = value
                logger.info(f"Using custom assumption: {key} = {value}")
    
    # Use the values from defaults (which may have been overridden)
    ADMIN_RATE = defaults['admin_rate']
    CLEANUP_TIME_PER_FIELD = defaults['cleanup_time_per_field']
    DEFAULT_CONFUSION_MIN = defaults['confusion_time_per_field']
    REPORTING_EFFICIENCY = defaults['reporting_efficiency']
    EMAIL_ALERT_TIME = defaults['email_alert_time']
    
    DAILY_WORKDAYS = 22  # average workdays/month
    HOURS_PER_YEAR = 2080
    
    # Role mapping - simplified and intuitive
    ROLE_MAPPING = {
        'custom_field_cleanup': 'admin',
        'opportunity_reporting': 'sales', 
        'email_alerts': 'sales',
        'case_assignment': 'customer_service',
        'lead_followup': 'customer_service',
        'data_cleanup': 'admin',
        'system_config': 'admin'
    }
    
    # Default task frequencies (fallbacks when org data unavailable)
    DEFAULT_EMAIL_NOTIFY = {
        'opportunity_update_min': 3,
        'task_assignment_min': 1,
        'followup_min': 0.5
    }
    
    # Default reporting tasks
    DEFAULT_REPORT_TASKS = [
        {'role': 'sales', 'freq_per_month': 4, 'duration_min': 30, 'task': 'Pipeline reports'},
        {'role': 'marketing', 'freq_per_month': 1, 'duration_min': 120, 'task': 'Campaign analysis'},
        {'role': 'customer_service', 'freq_per_month': 1, 'duration_min': 60, 'task': 'Case reports'},
        {'role': 'admin', 'freq_per_month': 1, 'duration_min': 15, 'task': 'User activity reports'}
    ]
    
    # Default salaries for fallback
    DEFAULT_SALARIES = {
        'customer_service': 45000,
        'sales': 65000, 
        'marketing': 60000,
        'engineering': 95000,
        'executives': 150000,
        'admin': 55000  # Added admin default
    }
    
    # Get hourly rates for each department
    def get_hourly_rate(dept):
        salary = None
        if department_salaries and dept in department_salaries:
            salary = department_salaries[dept]
        if not salary or salary <= 0:
            salary = DEFAULT_SALARIES.get(dept, 50000)
        return salary / HOURS_PER_YEAR
    
    # Determine confidence level
    def get_confidence_level(has_custom_data=False, has_org_data=False):
        if has_custom_data:
            return 'High'
        elif has_org_data:
            return 'Medium'
        else:
            return 'Medium'  # Default to Medium as requested
    
    # Calculate based on finding type
    finding_type = finding_data.get('type', 'unknown')
    category = finding_data.get('category', '')
    
    result = {
        'finding_type': finding_type,
        'confidence': 'Medium',
        'task_breakdown': [],
        'role_attribution': {},
        'one_time_costs': {},
        'recurring_savings': {},
        'total_one_time_cost': 0,
        'total_monthly_savings': 0,
        'total_annual_roi': 0,
        'calculation_details': {},
        'cleanup_cost': 0,  # For backward compatibility
        'cleanup_hours': 0,
        'monthly_user_savings': 0,
        'annual_user_savings': 0,
        'net_annual_roi': 0,
        'avg_hourly_rate': 0,
        'admin_hourly_rate': ADMIN_RATE,
        'monthly_savings_hours': 0
    }
    
    # Custom Fields Analysis
    if 'custom fields' in finding_data.get('title', '').lower():
        field_count = finding_data.get('field_count', 0)
        
        # One-time cleanup (Admin role)
        cleanup_hours = field_count * CLEANUP_TIME_PER_FIELD
        cleanup_cost = cleanup_hours * ADMIN_RATE
        admin_rate = get_hourly_rate('admin')
        
        # Monthly recurring savings (All users - confusion elimination)
        monthly_confusion_minutes = active_users * DEFAULT_CONFUSION_MIN * field_count  
        monthly_confusion_hours = monthly_confusion_minutes / 60
        
        # Calculate savings per department (assume even distribution)
        dept_rates = {dept: get_hourly_rate(dept) for dept in ['sales', 'customer_service', 'marketing']}
        avg_hourly_rate = sum(dept_rates.values()) / len(dept_rates)
        monthly_confusion_savings = monthly_confusion_hours * avg_hourly_rate
        
        # Task breakdown
        result['task_breakdown'] = [
            {
                'task': 'Custom field cleanup',
                'type': 'one_time',
                'hours': cleanup_hours,
                'cost': cleanup_cost,
                'role': 'Admin',
                'description': f'Remove {field_count} unused fields from page layouts'
            },
            {
                'task': 'User confusion elimination', 
                'type': 'recurring',
                'hours_per_month': monthly_confusion_hours,
                'cost_per_month': monthly_confusion_savings,
                'role': 'All Users',
                'description': f'{active_users} users × {DEFAULT_CONFUSION_MIN} min/field × {field_count} fields'
            }
        ]
        
        # Role attribution
        result['role_attribution'] = {
            'Admin': {
                'one_time_hours': cleanup_hours,
                'one_time_cost': cleanup_cost,
                'monthly_hours': 0,
                'monthly_savings': 0
            },
            'All Users': {
                'one_time_hours': 0,
                'one_time_cost': 0,
                'monthly_hours': monthly_confusion_hours,
                'monthly_savings': monthly_confusion_savings
            }
        }
        
        # Backward compatibility fields
        result['cleanup_cost'] = cleanup_cost
        result['cleanup_hours'] = cleanup_hours
        result['monthly_user_savings'] = monthly_confusion_savings
        result['monthly_savings_hours'] = monthly_confusion_hours
        result['annual_user_savings'] = monthly_confusion_savings * 12
        result['net_annual_roi'] = (monthly_confusion_savings * 12) - cleanup_cost
        result['avg_hourly_rate'] = avg_hourly_rate
        
        result['one_time_costs'] = {'cleanup': cleanup_cost}
        result['recurring_savings'] = {'confusion_elimination': monthly_confusion_savings}
        result['total_one_time_cost'] = cleanup_cost
        result['total_monthly_savings'] = monthly_confusion_savings
        result['total_annual_roi'] = (monthly_confusion_savings * 12) - cleanup_cost
        result['confidence'] = get_confidence_level(has_org_data=True)
        
    # Default fallback for other finding types - maintain backward compatibility
    else:
        # Use existing time_savings_hours if available
        time_hours = finding_data.get('time_savings_hours', 2.0)
        avg_hourly_rate = sum(get_hourly_rate(dept) for dept in ['sales', 'customer_service']) / 2
        monthly_savings = time_hours * avg_hourly_rate
        
        result['task_breakdown'] = [{
            'task': finding_data.get('title', 'Process improvement'),
            'type': 'recurring',
            'hours_per_month': time_hours,
            'cost_per_month': monthly_savings,
            'role': 'Various',
            'description': 'Estimated time savings from process improvement'
        }]
        
        # Backward compatibility
        result['monthly_user_savings'] = monthly_savings
        result['monthly_savings_hours'] = time_hours
        result['annual_user_savings'] = monthly_savings * 12
        result['net_annual_roi'] = monthly_savings * 12
        result['avg_hourly_rate'] = avg_hourly_rate
        
        result['total_monthly_savings'] = monthly_savings
        result['total_annual_roi'] = monthly_savings * 12
        result['confidence'] = 'Medium'
    
    return result

def get_org_context(sf_client):
    """Get org context for realistic ROI calculations"""
    try:
        # Get user count for scaling calculations
        active_users = sf_client.query("SELECT COUNT() FROM User WHERE IsActive = true")['totalSize']
        
        # Get record volumes for complexity assessment
        account_count = sf_client.query("SELECT COUNT() FROM Account")['totalSize']
        opportunity_count = sf_client.query("SELECT COUNT() FROM Opportunity")['totalSize']
        
        # Get org info for context
        org_info = sf_client.query("SELECT Id, Name, OrganizationType FROM Organization LIMIT 1")
        org_name = org_info['records'][0]['Name'] if org_info['records'] else "Unknown Org"
        org_type = org_info['records'][0].get('OrganizationType', 'Unknown')
        
        # Estimate hourly rate based on org type and size
        if org_type == 'Developer Edition':
            hourly_rate = 65  # Lower for dev orgs
        elif active_users < 10:
            hourly_rate = 70  # Small business
        elif active_users < 50:
            hourly_rate = 85  # Mid-market
        else:
            hourly_rate = 95  # Enterprise
        
        return {
            'active_users': active_users,
            'account_count': account_count,
            'opportunity_count': opportunity_count,
            'org_name': org_name,
            'org_type': org_type,
            'estimated_hourly_rate': hourly_rate,
            'complexity_multiplier': min(2.0, 1.0 + (active_users / 50))  # Scale with team size
        }
    except Exception as e:
        logger.error(f"Error getting org context: {e}")
        return {
            'active_users': 10,
            'account_count': 100,
            'opportunity_count': 50,
            'org_name': 'Unknown Org',
            'org_type': 'Unknown',
            'estimated_hourly_rate': 75,
            'complexity_multiplier': 1.0
        }

# Salesforce Analysis Functions
def analyze_custom_fields(sf_client, org_context, department_salaries=None, custom_assumptions=None):
    """Analyze custom fields for unused ones"""
    findings = []
    
    try:
        # Get all custom objects and standard objects
        describe_result = sf_client.describe()
        sobjects = describe_result['sobjects']
        
        custom_field_count = 0
        unused_field_count = 0
        total_fields_analyzed = 0
        
        # Sample a few key objects to avoid API limits
        key_objects = ['Account', 'Contact', 'Opportunity', 'Lead', 'Case']
        
        for sobject in sobjects:
            if sobject['name'] in key_objects:
                try:
                    obj = getattr(sf_client, sobject['name'])
                    describe = obj.describe()
                    
                    for field in describe['fields']:
                        if field['custom']:
                            custom_field_count += 1
                            total_fields_analyzed += 1
                            
                            # More sophisticated "unused" detection
                            is_potentially_unused = (
                                field['name'].endswith('__c') and 
                                not field.get('calculatedFormula') and
                                not field.get('defaultValue') and
                                field.get('nillable', True)  # Not required
                            )
                            
                            if is_potentially_unused:
                                unused_field_count += 1
                                
                except Exception as e:
                    logger.warning(f"Error analyzing {sobject['name']}: {e}")
                    continue
        
        if unused_field_count > 0:
            active_users = org_context.get('active_users', 10)
            
            # Create org data for enhanced calculation
            org_data = {
                'opportunity_count': org_context.get('opportunity_count', 0),
                'account_count': org_context.get('account_count', 0),
                'active_users': active_users
            }
            
            # Use enhanced ROI calculation if department salaries provided
            if department_salaries:
                finding_data = {
                    'category': 'Time Savings',
                    'title': f'{unused_field_count} Potentially Unused Custom Fields',
                    'field_count': unused_field_count,
                    'type': 'custom_fields'
                }
                roi_calc = calculate_enhanced_roi_with_tasks(finding_data, department_salaries, active_users, org_data, custom_assumptions)
                
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Time Savings",
                    "title": f"{unused_field_count} Potentially Unused Custom Fields",
                    "description": f"Found {unused_field_count} custom fields across key objects that may not be actively used. These fields clutter page layouts and confuse users. Analysis based on {total_fields_analyzed} total custom fields across {len(key_objects)} objects.",
                    "impact": "Medium" if unused_field_count > 10 else "Low",
                    "time_savings_hours": roi_calc['monthly_savings_hours'],
                    "cleanup_cost": roi_calc['cleanup_cost'],
                    "cleanup_hours": roi_calc['cleanup_hours'],
                    "monthly_user_savings": roi_calc['monthly_user_savings'],
                    "annual_user_savings": roi_calc['annual_user_savings'],
                    "net_annual_roi": roi_calc['net_annual_roi'],
                    "roi_estimate": roi_calc['net_annual_roi'],  # For backward compatibility
                    "confidence": roi_calc['confidence'],
                    "task_breakdown": roi_calc['task_breakdown'],
                    "role_attribution": roi_calc['role_attribution'],
                    "one_time_costs": roi_calc['one_time_costs'],
                    "recurring_savings": roi_calc['recurring_savings'],
                    "recommendation": "Review field usage reports and consider removing or consolidating unused custom fields. Start with fields that have no default values and are not required.",
                    "affected_objects": key_objects,
                    "salesforce_data": {
                        "total_custom_fields": custom_field_count,
                        "potentially_unused": unused_field_count,
                        "analysis_criteria": "Fields with no formula, default value, or required flag",
                        "objects_analyzed": len(key_objects),
                        "users_affected": active_users,
                        "calculation_method": f"Enhanced task-based calculation with {roi_calc['confidence']} confidence",
                        "roi_breakdown": roi_calc.get('calculation_details', {})
                    }
                })
            else:
                # Fallback to old calculation method
                complexity_multiplier = org_context.get('complexity_multiplier', 1.0)
                base_time_per_field = 0.5
                user_confusion_time = (active_users * 5) / 60
                total_time_per_field = base_time_per_field + (user_confusion_time / unused_field_count)
                total_time_savings = unused_field_count * total_time_per_field * complexity_multiplier
                
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Time Savings",
                    "title": f"{unused_field_count} Potentially Unused Custom Fields",
                    "description": f"Found {unused_field_count} custom fields across key objects that may not be actively used. These fields clutter page layouts and confuse users. Analysis based on {total_fields_analyzed} total custom fields across {len(key_objects)} objects.",
                    "impact": "Medium" if unused_field_count > 10 else "Low",
                    "time_savings_hours": round(total_time_savings, 1),
                    "confidence": "Medium",
                    "recommendation": "Review field usage reports and consider removing or consolidating unused custom fields. Start with fields that have no default values and are not required.",
                    "affected_objects": key_objects,
                    "salesforce_data": {
                        "total_custom_fields": custom_field_count,
                        "potentially_unused": unused_field_count,
                        "analysis_criteria": "Fields with no formula, default value, or required flag",
                        "objects_analyzed": len(key_objects),
                        "users_affected": active_users,
                        "calculation_method": f"Admin cleanup ({base_time_per_field}h per field) + user confusion time scaled by {active_users} users"
                    }
                })
    
    except Exception as e:
        logger.error(f"Error analyzing custom fields: {e}")
    
    return findings


def analyze_data_quality(sf_client, org_context):
    """Analyze data quality issues"""
    findings = []
    
    try:
        active_users = org_context.get('active_users', 10)
        complexity_multiplier = org_context.get('complexity_multiplier', 1.0)
        
        logger.info("Starting data quality analysis...")
        
        # Check for orphaned opportunities (no account)
        try:
            orphaned_opps = sf_client.query("SELECT COUNT() FROM Opportunity WHERE AccountId = null")
            orphaned_count = orphaned_opps['totalSize']
            logger.info(f"Found {orphaned_count} orphaned opportunities")
            
            if orphaned_count > 0:
                # More realistic time calculation: 10 minutes per record + management overhead
                base_cleanup_time = orphaned_count * 0.17  # 10 minutes per record
                management_overhead = (orphaned_count / 20) * 0.5  # 30 min per 20 records for coordination
                total_time = (base_cleanup_time + management_overhead) * complexity_multiplier
                
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Revenue Leaks",
                    "title": f"{orphaned_count} Orphaned Opportunity Records",
                    "description": f"Found {orphaned_count} opportunities without proper account associations, making pipeline reporting inaccurate. This affects {active_users} users who rely on accurate pipeline data.",
                    "impact": "High" if orphaned_count > 50 else "Medium",
                    "time_savings_hours": round(total_time, 1),
                    "recommendation": "Implement data quality rules and assign team to clean up orphaned records. Set up validation rules to prevent future occurrences.",
                    "affected_objects": ["Opportunity", "Account"],
                    "salesforce_data": {
                        "orphaned_opportunities": orphaned_count,
                        "query_used": "SELECT COUNT() FROM Opportunity WHERE AccountId = null",
                        "users_affected": active_users,
                        "calculation_method": f"Cleanup time (10 min/record) + management overhead, scaled by complexity ({complexity_multiplier:.1f}x)"
                    }
                })
        except Exception as e:
            logger.warning(f"Error checking orphaned opportunities: {e}")
        
        # Check for leads without activity (more aggressive timeframe)
        try:
            stale_leads = sf_client.query("SELECT COUNT() FROM Lead WHERE LastActivityDate < LAST_N_DAYS:90")
            stale_count = stale_leads['totalSize']
            logger.info(f"Found {stale_count} stale leads (90+ days)")
            
            if stale_count > 5:  # Lower threshold
                # Scale time based on actual volume and team size
                base_review_time = min(stale_count * 0.05, 20)  # 3 min per lead, max 20 hours
                process_improvement_time = 2  # Time to set up automation
                total_time = (base_review_time + process_improvement_time) * complexity_multiplier
                
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Revenue Leaks",
                    "title": f"{stale_count} Stale Lead Records",
                    "description": f"{stale_count} leads haven't had activity in 90+ days, representing potential lost revenue. With {active_users} users, this indicates process gaps in lead management.",
                    "impact": "High" if stale_count > 100 else "Medium",
                    "time_savings_hours": round(total_time, 1),
                    "recommendation": "Implement lead scoring and automated nurture campaigns. Archive truly cold leads and improve lead assignment processes.",
                    "affected_objects": ["Lead", "Campaign"],
                    "salesforce_data": {
                        "stale_leads": stale_count,
                        "query_used": "SELECT COUNT() FROM Lead WHERE LastActivityDate < LAST_N_DAYS:90",
                        "users_affected": active_users,
                        "calculation_method": f"Review time (3 min/lead, max 20h) + process setup (2h), scaled by complexity ({complexity_multiplier:.1f}x)"
                    }
                })
        except Exception as e:
            logger.warning(f"Error checking stale leads: {e}")
        
        # Check for opportunities without close dates
        try:
            opps_no_close_date = sf_client.query("SELECT COUNT() FROM Opportunity WHERE CloseDate = null")
            no_close_count = opps_no_close_date['totalSize']
            logger.info(f"Found {no_close_count} opportunities without close dates")
            
            if no_close_count > 0:
                cleanup_time = no_close_count * 0.1  # 6 minutes per opportunity
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Revenue Leaks",
                    "title": f"{no_close_count} Opportunities Missing Close Dates",
                    "description": f"Found {no_close_count} opportunities without close dates, making forecasting impossible and pipeline reports unreliable.",
                    "impact": "Medium",
                    "time_savings_hours": round(cleanup_time, 1),
                    "recommendation": "Require close dates on all opportunities and clean up existing records. Implement validation rules to prevent future occurrences.",
                    "affected_objects": ["Opportunity"],
                    "salesforce_data": {
                        "opportunities_no_close_date": no_close_count,
                        "query_used": "SELECT COUNT() FROM Opportunity WHERE CloseDate = null"
                    }
                })
        except Exception as e:
            logger.warning(f"Error checking opportunities without close dates: {e}")
        
        # Check for contacts without accounts
        try:
            orphaned_contacts = sf_client.query("SELECT COUNT() FROM Contact WHERE AccountId = null")
            orphaned_contact_count = orphaned_contacts['totalSize']
            logger.info(f"Found {orphaned_contact_count} orphaned contacts")
            
            if orphaned_contact_count > 0:
                cleanup_time = orphaned_contact_count * 0.08  # 5 minutes per contact
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Revenue Leaks",
                    "title": f"{orphaned_contact_count} Orphaned Contact Records",
                    "description": f"Found {orphaned_contact_count} contacts without account associations, making relationship mapping and account management difficult.",
                    "impact": "Medium",
                    "time_savings_hours": round(cleanup_time, 1),
                    "recommendation": "Associate contacts with appropriate accounts or create new accounts as needed. Implement data quality rules.",
                    "affected_objects": ["Contact", "Account"],
                    "salesforce_data": {
                        "orphaned_contacts": orphaned_contact_count,
                        "query_used": "SELECT COUNT() FROM Contact WHERE AccountId = null"
                    }
                })
        except Exception as e:
            logger.warning(f"Error checking orphaned contacts: {e}")
        
        logger.info(f"Data quality analysis completed: {len(findings)} findings")
    
    except Exception as e:
        logger.error(f"Error analyzing data quality: {e}")
    
    return findings

def analyze_system_configuration(sf_client, org_context):
    """Analyze system configuration and user adoption issues"""
    findings = []
    
    try:
        active_users = org_context.get('active_users', 10)
        logger.info("Starting system configuration analysis...")
        
        # Check for inactive users with licenses
        try:
            total_users = sf_client.query("SELECT COUNT() FROM User")['totalSize']
            inactive_users = total_users - active_users
            logger.info(f"Found {inactive_users} inactive users out of {total_users} total")
            
            if inactive_users > 2:  # More than 2 inactive users
                # Estimate license cost savings (rough estimate $75/user/month)
                monthly_license_savings = inactive_users * 75
                annual_savings = monthly_license_savings * 12
                cleanup_time = inactive_users * 0.5  # 30 minutes per user to review and deactivate
                
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Time Savings",
                    "title": f"{inactive_users} Inactive User Licenses",
                    "description": f"Found {inactive_users} inactive users out of {total_users} total users, potentially wasting license costs and creating security risks.",
                    "impact": "Medium",
                    "time_savings_hours": round(cleanup_time, 1),
                    "recommendation": "Review inactive users, deactivate unnecessary accounts, and reallocate licenses to active team members. Implement user lifecycle management process.",
                    "affected_objects": ["User", "Profile", "Permission Sets"],
                    "salesforce_data": {
                        "inactive_users": inactive_users,
                        "total_users": total_users,
                        "estimated_monthly_license_savings": monthly_license_savings,
                        "estimated_annual_savings": annual_savings,
                        "cleanup_time_hours": cleanup_time
                    }
                })
        except Exception as e:
            logger.warning(f"Error checking user licenses: {e}")
        
        # Check for duplicate record types or page layouts
        try:
            # This is a common issue - simulate finding duplicate configurations
            if active_users > 3:  # Only for organizations with multiple users
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Time Savings",
                    "title": "Page Layout and Record Type Optimization",
                    "description": f"With {active_users} users across multiple roles, there's likely opportunity to streamline page layouts and record types for better user experience.",
                    "impact": "Low",
                    "time_savings_hours": 4.0,
                    "recommendation": "Audit page layouts for each profile, consolidate similar layouts, and optimize field placement based on user workflows.",
                    "affected_objects": ["Page Layout", "Record Type", "Profile"],
                    "salesforce_data": {
                        "users_affected": active_users,
                        "optimization_area": "page_layouts_record_types"
                    }
                })
        except Exception as e:
            logger.warning(f"Error analyzing page layouts: {e}")
        
        logger.info(f"System configuration analysis completed: {len(findings)} findings")
    
    except Exception as e:
        logger.error(f"Error analyzing system configuration: {e}")
    
    return findings

def analyze_data_governance(sf_client, org_context):
    """Analyze data governance and quality standards"""
    findings = []
    
    try:
        active_users = org_context.get('active_users', 10)
        logger.info("Starting data governance analysis...")
        
        # Check for missing required field data (simulate)
        try:
            # Check opportunities missing key fields
            opp_missing_amount = sf_client.query("SELECT COUNT() FROM Opportunity WHERE Amount = null AND StageName != 'Closed Lost'")['totalSize']
            logger.info(f"Found {opp_missing_amount} opportunities missing amount")
            
            if opp_missing_amount > 0:
                cleanup_time = opp_missing_amount * 0.1  # 6 minutes per opportunity
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Revenue Leaks",
                    "title": f"{opp_missing_amount} Opportunities Missing Amount Data",
                    "description": f"Found {opp_missing_amount} open opportunities without amount data, making pipeline forecasting inaccurate and revenue projections unreliable.",
                    "impact": "High",
                    "time_savings_hours": round(cleanup_time, 1),
                    "recommendation": "Make Amount field required for opportunities. Clean up existing data and implement validation rules.",
                    "affected_objects": ["Opportunity", "Validation Rules"],
                    "salesforce_data": {
                        "opportunities_missing_amount": opp_missing_amount,
                        "query_used": "SELECT COUNT() FROM Opportunity WHERE Amount = null AND StageName != 'Closed Lost'"
                    }
                })
        except Exception as e:
            logger.warning(f"Error checking opportunity amounts: {e}")
        
        # Check for inconsistent data entry patterns
        try:
            if active_users > 2:
                # Estimate time spent on data cleanup due to inconsistent entry
                monthly_cleanup_time = active_users * 1.5  # 1.5 hours per user per month
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Time Savings",
                    "title": "Data Standardization Opportunity",
                    "description": f"With {active_users} users entering data, inconsistent formatting and naming conventions likely create ongoing cleanup work and reporting challenges.",
                    "impact": "Medium",
                    "time_savings_hours": round(monthly_cleanup_time * 0.6, 1),  # 60% could be prevented
                    "recommendation": "Implement data validation rules, picklist standardization, and user training on data entry best practices.",
                    "affected_objects": ["Validation Rules", "Picklists", "Data Entry"],
                    "salesforce_data": {
                        "users_affected": active_users,
                        "estimated_cleanup_time": monthly_cleanup_time,
                        "governance_area": "data_standardization"
                    }
                })
        except Exception as e:
            logger.warning(f"Error analyzing data standardization: {e}")
        
        logger.info(f"Data governance analysis completed: {len(findings)} findings")
    
    except Exception as e:
        logger.error(f"Error analyzing data governance: {e}")
    
    return findings

def analyze_automation_opportunities(sf_client, org_context):
    """Analyze automation opportunities"""
    findings = []
    
    try:
        active_users = org_context.get('active_users', 10)
        complexity_multiplier = org_context.get('complexity_multiplier', 1.0)
        
        logger.info("Starting automation analysis...")
        
        # Check for manual case assignment (simplified)
        try:
            case_count = sf_client.query("SELECT COUNT() FROM Case")['totalSize']
            logger.info(f"Found {case_count} cases in system")
            
            if case_count > 5:  # Lower threshold for smaller orgs
                # Scale time savings based on case volume and team size
                weekly_case_volume = case_count / 52  # Approximate weekly cases
                time_per_case = 0.1  # 6 minutes manual assignment time
                weekly_time_saved = weekly_case_volume * time_per_case
                monthly_time_saved = weekly_time_saved * 4.3 * complexity_multiplier
                
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Automation Opportunities",
                    "title": "Case Assignment Automation Opportunity",
                    "description": f"With {case_count} cases in the system and {active_users} active users, automated case assignment rules could significantly improve response times and reduce manual effort.",
                    "impact": "High" if case_count > 100 else "Medium",
                    "time_savings_hours": round(max(monthly_time_saved, 2.0), 1),  # Minimum 2 hours
                    "recommendation": "Implement case assignment rules based on product, region, and expertise. Set up escalation workflows for better case management.",
                    "affected_objects": ["Case", "Queue"],
                    "salesforce_data": {
                        "total_cases": case_count,
                        "weekly_case_estimate": round(weekly_case_volume, 1),
                        "users_affected": active_users,
                        "automation_recommendation": "case_assignment_rules",
                        "calculation_method": f"Weekly cases ({weekly_case_volume:.1f}) × 6 min manual time × 4.3 weeks × complexity ({complexity_multiplier:.1f}x)"
                    }
                })
        except Exception as e:
            logger.warning(f"Error checking cases: {e}")
        
        # Check for email alerts and workflows
        try:
            # Always recommend this for any org with data
            opportunities_count = org_context.get('opportunity_count', 0)
            if opportunities_count > 0:
                base_setup_time = 4  # Hours to set up email alerts
                monthly_time_saved = active_users * 0.5  # 30 minutes per user per month
                
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Automation Opportunities",
                    "title": "Email Alert Automation Gap",
                    "description": f"With {opportunities_count} opportunities and {active_users} users, automated email alerts for stage changes, task assignments, and follow-ups could reduce manual communication overhead.",
                    "impact": "Medium",
                    "time_savings_hours": round(monthly_time_saved, 1),
                    "recommendation": "Set up email alerts for opportunity stage changes, task assignments, and follow-up reminders. Configure workflow rules for automated notifications.",
                    "affected_objects": ["Opportunity", "Task", "Workflow"],
                    "salesforce_data": {
                        "opportunities_count": opportunities_count,
                        "users_affected": active_users,
                        "setup_time_hours": base_setup_time,
                        "automation_recommendation": "email_alerts_workflows"
                    }
                })
        except Exception as e:
            logger.warning(f"Error analyzing email alerts: {e}")
        
        # Check for lead assignment automation
        try:
            lead_count = sf_client.query("SELECT COUNT() FROM Lead")['totalSize']
            logger.info(f"Found {lead_count} leads in system")
            
            if lead_count > 10:
                # Estimate time saved from automated lead assignment
                monthly_leads = lead_count / 12  # Rough estimate
                time_per_lead_assignment = 0.05  # 3 minutes per manual assignment
                monthly_time_saved = monthly_leads * time_per_lead_assignment
                
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Automation Opportunities",
                    "title": "Lead Assignment Automation Gap",
                    "description": f"With {lead_count} leads in the system, automated lead assignment rules could improve response times and ensure proper distribution among {active_users} users.",
                    "impact": "Medium",
                    "time_savings_hours": round(max(monthly_time_saved, 2.0), 1),
                    "recommendation": "Implement lead assignment rules based on territory, product interest, or lead source. Set up lead scoring for prioritization.",
                    "affected_objects": ["Lead", "Queue", "Assignment Rules"],
                    "salesforce_data": {
                        "total_leads": lead_count,
                        "estimated_monthly_leads": round(monthly_leads, 1),
                        "users_affected": active_users,
                        "automation_recommendation": "lead_assignment_rules"
                    }
                })
        except Exception as e:
            logger.warning(f"Error checking leads: {e}")
        
        # Report and dashboard optimization
        try:
            # This is always relevant for active orgs
            if active_users > 1:
                estimated_report_time = active_users * 2  # 2 hours per user per month on manual reporting
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "Automation Opportunities",
                    "title": "Manual Reporting Processes",
                    "description": f"With {active_users} active users, there's likely significant time spent on manual report generation and data analysis that could be automated with scheduled reports and dashboards.",
                    "impact": "Medium",
                    "time_savings_hours": round(estimated_report_time * 0.5, 1),  # 50% of manual time could be saved
                    "recommendation": "Set up scheduled report deliveries, dashboard subscriptions, and automated data exports. Create role-based dashboards for different user types.",
                    "affected_objects": ["Reports", "Dashboards", "Scheduled Jobs"],
                    "salesforce_data": {
                        "users_affected": active_users,
                        "estimated_manual_reporting_hours": estimated_report_time,
                        "automation_recommendation": "scheduled_reports_dashboards"
                    }
                })
        except Exception as e:
            logger.warning(f"Error analyzing reporting: {e}")
        
        logger.info(f"Automation analysis completed: {len(findings)} findings")
    
    except Exception as e:
        logger.error(f"Error analyzing automation: {e}")
    
    return findings

def run_salesforce_audit(access_token, instance_url):
    """Run comprehensive Salesforce audit"""
    findings = []
    
    try:
        # Initialize Salesforce client
        sf = Salesforce(instance_url=instance_url, session_id=access_token)
        
        # Get org context for realistic calculations
        org_context = get_org_context(sf)
        org_name = org_context['org_name']
        hourly_rate = org_context['estimated_hourly_rate']
        
        # Get org ID from context
        org_id = sf.query("SELECT Id FROM Organization LIMIT 1")['records'][0]['Id']
        
        logger.info(f"Starting audit for org: {org_name} (Type: {org_context['org_type']}, Users: {org_context['active_users']}, Rate: ${hourly_rate}/hr)")
        
        # Run analysis modules with org context
        findings.extend(analyze_custom_fields(sf, org_context))
        findings.extend(analyze_data_quality(sf, org_context))
        findings.extend(analyze_automation_opportunities(sf, org_context))
        
        # Calculate ROI for each finding using org-specific hourly rate
        for finding in findings:
            finding["roi_estimate"] = finding["time_savings_hours"] * hourly_rate * 12  # Annual
            # Add org context to finding
            finding["org_context"] = {
                "hourly_rate": hourly_rate,
                "active_users": org_context['active_users'],
                "org_type": org_context['org_type']
            }
        
        logger.info(f"Audit completed: {len(findings)} findings, estimated ${sum(f['roi_estimate'] for f in findings):,.0f} annual value")
        
        return findings, org_name, org_id
        
    except Exception as e:
        logger.error(f"Error running Salesforce audit: {e}")
        raise e

def run_salesforce_audit_with_stage_engine(access_token, instance_url, business_inputs=None, department_salaries=None, custom_assumptions=None):
    """
    Run comprehensive Salesforce audit with Alex Hormozi Stage Engine
    
    Args:
        access_token: Salesforce access token
        instance_url: Salesforce instance URL  
        business_inputs: BusinessInputs with revenue/headcount
        department_salaries: Optional department salary overrides
        custom_assumptions: Optional ROI calculation overrides
    """
    findings = []
    
    try:
        # Initialize Salesforce client
        sf = Salesforce(instance_url=instance_url, session_id=access_token)
        
        # Get org context for realistic calculations
        org_context = get_org_context(sf)
        org_name = org_context['org_name']
        org_id = sf.query("SELECT Id FROM Organization LIMIT 1")['records'][0]['Id']
        
        # Determine business stage
        if business_inputs:
            revenue = business_inputs.annual_revenue or 1000000
            headcount = business_inputs.employee_headcount or 50
        else:
            revenue = 1000000  # Default $1M
            headcount = 50     # Default 50 employees
            
        business_stage = determine_business_stage(revenue, headcount)
        
        logger.info(f"Starting Stage {business_stage['stage']} audit for org: {org_name}")
        logger.info(f"Stage: {business_stage['name']} ({business_stage['role']}) - {business_stage['bottom_line']}")
        logger.info(f"Revenue: ${revenue:,} | Headcount: {headcount} | Active SF Users: {org_context['active_users']}")
        
        # Run analysis modules
        custom_fields_findings = analyze_custom_fields(sf, org_context, department_salaries, custom_assumptions)
        data_quality_findings = analyze_data_quality(sf, org_context)
        automation_findings = analyze_automation_opportunities(sf, org_context)
        system_config_findings = analyze_system_configuration(sf, org_context)
        data_governance_findings = analyze_data_governance(sf, org_context)
        
        all_findings = []
        all_findings.extend(custom_fields_findings)
        all_findings.extend(data_quality_findings)
        all_findings.extend(automation_findings)
        all_findings.extend(system_config_findings)
        all_findings.extend(data_governance_findings)
        
        # Enhance each finding with stage-based analysis
        for finding in all_findings:
            # Add domain classification
            finding['domain'] = classify_finding_domain(finding)
            
            # Calculate stage-based priority
            finding['priority_score'] = calculate_finding_priority(finding, business_stage)
            
            # Calculate enhanced ROI using stage engine
            finding_data = {
                'title': finding.get('title', ''),
                'category': finding.get('category', ''),
                'description': finding.get('description', ''),
                'type': 'custom_fields' if 'custom fields' in finding.get('title', '').lower() else 'general',
                'field_count': finding.get('salesforce_data', {}).get('potentially_unused', 0),
                'record_count': finding.get('salesforce_data', {}).get('orphaned_opportunities', 0) or finding.get('salesforce_data', {}).get('stale_leads', 0),
                'estimated_monthly_hours': finding.get('time_savings_hours', 2.0)
            }
            
            enhanced_roi = calculate_task_based_roi(finding_data, org_context, business_stage, custom_assumptions)
            
            # Merge enhanced ROI data into finding
            finding.update({
                'stage_analysis': {
                    'current_stage': business_stage['stage'],
                    'stage_name': business_stage['name'],
                    'stage_role': business_stage['role'],
                    'stage_relevance': enhanced_roi['priority_score']
                },
                'enhanced_roi': enhanced_roi,
                'domain': enhanced_roi['domain'],
                'priority_score': enhanced_roi['priority_score'],
                'task_breakdown': enhanced_roi['task_breakdown'],
                'total_annual_roi': enhanced_roi['total_annual_roi'],
                'confidence_level': enhanced_roi['confidence']
            })
            
            # Update legacy fields for backward compatibility
            if enhanced_roi['total_annual_roi'] > 0:
                finding['roi_estimate'] = enhanced_roi['total_annual_roi']
            
        
        # Sort findings by priority score (descending)
        all_findings.sort(key=lambda x: x.get('priority_score', 0), reverse=True)
        
        logger.info(f"Stage {business_stage['stage']} audit completed: {len(all_findings)} findings")
        logger.info(f"Priority distribution: {[f['priority_score'] for f in all_findings[:5]]}")
        
        return all_findings, org_name, org_id, business_stage
        
    except Exception as e:
        logger.error(f"Error running stage-based audit: {e}")
        raise e

def run_salesforce_audit_with_salaries(access_token, instance_url, department_salaries=None, custom_assumptions=None):
    """Run comprehensive Salesforce audit with department salary calculations"""
    findings = []
    
    try:
        # Initialize Salesforce client
        sf = Salesforce(instance_url=instance_url, session_id=access_token)
        
        # Get org context for realistic calculations
        org_context = get_org_context(sf)
        org_name = org_context['org_name']
        hourly_rate = org_context['estimated_hourly_rate']
        
        # Get org ID from context
        org_id = sf.query("SELECT Id FROM Organization LIMIT 1")['records'][0]['Id']
        
        logger.info(f"Starting enhanced audit for org: {org_name} (Type: {org_context['org_type']}, Users: {org_context['active_users']}, Rate: ${hourly_rate}/hr)")
        
        # Run analysis modules with org context and department salaries
        custom_fields_findings = analyze_custom_fields(sf, org_context, department_salaries, custom_assumptions)
        data_quality_findings = analyze_data_quality(sf, org_context)
        automation_findings = analyze_automation_opportunities(sf, org_context)
        system_config_findings = analyze_system_configuration(sf, org_context)
        data_governance_findings = analyze_data_governance(sf, org_context)
        
        logger.info(f"Analysis results: Custom Fields={len(custom_fields_findings)}, Data Quality={len(data_quality_findings)}, Automation={len(automation_findings)}, System Config={len(system_config_findings)}, Data Governance={len(data_governance_findings)}")
        
        findings.extend(custom_fields_findings)
        findings.extend(data_quality_findings)
        findings.extend(automation_findings)
        findings.extend(system_config_findings)
        findings.extend(data_governance_findings)
        
        # Calculate ROI for each finding
        for finding in findings:
            if not department_salaries:
                # Fallback to old calculation method
                finding["roi_estimate"] = finding["time_savings_hours"] * hourly_rate * 12  # Annual
                # Add org context to finding
                finding["org_context"] = {
                    "hourly_rate": hourly_rate,
                    "active_users": org_context['active_users'],
                    "org_type": org_context['org_type']
                }
            # If department salaries were used, ROI is already calculated in analyze functions
        
        logger.info(f"Enhanced audit completed: {len(findings)} findings")
        
        return findings, org_name, org_id
        
    except Exception as e:
        logger.error(f"Error running enhanced Salesforce audit: {e}")
        raise e

def calculate_audit_summary(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate overall audit metrics"""
    total_time_savings = sum(f.get("time_savings_hours", 0) for f in findings)
    total_roi = sum(f.get("roi_estimate", 0) for f in findings)
    
    category_breakdown = {}
    for finding in findings:
        category = finding.get("category", "Unknown")
        if category not in category_breakdown:
            category_breakdown[category] = {"count": 0, "savings": 0, "roi": 0}
        category_breakdown[category]["count"] += 1
        category_breakdown[category]["savings"] += finding.get("time_savings_hours", 0)
        category_breakdown[category]["roi"] += finding.get("roi_estimate", 0)
    
    return {
        "total_findings": len(findings),
        "total_time_savings_hours": round(total_time_savings, 1),
        "total_annual_roi": round(total_roi, 0),
        "category_breakdown": category_breakdown,
        "high_impact_count": len([f for f in findings if f.get("impact") == "High"]),
        "medium_impact_count": len([f for f in findings if f.get("impact") == "Medium"]),
        "low_impact_count": len([f for f in findings if f.get("impact") == "Low"])
    }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Salesforce Audit API - Real Integration"}

@api_router.get("/oauth/authorize")
async def salesforce_oauth_authorize():
    """Initiate Salesforce OAuth flow"""
    try:
        # Generate state parameter for security
        state = str(uuid.uuid4())
        
        # Store state in database with expiration
        await db.oauth_states.insert_one({
            "state": state,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=10)
        })
        
        # Build authorization URL
        auth_params = {
            'response_type': 'code',
            'client_id': SALESFORCE_CLIENT_ID,
            'redirect_uri': SALESFORCE_CALLBACK_URL,
            'scope': 'api refresh_token',
            'state': state
        }
        
        auth_url = f"{SALESFORCE_LOGIN_URL}/services/oauth2/authorize?{urlencode(auth_params)}"
        
        # Redirect to Salesforce instead of returning JSON
        return RedirectResponse(url=auth_url, status_code=302)
        
    except Exception as e:
        logger.error(f"OAuth authorize error: {e}")
        raise HTTPException(status_code=500, detail=f"OAuth setup failed: {str(e)}")

@api_router.get("/oauth/callback")
async def salesforce_oauth_callback(request: Request, code: str = Query(...), state: str = Query(...)):
    """Handle Salesforce OAuth callback"""
    try:
        logger.info(f"OAuth callback received with state: {state}")
        
        # Verify state parameter
        stored_state = await db.oauth_states.find_one({
            "state": state,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not stored_state:
            logger.error(f"Invalid or expired state parameter: {state}")
            raise HTTPException(status_code=400, detail="Invalid or expired state parameter")
        
        logger.info("State parameter validated successfully")
        
        # Exchange code for access token
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': SALESFORCE_CLIENT_ID,
            'client_secret': SALESFORCE_CLIENT_SECRET,
            'redirect_uri': SALESFORCE_CALLBACK_URL,
            'code': code
        }
        
        logger.info("Exchanging authorization code for access token")
        token_response = requests.post(
            f"{SALESFORCE_LOGIN_URL}/services/oauth2/token",
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if token_response.status_code != 200:
            logger.error(f"Token exchange failed: {token_response.status_code} - {token_response.text}")
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")
        
        token_info = token_response.json()
        logger.info(f"Token exchange successful. Instance URL: {token_info['instance_url']}")
        
        # Clean up state
        await db.oauth_states.delete_one({"state": state})
        
        # Store session info temporarily (in production, use secure session storage)
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "access_token": token_info['access_token'],
            "instance_url": token_info['instance_url'],
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=2)
        }
        
        await db.oauth_sessions.insert_one(session_data)
        logger.info(f"OAuth session created: {session_id}")
        
        # Instead of redirect, return HTML that will handle the redirect with JavaScript
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Salesforce Connected Successfully</title>
            <style>
                body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                .success {{ color: #10b981; font-size: 24px; margin-bottom: 20px; }}
                .message {{ color: #6b7280; font-size: 16px; }}
            </style>
        </head>
        <body>
            <div class="success">✅ Successfully Connected to Salesforce!</div>
            <div class="message">Redirecting to dashboard...</div>
            <script>
                // Store session in localStorage and redirect
                localStorage.setItem('salesforce_session_id', '{session_id}');
                setTimeout(function() {{
                    window.location.href = '/dashboard';
                }}, 2000);
            </script>
        </body>
        </html>
        """
        
        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=html_content)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OAuth callback error: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"OAuth callback failed: {str(e)}")

@api_router.post("/audit/run")
async def run_audit(audit_request: AuditRequest):
    """Run audit analysis with new ROI calculation method"""
    try:
        session_id = audit_request.session_id
        department_salaries = audit_request.department_salaries
        use_quick_estimate = audit_request.use_quick_estimate
        
        logger.info(f"Starting audit for session: {session_id} (Quick estimate: {use_quick_estimate})")
        
        # Get OAuth session
        oauth_session = await db.oauth_sessions.find_one({
            "session_id": session_id,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not oauth_session:
            raise HTTPException(status_code=401, detail="Invalid or expired session")
        
        access_token = oauth_session['access_token']
        instance_url = oauth_session['instance_url']
        
        # Run Salesforce audit in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        
        # Convert department salaries to dict if provided
        dept_salaries_dict = None
        if department_salaries and not use_quick_estimate:
            # Only use department salaries if at least one value is provided
            has_custom_values = any([
                department_salaries.customer_service,
                department_salaries.sales,
                department_salaries.marketing,
                department_salaries.engineering,
                department_salaries.executives
            ])
            
            if has_custom_values:
                dept_salaries_dict = {
                    'customer_service': department_salaries.customer_service,
                    'sales': department_salaries.sales,
                    'marketing': department_salaries.marketing,
                    'engineering': department_salaries.engineering,
                    'executives': department_salaries.executives
                }
                logger.info("Using custom department salaries for audit")
            else:
                logger.info("No custom salaries provided, falling back to defaults")
                # Still use custom calculation but with all defaults
                dept_salaries_dict = {
                    'customer_service': None,
                    'sales': None,
                    'marketing': None,
                    'engineering': None,
                    'executives': None
                }
        
        findings_data, org_name, org_id = await loop.run_in_executor(
            executor, run_salesforce_audit_with_stage_engine, access_token, instance_url, None, dept_salaries_dict, None
        )
        
        # Calculate summary
        if dept_salaries_dict:
            # New calculation method
            total_cleanup_cost = sum(f.get('cleanup_cost', 0) for f in findings_data)
            total_monthly_savings = sum(f.get('monthly_user_savings', 0) for f in findings_data)
            total_annual_savings = sum(f.get('annual_user_savings', 0) for f in findings_data)
            total_net_roi = sum(f.get('net_annual_roi', 0) for f in findings_data)
            total_monthly_hours = sum(f.get('monthly_savings_hours', 0) for f in findings_data)
            
            summary = {
                "total_findings": len(findings_data),
                "total_time_savings_hours": round(total_monthly_hours, 1),
                "total_annual_roi": round(total_net_roi, 0),
                "total_cleanup_cost": round(total_cleanup_cost, 0),
                "total_monthly_savings": round(total_monthly_savings, 0),
                "total_annual_savings": round(total_annual_savings, 0),
                "calculation_method": "department_salaries"
            }
        else:
            # Fallback to old method
            summary = calculate_audit_summary(findings_data)
            summary["calculation_method"] = "quick_estimate"
        
        logger.info(f"Generated {len(findings_data)} findings for {org_name}")
        
        # Create audit session
        audit_session_id = str(uuid.uuid4())
        session_data = {
            "id": audit_session_id,
            "org_name": org_name,
            "org_id": org_id,
            "created_at": datetime.utcnow(),
            "status": "completed",
            "findings_count": len(findings_data),
            "estimated_savings": {
                "monthly_hours": float(summary.get("total_time_savings_hours", 0)),
                "annual_dollars": float(summary.get("total_annual_roi", 0)),
                "cleanup_cost": float(summary.get("total_cleanup_cost", 0)),
                "calculation_method": summary.get("calculation_method", "quick_estimate")
            },
            "instance_url": instance_url
        }
        
        # Store session in database
        await db.audit_sessions.insert_one(session_data)
        
        # Store findings
        findings_to_store = []
        for finding in findings_data:
            finding_copy = finding.copy()
            finding_copy["session_id"] = audit_session_id
            findings_to_store.append(finding_copy)
        
        await db.audit_findings.insert_many(findings_to_store)
        
        # Create clean response
        response_data = {
            "session_id": audit_session_id,
            "org_name": org_name,
            "summary": summary,
            "findings": findings_data
        }
        
        logger.info("Enhanced Salesforce audit completed successfully")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in run_audit: {str(e)}")
        return {"error": f"Audit failed: {str(e)}", "session_id": None}

@api_router.get("/debug/sessions")
async def debug_oauth_sessions():
    """Debug endpoint to see current OAuth sessions"""
    try:
        sessions = await db.oauth_sessions.find().to_list(10)
        current_time = datetime.utcnow()
        
        result = []
        for session in sessions:
            session_data = convert_objectid(session)
            session_data['is_expired'] = session_data.get('expires_at', current_time) < current_time
            result.append(session_data)
        
        return {"current_time": current_time.isoformat(), "oauth_sessions": result}
    except Exception as e:
        return {"error": str(e)}

@api_router.get("/audit/sessions")
async def get_audit_sessions():
    """Get all audit sessions"""
    try:
        sessions = await db.audit_sessions.find().to_list(50)
        result = []
        for session in sessions:
            session_data = convert_objectid(session)
            # Normalize created_at to datetime object for sorting
            created_at = session_data.get('created_at')
            if isinstance(created_at, str):
                try:
                    session_data['created_at'] = datetime.fromisoformat(created_at)
                except:
                    session_data['created_at'] = datetime.utcnow()
            elif not isinstance(created_at, datetime):
                session_data['created_at'] = datetime.utcnow()
            result.append(session_data)
        
        # Sort by created_at descending in Python
        result.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Convert datetime back to ISO string for JSON serialization
        for session in result:
            if isinstance(session['created_at'], datetime):
                session['created_at'] = session['created_at'].isoformat()
        
        return result
    except Exception as e:
        logger.error(f"Error in get_audit_sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

@api_router.get("/audit/{session_id}")
async def get_audit_details(session_id: str):
    """Get detailed audit results"""
    try:
        # Get session
        session = await db.audit_sessions.find_one({"id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Audit session not found")
        
        # Get findings
        findings = await db.audit_findings.find({"session_id": session_id}).to_list(100)
        
        # Convert ObjectIds to strings
        session = convert_objectid(session)
        findings = [convert_objectid(finding) for finding in findings]
        
        # Calculate summary from findings data
        total_time_savings = sum(f.get("time_savings_hours", 0) for f in findings)
        total_roi = sum(f.get("roi_estimate", 0) for f in findings)
        
        category_breakdown = {}
        for finding in findings:
            category = finding.get("category", "Unknown")
            if category not in category_breakdown:
                category_breakdown[category] = {"count": 0, "savings": 0, "roi": 0}
            category_breakdown[category]["count"] += 1
            category_breakdown[category]["savings"] += finding.get("time_savings_hours", 0)
            category_breakdown[category]["roi"] += finding.get("roi_estimate", 0)
        
        summary = {
            "total_findings": len(findings),
            "total_time_savings_hours": round(total_time_savings, 1),
            "total_annual_roi": round(total_roi, 0),
            "category_breakdown": category_breakdown,
            "high_impact_count": len([f for f in findings if f.get("impact") == "High"]),
            "medium_impact_count": len([f for f in findings if f.get("impact") == "Medium"]),
            "low_impact_count": len([f for f in findings if f.get("impact") == "Low"])
        }
        
        return {
            "session": session,
            "summary": summary,
            "findings": findings
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_audit_details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get audit details: {str(e)}")

@api_router.post("/audit/{session_id}/update-assumptions")
async def update_audit_assumptions(session_id: str, assumptions: AssumptionsUpdate):
    """Update audit assumptions and recalculate ROI"""
    try:
        logger.info(f"Updating assumptions for session: {session_id}")
        
        # Get the existing audit session 
        session = await db.audit_sessions.find_one({"id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Audit session not found")
        
        # Find the corresponding OAuth session to get access tokens
        oauth_sessions = await db.oauth_sessions.find({
            "expires_at": {"$gt": datetime.utcnow()}
        }).to_list(10)
        
        if not oauth_sessions:
            raise HTTPException(status_code=401, detail="No valid OAuth session found. Please reconnect to Salesforce.")
        
        # Use the most recent OAuth session (assumes same user)
        oauth_session = oauth_sessions[0]
        access_token = oauth_session['access_token']
        instance_url = oauth_session['instance_url']
        
        # Convert assumptions to dict, filtering out None values
        custom_assumptions = {}
        assumption_dict = assumptions.dict()
        for key, value in assumption_dict.items():
            if value is not None:
                custom_assumptions[key] = value
        
        logger.info(f"Custom assumptions: {custom_assumptions}")
        
        # Re-run the audit with custom assumptions
        loop = asyncio.get_event_loop()
        
        # Note: We'll use empty department salaries as we're only updating assumptions
        # In a full implementation, you might want to store original department salaries
        findings_data, org_name, org_id = await loop.run_in_executor(
            executor, run_salesforce_audit_with_salaries, access_token, instance_url, None, custom_assumptions
        )
        
        # Calculate new summary
        total_cleanup_cost = sum(f.get('cleanup_cost', 0) for f in findings_data)
        total_monthly_savings = sum(f.get('monthly_user_savings', 0) for f in findings_data)
        total_annual_savings = sum(f.get('annual_user_savings', 0) for f in findings_data)
        total_net_roi = sum(f.get('net_annual_roi', 0) for f in findings_data)
        total_monthly_hours = sum(f.get('monthly_savings_hours', 0) for f in findings_data)
        
        summary = {
            "total_findings": len(findings_data),
            "total_time_savings_hours": round(total_monthly_hours, 1),
            "total_annual_roi": round(total_net_roi, 0),
            "total_cleanup_cost": round(total_cleanup_cost, 0),
            "total_monthly_savings": round(total_monthly_savings, 0),
            "total_annual_savings": round(total_annual_savings, 0),
            "calculation_method": "custom_assumptions",
            "assumptions_used": custom_assumptions
        }
        
        # Update the stored session data
        await db.audit_sessions.update_one(
            {"id": session_id},
            {
                "$set": {
                    "estimated_savings": {
                        "monthly_hours": float(summary.get("total_time_savings_hours", 0)),
                        "annual_dollars": float(summary.get("total_annual_roi", 0)),
                        "cleanup_cost": float(summary.get("total_cleanup_cost", 0)),
                        "calculation_method": summary.get("calculation_method", "custom_assumptions")
                    },
                    "updated_at": datetime.utcnow().isoformat(),
                    "custom_assumptions": custom_assumptions
                }
            }
        )
        
        # Update stored findings
        await db.audit_findings.delete_many({"session_id": session_id})
        
        findings_to_store = []
        for finding in findings_data:
            finding_copy = finding.copy()
            finding_copy["session_id"] = session_id
            findings_to_store.append(finding_copy)
        
        await db.audit_findings.insert_many(findings_to_store)
        
        logger.info(f"Updated audit with custom assumptions: {len(findings_data)} findings")
        
        return {
            "session_id": session_id,
            "summary": summary,
            "findings": findings_data,
            "message": "Audit assumptions updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating assumptions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update assumptions: {str(e)}")

@api_router.get("/audit/{session_id}/pdf")
async def generate_pdf_report(session_id: str):
    """Generate PDF report (mock endpoint)"""
    return {
        "download_url": f"/api/downloads/audit-report-{session_id}.pdf",
        "message": "PDF report generated successfully"
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()