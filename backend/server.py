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

class AuditRequest(BaseModel):
    session_id: str
    department_salaries: Optional[DepartmentSalaries] = None
    use_quick_estimate: bool = True
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
    for dept, salary in department_salaries.items():
        if salary and salary > 0:
            dept_hourly_rates[dept] = salary / HOURS_PER_YEAR
        else:
            dept_hourly_rates[dept] = DEFAULT_SALARIES.get(dept, 50000) / HOURS_PER_YEAR
    
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
def analyze_custom_fields(sf_client, org_context, department_salaries=None):
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
            
            # Use new ROI calculation if department salaries provided
            if department_salaries:
                finding_data = {
                    'category': 'Time Savings',
                    'title': f'{unused_field_count} Potentially Unused Custom Fields',
                    'field_count': unused_field_count
                }
                roi_calc = calculate_roi_with_department_salaries(finding_data, department_salaries, active_users)
                
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
                    "recommendation": "Review field usage reports and consider removing or consolidating unused custom fields. Start with fields that have no default values and are not required.",
                    "affected_objects": key_objects,
                    "salesforce_data": {
                        "total_custom_fields": custom_field_count,
                        "potentially_unused": unused_field_count,
                        "analysis_criteria": "Fields with no formula, default value, or required flag",
                        "objects_analyzed": len(key_objects),
                        "users_affected": active_users,
                        "calculation_method": f"One-time: {unused_field_count} fields × 15min × $40/hr = ${roi_calc['cleanup_cost']}. Monthly: {active_users} users × 2min/field × {unused_field_count} fields = {roi_calc['monthly_savings_hours']}h × ${roi_calc['avg_hourly_rate']}/hr = ${roi_calc['monthly_user_savings']}/month",
                        "roi_breakdown": roi_calc['calculation_details']
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
        
        # Check for orphaned opportunities (no account)
        orphaned_opps = sf_client.query("SELECT COUNT() FROM Opportunity WHERE AccountId = null")
        orphaned_count = orphaned_opps['totalSize']
        
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
        
        # Check for leads without activity
        stale_leads = sf_client.query("SELECT COUNT() FROM Lead WHERE LastActivityDate < LAST_N_DAYS:180")
        stale_count = stale_leads['totalSize']
        
        if stale_count > 0:
            # Scale time based on actual volume and team size
            base_review_time = min(stale_count * 0.05, 20)  # 3 min per lead, max 20 hours
            process_improvement_time = 2  # Time to set up automation
            total_time = (base_review_time + process_improvement_time) * complexity_multiplier
            
            findings.append({
                "id": str(uuid.uuid4()),
                "category": "Revenue Leaks",
                "title": f"{stale_count} Stale Lead Records",
                "description": f"{stale_count} leads haven't had activity in 180+ days, representing potential lost revenue. With {active_users} users, this indicates process gaps in lead management.",
                "impact": "High" if stale_count > 500 else "Medium",
                "time_savings_hours": round(total_time, 1),
                "recommendation": "Implement lead scoring and automated nurture campaigns. Archive truly cold leads and improve lead assignment processes.",
                "affected_objects": ["Lead", "Campaign"],
                "salesforce_data": {
                    "stale_leads": stale_count,
                    "query_used": "SELECT COUNT() FROM Lead WHERE LastActivityDate < LAST_N_DAYS:180",
                    "users_affected": active_users,
                    "calculation_method": f"Review time (3 min/lead, max 20h) + process setup (2h), scaled by complexity ({complexity_multiplier:.1f}x)"
                }
            })
    
    except Exception as e:
        logger.error(f"Error analyzing data quality: {e}")
    
    return findings

def analyze_automation_opportunities(sf_client, org_context):
    """Analyze automation opportunities"""
    findings = []
    
    try:
        active_users = org_context.get('active_users', 10)
        complexity_multiplier = org_context.get('complexity_multiplier', 1.0)
        
        # Check for manual case assignment (simplified)
        case_count = sf_client.query("SELECT COUNT() FROM Case")['totalSize']
        
        if case_count > 10:  # If they have cases, likely need automation
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
                "time_savings_hours": round(monthly_time_saved, 1),
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
        
        # Check workflow rules vs Flow usage - always recommend this for orgs with data
        if org_context.get('opportunity_count', 0) > 10:
            # Base time for modernization effort, scaled by org complexity
            base_modernization_time = 8  # Base hours for analysis and planning
            implementation_time = active_users * 0.5  # 30 min per user for training
            total_time = (base_modernization_time + implementation_time) * complexity_multiplier
            
            findings.append({
                "id": str(uuid.uuid4()),
                "category": "Automation Opportunities",
                "title": "Process Automation Modernization",
                "description": f"With {active_users} users and {org_context.get('opportunity_count', 'multiple')} opportunities, migrating legacy automation to Flow can improve performance and maintainability.",
                "impact": "Medium",
                "time_savings_hours": round(total_time, 1),
                "recommendation": "Audit existing workflow rules and process builders. Migrate to Flow for better performance, debugging capabilities, and future maintainability.",
                "affected_objects": ["Workflow", "Process Builder", "Flow"],
                "salesforce_data": {
                    "modernization_target": "flows",
                    "legacy_automation": "workflow_rules_process_builders",
                    "users_affected": active_users,
                    "opportunities_count": org_context.get('opportunity_count', 0),
                    "calculation_method": f"Analysis time (8h) + user training ({active_users} × 30min) × complexity ({complexity_multiplier:.1f}x)"
                }
            })
    
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
        
        return {"authorization_url": auth_url, "state": state}
        
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
async def run_audit(session_id: str = Query(...)):
    """Run audit analysis with real Salesforce data"""
    try:
        logger.info(f"Starting audit for session: {session_id}")
        
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
        findings_data, org_name, org_id = await loop.run_in_executor(
            executor, run_salesforce_audit, access_token, instance_url
        )
        
        summary = calculate_audit_summary(findings_data)
        
        logger.info(f"Generated {len(findings_data)} findings for {org_name}")
        
        # Create audit session
        audit_session_id = str(uuid.uuid4())
        session_data = {
            "id": audit_session_id,
            "org_name": org_name,
            "org_id": org_id,
            "created_at": datetime.utcnow().isoformat(),
            "status": "completed",
            "findings_count": len(findings_data),
            "estimated_savings": {
                "monthly_hours": float(summary["total_time_savings_hours"]),
                "annual_dollars": float(summary["total_annual_roi"])
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
            "summary": {
                "total_findings": int(summary["total_findings"]),
                "total_time_savings_hours": float(summary["total_time_savings_hours"]),
                "total_annual_roi": float(summary["total_annual_roi"]),
                "category_breakdown": summary["category_breakdown"],
                "high_impact_count": int(summary["high_impact_count"]),
                "medium_impact_count": int(summary["medium_impact_count"]),
                "low_impact_count": int(summary["low_impact_count"])
            },
            "findings": findings_data
        }
        
        logger.info("Real Salesforce audit completed successfully")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in run_audit: {str(e)}")
        return {"error": f"Audit failed: {str(e)}", "session_id": None}

@api_router.get("/audit/sessions")
async def get_audit_sessions():
    """Get all audit sessions"""
    try:
        sessions = await db.audit_sessions.find().sort("created_at", -1).to_list(50)
        result = []
        for session in sessions:
            session_data = convert_objectid(session)
            # Convert datetime string back if needed
            if isinstance(session_data.get('created_at'), str):
                try:
                    session_data['created_at'] = datetime.fromisoformat(session_data['created_at'])
                except:
                    session_data['created_at'] = datetime.utcnow()
            result.append(session_data)
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