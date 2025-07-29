#!/usr/bin/env python3
"""
FRONTEND-BACKEND DATA MAPPING INVESTIGATION
===========================================

This test investigates the mismatch between what the frontend expects 
and what the backend provides for ROI data display.
"""

import requests
import json

class DataMappingInvestigator:
    def __init__(self, base_url="https://dd6a7962-9851-4337-9e39-7a17a3866ce2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
    
    def investigate_session_data_structure(self):
        """Check what the backend actually returns vs what frontend expects"""
        print("🔍 INVESTIGATING SESSION DATA STRUCTURE MISMATCH")
        print("=" * 70)
        
        # Get sessions from backend
        response = requests.get(f"{self.api_url}/audit/sessions")
        if response.status_code != 200:
            print(f"❌ Failed to get sessions: {response.status_code}")
            return
        
        sessions = response.json()
        if not sessions:
            print("❌ No sessions found")
            return
        
        print(f"✅ Found {len(sessions)} sessions")
        
        # Analyze first session structure
        session = sessions[0]
        print(f"\n📊 ACTUAL SESSION DATA STRUCTURE:")
        print(f"   Session ID: {session.get('id', 'missing')}")
        print(f"   Org Name: {session.get('org_name', 'missing')}")
        print(f"   Findings Count: {session.get('findings_count', 'missing')}")
        print(f"   Estimated Savings: {session.get('estimated_savings', 'missing')}")
        print(f"   Created At: {session.get('created_at', 'missing')}")
        
        # Check what frontend expects vs what backend provides
        print(f"\n🔍 FRONTEND EXPECTATIONS vs BACKEND REALITY:")
        print(f"   Frontend expects: total_findings")
        print(f"   Backend provides: findings_count = {session.get('findings_count', 'missing')}")
        
        print(f"   Frontend expects: total_annual_roi (on session)")
        backend_annual = session.get('estimated_savings', {}).get('annual_dollars', 'missing')
        print(f"   Backend provides: estimated_savings.annual_dollars = {backend_annual}")
        
        # Get detailed session to check findings structure
        session_id = session['id']
        detail_response = requests.get(f"{self.api_url}/audit/{session_id}")
        
        if detail_response.status_code != 200:
            print(f"❌ Failed to get session details: {detail_response.status_code}")
            return
        
        session_details = detail_response.json()
        findings = session_details.get('findings', [])
        
        if findings:
            finding = findings[0]
            print(f"\n📊 ACTUAL FINDING DATA STRUCTURE:")
            print(f"   Finding ID: {finding.get('id', 'missing')}")
            print(f"   Title: {finding.get('title', 'missing')}")
            print(f"   ROI Estimate: {finding.get('roi_estimate', 'missing')}")
            print(f"   Total Annual ROI: {finding.get('total_annual_roi', 'missing')}")
            print(f"   Annual User Savings: {finding.get('annual_user_savings', 'missing')}")
            print(f"   Monthly User Savings: {finding.get('monthly_user_savings', 'missing')}")
            
            print(f"\n🔍 FINDING ROI FIELD ANALYSIS:")
            print(f"   Frontend looks for: finding.total_annual_roi || finding.roi_estimate || 0")
            total_annual_roi = finding.get('total_annual_roi', 'missing')
            roi_estimate = finding.get('roi_estimate', 'missing')
            print(f"   total_annual_roi = {total_annual_roi}")
            print(f"   roi_estimate = {roi_estimate}")
            
            # Calculate what frontend would display
            if total_annual_roi != 'missing' and total_annual_roi != 0:
                display_value = total_annual_roi
                source = "total_annual_roi"
            elif roi_estimate != 'missing' and roi_estimate != 0:
                display_value = roi_estimate
                source = "roi_estimate"
            else:
                display_value = 0
                source = "default"
            
            print(f"   Frontend would display: ${display_value}/yr (from {source})")
            
            if display_value == 0:
                print(f"   ❌ THIS IS WHY FRONTEND SHOWS $0/yr!")
            else:
                print(f"   ✅ Frontend should show meaningful value")
        
        # Check session card data mapping
        print(f"\n🔍 SESSION CARD DATA MAPPING ISSUE:")
        print(f"   SessionCard expects: total_annual_roi (direct on session)")
        print(f"   Backend provides: estimated_savings.annual_dollars")
        print(f"   SessionCard expects: total_findings")
        print(f"   Backend provides: findings_count")
        
        print(f"\n💡 SOLUTION NEEDED:")
        print(f"   1. Frontend should use 'findings_count' instead of 'total_findings'")
        print(f"   2. Frontend should use 'estimated_savings.annual_dollars' for session savings")
        print(f"   3. Or backend should add 'total_annual_roi' and 'total_findings' to session objects")

if __name__ == "__main__":
    investigator = DataMappingInvestigator()
    investigator.investigate_session_data_structure()