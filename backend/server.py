from fastapi import FastAPI, APIRouter, HTTPException
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class AuditSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    org_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "completed"
    findings_count: int
    estimated_savings: Dict[str, float]

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

class OAuthRequest(BaseModel):
    org_name: Optional[str] = "Demo Salesforce Org"

# Mock Salesforce Data Generator
def generate_mock_audit_data():
    """Generate realistic audit findings"""
    
    findings_data = [
        # Time Savings Category
        {
            "category": "Time Savings",
            "title": "Unused Custom Fields Detected",
            "description": "Found 47 custom fields across 12 objects that haven't been populated in the last 90 days. These fields are cluttering your page layouts and confusing users.",
            "impact": "Medium",
            "time_savings_hours": 8.5,
            "recommendation": "Remove or consolidate unused fields to simplify user experience. Consider field usage reports before deletion.",
            "affected_objects": ["Account", "Contact", "Opportunity", "Lead", "Case"]
        },
        {
            "category": "Time Savings", 
            "title": "Duplicate Validation Rules",
            "description": "Identified 6 validation rules with overlapping logic that could be consolidated into 2 comprehensive rules.",
            "impact": "Low",
            "time_savings_hours": 2.0,
            "recommendation": "Consolidate validation rules to reduce maintenance overhead and improve performance.",
            "affected_objects": ["Account", "Opportunity"]
        },
        {
            "category": "Time Savings",
            "title": "Inactive User Licenses",
            "description": "12 users haven't logged in within the last 60 days but still consume licenses ($1,800/month in unused license costs).",
            "impact": "High", 
            "time_savings_hours": 1.0,
            "recommendation": "Deactivate unused accounts and reallocate licenses to active team members.",
            "affected_objects": ["User Management"]
        },
        
        # Revenue Leaks Category
        {
            "category": "Revenue Leaks",
            "title": "Orphaned Opportunity Records",
            "description": "Found 234 opportunities worth $2.3M total that lack proper account associations, making pipeline reporting inaccurate.",
            "impact": "High",
            "time_savings_hours": 12.0,
            "recommendation": "Implement data quality rules and assign team to clean up orphaned records. Set up validation rules to prevent future occurrences.",
            "affected_objects": ["Opportunity", "Account"]
        },
        {
            "category": "Revenue Leaks",
            "title": "Missing Required Fields in Deals",
            "description": "38% of opportunities are missing critical fields like 'Next Steps' and 'Decision Maker', reducing forecast accuracy.",
            "impact": "High",
            "time_savings_hours": 6.0,
            "recommendation": "Make critical fields required and train sales team on proper data entry practices.",
            "affected_objects": ["Opportunity"]
        },
        {
            "category": "Revenue Leaks",
            "title": "Stale Lead Records",
            "description": "1,847 leads haven't been touched in 6+ months, representing potential lost revenue of ~$500K based on historical conversion rates.",
            "impact": "Medium",
            "time_savings_hours": 15.0,
            "recommendation": "Implement lead scoring and automated nurture campaigns. Archive truly cold leads.",
            "affected_objects": ["Lead", "Campaign"]
        },
        
        # Automation Opportunities  
        {
            "category": "Automation Opportunities",
            "title": "Manual Case Assignment Process",
            "description": "Support team manually assigns 90% of incoming cases, causing 4-hour average response delays.",
            "impact": "High",
            "time_savings_hours": 25.0,
            "recommendation": "Implement case assignment rules based on product, region, and expertise. Add escalation workflows.",
            "affected_objects": ["Case", "Queue"]
        },
        {
            "category": "Automation Opportunities", 
            "title": "Email Alerts Not Configured",
            "description": "Key business processes lack proper notifications, causing delays in follow-ups and approvals.",
            "impact": "Medium",
            "time_savings_hours": 8.0,
            "recommendation": "Set up email alerts for opportunity stage changes, case escalations, and lead assignments.",
            "affected_objects": ["Workflow", "Process Builder"]
        },
        {
            "category": "Automation Opportunities",
            "title": "Manual Report Generation",
            "description": "Sales managers spend 5 hours weekly manually creating reports that could be automated with scheduled deliveries.",
            "impact": "Medium", 
            "time_savings_hours": 20.0,
            "recommendation": "Set up scheduled report deliveries and dashboard subscriptions for key stakeholders.",
            "affected_objects": ["Report", "Dashboard"]
        }
    ]
    
    # Calculate ROI (assuming $75/hour average rate)
    hourly_rate = 75
    findings = []
    
    for finding_data in findings_data:
        roi = finding_data["time_savings_hours"] * hourly_rate * 12  # Annual savings
        finding = AuditFinding(
            **finding_data,
            roi_estimate=roi
        )
        findings.append(finding)
    
    return findings

def calculate_audit_summary(findings: List[AuditFinding]) -> Dict[str, Any]:
    """Calculate overall audit metrics"""
    total_time_savings = sum(f.time_savings_hours for f in findings)
    total_roi = sum(f.roi_estimate for f in findings)
    
    category_breakdown = {}
    for finding in findings:
        if finding.category not in category_breakdown:
            category_breakdown[finding.category] = {"count": 0, "savings": 0, "roi": 0}
        category_breakdown[finding.category]["count"] += 1
        category_breakdown[finding.category]["savings"] += finding.time_savings_hours
        category_breakdown[finding.category]["roi"] += finding.roi_estimate
    
    return {
        "total_findings": len(findings),
        "total_time_savings_hours": round(total_time_savings, 1),
        "total_annual_roi": round(total_roi, 0),
        "category_breakdown": category_breakdown,
        "high_impact_count": len([f for f in findings if f.impact == "High"]),
        "medium_impact_count": len([f for f in findings if f.impact == "Medium"]),
        "low_impact_count": len([f for f in findings if f.impact == "Low"])
    }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Salesforce Audit API"}

@api_router.post("/oauth/connect")
async def mock_oauth_connect(request: OAuthRequest):
    """Simulate Salesforce OAuth connection"""
    # In real implementation, this would handle OAuth flow
    return {
        "success": True,
        "org_name": request.org_name,
        "message": "Successfully connected to Salesforce!",
        "connection_id": str(uuid.uuid4())
    }

@api_router.post("/audit/run")
async def run_audit():
    """Run audit analysis with mock data"""
    # Generate mock findings
    findings = generate_mock_audit_data()
    summary = calculate_audit_summary(findings)
    
    # Create audit session
    session = AuditSession(
        org_name="Demo Salesforce Org",
        findings_count=len(findings),
        estimated_savings={
            "monthly_hours": summary["total_time_savings_hours"],
            "annual_dollars": summary["total_annual_roi"]
        }
    )
    
    # Store in database
    await db.audit_sessions.insert_one(session.dict())
    
    # Store findings
    findings_dict = [f.dict() for f in findings]
    for finding_dict in findings_dict:
        finding_dict["session_id"] = session.id
    
    await db.audit_findings.insert_many(findings_dict)
    
    return {
        "session_id": session.id,
        "summary": summary,
        "findings": findings_dict
    }

@api_router.get("/audit/sessions")
async def get_audit_sessions():
    """Get all audit sessions"""
    sessions = await db.audit_sessions.find().sort("created_at", -1).to_list(50)
    return [AuditSession(**session) for session in sessions]

@api_router.get("/audit/{session_id}")
async def get_audit_details(session_id: str):
    """Get detailed audit results"""
    # Get session
    session = await db.audit_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Audit session not found")
    
    # Get findings
    findings = await db.audit_findings.find({"session_id": session_id}).to_list(100)
    
    # Calculate summary
    findings_objects = [AuditFinding(**f) for f in findings]
    summary = calculate_audit_summary(findings_objects)
    
    return {
        "session": AuditSession(**session),
        "summary": summary,
        "findings": findings
    }

@api_router.get("/audit/{session_id}/pdf")
async def generate_pdf_report(session_id: str):
    """Generate PDF report (mock endpoint)"""
    # In real implementation, this would generate actual PDF
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