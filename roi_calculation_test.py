#!/usr/bin/env python3
"""
ROI CALCULATION INVESTIGATION TEST
==================================

This test specifically investigates the ROI calculation issue where removing 18 unused custom fields 
is showing $15,682/yr in savings, which seems unrealistic.

The test will:
1. Get the exact calculation breakdown for "18 Potentially Unused Custom Fields" finding
2. Check the input values being used (field_count, active_users, business_stage, hourly rates)
3. Trace the formula step-by-step
4. Test with realistic assumptions
"""

import requests
import json
import sys
from datetime import datetime

class ROICalculationInvestigator:
    def __init__(self, base_url="https://0c6c660a-787f-48ab-8364-a6e87a12d36b.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        
    def log_section(self, title):
        """Print a formatted section header"""
        print(f"\n{'='*60}")
        print(f"🔍 {title}")
        print(f"{'='*60}")
        
    def log_subsection(self, title):
        """Print a formatted subsection header"""
        print(f"\n{'-'*50}")
        print(f"📋 {title}")
        print(f"{'-'*50}")
        
    def make_request(self, method, endpoint, data=None, params=None):
        """Make an API request and return response"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=10)
            
            print(f"   Request: {method} {url}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                return True, response.json()
            else:
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                    return False, error_data
                except:
                    print(f"   Error: {response.text}")
                    return False, {"error": response.text}
                    
        except Exception as e:
            print(f"   Exception: {str(e)}")
            return False, {"error": str(e)}
    
    def investigate_roi_calculation(self):
        """Main investigation function"""
        self.log_section("ROI CALCULATION INVESTIGATION")
        print("Investigating why 18 unused custom fields shows $15,682/yr savings")
        
        # Step 1: Get existing audit sessions to find custom fields findings
        self.log_subsection("1. FINDING EXISTING CUSTOM FIELDS FINDINGS")
        
        success, sessions = self.make_request("GET", "audit/sessions")
        if not success:
            print("❌ Failed to get audit sessions")
            return False
            
        print(f"✅ Found {len(sessions)} audit sessions")
        
        # Look for sessions with custom fields findings
        custom_fields_sessions = []
        for session in sessions:
            if session.get('findings_count', 0) > 0:
                # Check if this session might have custom fields findings
                estimated_savings = session.get('estimated_savings', {})
                annual_dollars = estimated_savings.get('annual_dollars', 0)
                
                # Look for sessions with significant savings that might be from custom fields
                if annual_dollars > 10000:  # More than $10k annual savings
                    custom_fields_sessions.append({
                        'session_id': session.get('id'),
                        'org_name': session.get('org_name'),
                        'findings_count': session.get('findings_count'),
                        'annual_savings': annual_dollars,
                        'created_at': session.get('created_at')
                    })
        
        print(f"✅ Found {len(custom_fields_sessions)} sessions with high savings (>$10k)")
        
        if not custom_fields_sessions:
            print("⚠️ No sessions with high savings found. Creating test scenario...")
            return self.create_test_scenario()
        
        # Step 2: Examine the highest savings session in detail
        self.log_subsection("2. EXAMINING HIGH SAVINGS SESSION DETAILS")
        
        # Sort by annual savings to get the highest one
        highest_session = max(custom_fields_sessions, key=lambda x: x['annual_savings'])
        
        print(f"🎯 Examining session: {highest_session['session_id']}")
        print(f"   Org: {highest_session['org_name']}")
        print(f"   Findings: {highest_session['findings_count']}")
        print(f"   Annual Savings: ${highest_session['annual_savings']:,.2f}")
        
        # Get detailed session data
        success, session_detail = self.make_request("GET", f"audit/{highest_session['session_id']}")
        if not success:
            print("❌ Failed to get session details")
            return False
        
        # Step 3: Analyze the findings in detail
        self.log_subsection("3. ANALYZING FINDINGS FOR ROI CALCULATION")
        
        findings = session_detail.get('findings', [])
        print(f"✅ Found {len(findings)} findings in session")
        
        custom_fields_findings = []
        for finding in findings:
            title = finding.get('title', '').lower()
            if 'custom field' in title or 'unused' in title:
                custom_fields_findings.append(finding)
        
        if not custom_fields_findings:
            print("⚠️ No custom fields findings found. Examining all findings...")
            # Show all findings to understand what's generating high ROI
            for i, finding in enumerate(findings):
                print(f"   Finding {i+1}: {finding.get('title', 'Unknown')}")
                print(f"      Category: {finding.get('category', 'Unknown')}")
                print(f"      ROI Estimate: ${finding.get('roi_estimate', 0):,.2f}")
                print(f"      Total Annual ROI: ${finding.get('total_annual_roi', 0):,.2f}")
        else:
            print(f"✅ Found {len(custom_fields_findings)} custom fields findings")
            
            # Step 4: Trace the ROI calculation for custom fields
            self.log_subsection("4. TRACING ROI CALCULATION FOR CUSTOM FIELDS")
            
            for i, finding in enumerate(custom_fields_findings):
                print(f"\n🔍 Custom Fields Finding #{i+1}:")
                print(f"   Title: {finding.get('title', 'Unknown')}")
                print(f"   Category: {finding.get('category', 'Unknown')}")
                print(f"   Impact: {finding.get('impact', 'Unknown')}")
                
                # Extract key calculation inputs
                salesforce_data = finding.get('salesforce_data', {})
                field_count = salesforce_data.get('potentially_unused', 0)
                users_affected = salesforce_data.get('users_affected', 0)
                
                print(f"   Field Count: {field_count}")
                print(f"   Users Affected: {users_affected}")
                
                # Get ROI calculation details
                roi_estimate = finding.get('roi_estimate', 0)
                total_annual_roi = finding.get('total_annual_roi', 0)
                
                print(f"   ROI Estimate: ${roi_estimate:,.2f}")
                print(f"   Total Annual ROI: ${total_annual_roi:,.2f}")
                
                # Check for enhanced ROI data
                if 'task_breakdown' in finding:
                    print(f"\n   📊 TASK BREAKDOWN:")
                    for task in finding.get('task_breakdown', []):
                        print(f"      Task: {task.get('task', 'Unknown')}")
                        print(f"      Type: {task.get('type', 'Unknown')}")
                        print(f"      Hours: {task.get('hours', 0)}")
                        print(f"      Cost/Savings: ${task.get('cost', task.get('savings_per_month', 0)):,.2f}")
                        print(f"      Role: {task.get('role', 'Unknown')}")
                        print(f"      Description: {task.get('description', 'None')}")
                        print()
                
                # Check for role attribution
                if 'role_attribution' in finding:
                    print(f"   👥 ROLE ATTRIBUTION:")
                    for role, data in finding.get('role_attribution', {}).items():
                        print(f"      {role}:")
                        print(f"         One-time hours: {data.get('one_time_hours', 0)}")
                        print(f"         One-time cost: ${data.get('one_time_cost', 0):,.2f}")
                        print(f"         Monthly hours: {data.get('monthly_hours', 0)}")
                        print(f"         Monthly savings: ${data.get('monthly_savings', 0):,.2f}")
                
                # Check for calculation details
                if 'calculation_details' in salesforce_data:
                    print(f"   🧮 CALCULATION DETAILS:")
                    calc_details = salesforce_data['calculation_details']
                    for key, value in calc_details.items():
                        print(f"      {key}: {value}")
                
                # Manual calculation verification
                self.verify_calculation(field_count, users_affected, finding)
        
        return True
    
    def verify_calculation(self, field_count, users_affected, finding):
        """Manually verify the ROI calculation"""
        self.log_subsection("5. MANUAL CALCULATION VERIFICATION")
        
        print(f"🧮 Verifying calculation for {field_count} fields, {users_affected} users")
        
        # Constants from the backend code
        ADMIN_RATE = 35  # $35/hr for admin tasks
        CLEANUP_TIME_PER_FIELD = 0.25  # 15 min per field cleanup
        USER_CONFUSION_PER_FIELD_PER_DAY = 0.5  # 30 seconds per day per user per field
        WORKDAYS_PER_MONTH = 22  # average workdays per month
        
        # Average user rates (from backend code)
        SALES_RATE = 55
        CUSTOMER_SERVICE_RATE = 25
        avg_user_rate = (SALES_RATE + CUSTOMER_SERVICE_RATE) / 2  # $40/hr
        
        print(f"📊 CALCULATION INPUTS:")
        print(f"   Field count: {field_count}")
        print(f"   Active users: {users_affected}")
        print(f"   Admin rate: ${ADMIN_RATE}/hr")
        print(f"   Cleanup time per field: {CLEANUP_TIME_PER_FIELD} hours")
        print(f"   User confusion per field per day: {USER_CONFUSION_PER_FIELD_PER_DAY} minutes")
        print(f"   Average user rate: ${avg_user_rate}/hr")
        print(f"   Workdays per month: {WORKDAYS_PER_MONTH}")
        
        # Step-by-step calculation
        print(f"\n🔢 STEP-BY-STEP CALCULATION:")
        
        # One-time cleanup cost
        cleanup_hours = field_count * CLEANUP_TIME_PER_FIELD
        cleanup_cost = cleanup_hours * ADMIN_RATE
        print(f"   1. One-time cleanup:")
        print(f"      Hours: {field_count} fields × {CLEANUP_TIME_PER_FIELD} hr/field = {cleanup_hours} hours")
        print(f"      Cost: {cleanup_hours} hours × ${ADMIN_RATE}/hr = ${cleanup_cost:,.2f}")
        
        # Monthly confusion savings
        daily_confusion_minutes = users_affected * USER_CONFUSION_PER_FIELD_PER_DAY * field_count
        monthly_confusion_hours = (daily_confusion_minutes * WORKDAYS_PER_MONTH) / 60
        monthly_confusion_savings = monthly_confusion_hours * avg_user_rate
        
        print(f"   2. Monthly confusion elimination:")
        print(f"      Daily confusion: {users_affected} users × {USER_CONFUSION_PER_FIELD_PER_DAY} min/field × {field_count} fields = {daily_confusion_minutes} min/day")
        print(f"      Monthly confusion: {daily_confusion_minutes} min/day × {WORKDAYS_PER_MONTH} days ÷ 60 = {monthly_confusion_hours:.2f} hours/month")
        print(f"      Monthly savings: {monthly_confusion_hours:.2f} hours × ${avg_user_rate}/hr = ${monthly_confusion_savings:,.2f}/month")
        
        # Annual ROI calculation
        annual_confusion_savings = monthly_confusion_savings * 12
        total_annual_roi = annual_confusion_savings - cleanup_cost
        
        print(f"   3. Annual ROI:")
        print(f"      Annual confusion savings: ${monthly_confusion_savings:,.2f}/month × 12 = ${annual_confusion_savings:,.2f}/year")
        print(f"      Total annual ROI: ${annual_confusion_savings:,.2f} - ${cleanup_cost:,.2f} = ${total_annual_roi:,.2f}/year")
        
        # Compare with actual finding
        actual_roi = finding.get('total_annual_roi', finding.get('roi_estimate', 0))
        print(f"\n📊 COMPARISON:")
        print(f"   Calculated ROI: ${total_annual_roi:,.2f}/year")
        print(f"   Actual ROI: ${actual_roi:,.2f}/year")
        print(f"   Difference: ${abs(total_annual_roi - actual_roi):,.2f}")
        
        if abs(total_annual_roi - actual_roi) < 100:  # Within $100
            print("✅ Calculation matches! ROI is correctly calculated.")
        else:
            print("❌ Calculation mismatch! There may be additional factors.")
            
            # Check for stage multipliers or other factors
            if 'business_stage' in finding.get('salesforce_data', {}):
                stage = finding['salesforce_data']['business_stage']
                print(f"   Business stage: {stage}")
                
                # Stage multipliers from backend code
                stage_multipliers = {0: 0.7, 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.3, 7: 1.4, 8: 1.5, 9: 1.6}
                multiplier = stage_multipliers.get(stage, 1.0)
                print(f"   Stage multiplier: {multiplier}")
                
                # Recalculate with stage multiplier
                adjusted_cleanup_cost = cleanup_cost * multiplier
                adjusted_monthly_savings = monthly_confusion_savings * multiplier
                adjusted_annual_roi = (adjusted_monthly_savings * 12) - adjusted_cleanup_cost
                
                print(f"   Adjusted calculation with stage multiplier:")
                print(f"      Adjusted cleanup cost: ${cleanup_cost:,.2f} × {multiplier} = ${adjusted_cleanup_cost:,.2f}")
                print(f"      Adjusted monthly savings: ${monthly_confusion_savings:,.2f} × {multiplier} = ${adjusted_monthly_savings:,.2f}")
                print(f"      Adjusted annual ROI: ${adjusted_annual_roi:,.2f}/year")
                
                if abs(adjusted_annual_roi - actual_roi) < 100:
                    print("✅ Adjusted calculation matches! Stage multiplier explains the difference.")
                else:
                    print("❌ Still doesn't match. Other factors may be involved.")
    
    def create_test_scenario(self):
        """Create a test scenario to investigate ROI calculation"""
        self.log_subsection("CREATING TEST SCENARIO")
        
        print("Creating test scenario with 18 custom fields and realistic assumptions...")
        
        # Test with the exact scenario from the review request
        field_count = 18
        active_users = 10  # Reasonable assumption
        business_stage = 3  # Stage 3 business (1.0 multiplier)
        
        print(f"📊 TEST SCENARIO:")
        print(f"   Field count: {field_count}")
        print(f"   Active users: {active_users}")
        print(f"   Business stage: {business_stage} (1.0 multiplier)")
        
        # Manual calculation with these inputs
        self.manual_roi_calculation(field_count, active_users, business_stage)
        
        return True
    
    def manual_roi_calculation(self, field_count, active_users, business_stage):
        """Perform manual ROI calculation with given inputs"""
        self.log_subsection("MANUAL ROI CALCULATION")
        
        # Constants from backend code
        ADMIN_RATE = 35
        CLEANUP_TIME_PER_FIELD = 0.25
        USER_CONFUSION_PER_FIELD_PER_DAY = 0.5
        WORKDAYS_PER_MONTH = 22
        
        # Stage multipliers
        stage_multipliers = {0: 0.7, 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.3, 7: 1.4, 8: 1.5, 9: 1.6}
        stage_multiplier = stage_multipliers.get(business_stage, 1.0)
        
        # Average user rate
        SALES_RATE = 55
        CUSTOMER_SERVICE_RATE = 25
        avg_user_rate = (SALES_RATE + CUSTOMER_SERVICE_RATE) / 2
        
        print(f"🧮 CALCULATION WITH REALISTIC ASSUMPTIONS:")
        print(f"   Field count: {field_count}")
        print(f"   Active users: {active_users}")
        print(f"   Business stage: {business_stage}")
        print(f"   Stage multiplier: {stage_multiplier}")
        print(f"   Admin rate: ${ADMIN_RATE}/hr")
        print(f"   Average user rate: ${avg_user_rate}/hr")
        
        # One-time cleanup cost
        cleanup_hours = field_count * CLEANUP_TIME_PER_FIELD
        cleanup_cost = cleanup_hours * ADMIN_RATE * stage_multiplier
        
        print(f"\n📋 ONE-TIME CLEANUP COST:")
        print(f"   cleanup_hours = {field_count} × {CLEANUP_TIME_PER_FIELD} = {cleanup_hours} hours")
        print(f"   cleanup_cost = {cleanup_hours} × ${ADMIN_RATE} × {stage_multiplier} = ${cleanup_cost:,.2f}")
        
        # Monthly confusion savings
        daily_confusion_minutes = active_users * USER_CONFUSION_PER_FIELD_PER_DAY * field_count
        monthly_confusion_hours = (daily_confusion_minutes * WORKDAYS_PER_MONTH) / 60
        monthly_confusion_savings = monthly_confusion_hours * avg_user_rate * stage_multiplier
        
        print(f"\n📋 MONTHLY CONFUSION SAVINGS:")
        print(f"   daily_confusion_minutes = {active_users} × {USER_CONFUSION_PER_FIELD_PER_DAY} × {field_count} = {daily_confusion_minutes} min/day")
        print(f"   monthly_confusion_hours = ({daily_confusion_minutes} × {WORKDAYS_PER_MONTH}) ÷ 60 = {monthly_confusion_hours:.2f} hours/month")
        print(f"   monthly_confusion_savings = {monthly_confusion_hours:.2f} × ${avg_user_rate} × {stage_multiplier} = ${monthly_confusion_savings:,.2f}/month")
        
        # Total annual ROI
        total_annual_roi = (monthly_confusion_savings * 12) - cleanup_cost
        
        print(f"\n📋 TOTAL ANNUAL ROI:")
        print(f"   total_annual_roi = (${monthly_confusion_savings:,.2f} × 12) - ${cleanup_cost:,.2f}")
        print(f"   total_annual_roi = ${monthly_confusion_savings * 12:,.2f} - ${cleanup_cost:,.2f}")
        print(f"   total_annual_roi = ${total_annual_roi:,.2f}/year")
        
        print(f"\n🎯 FINAL RESULT:")
        print(f"   With {field_count} unused custom fields, {active_users} active users, and Stage {business_stage} business:")
        print(f"   Expected annual ROI: ${total_annual_roi:,.2f}/year")
        
        # Check if this matches the reported $15,682
        if abs(total_annual_roi - 15682) < 100:
            print(f"✅ This calculation produces approximately $15,682/yr!")
            print(f"✅ The ROI calculation appears to be working correctly.")
        else:
            print(f"❌ This calculation does not match the reported $15,682/yr.")
            print(f"❌ Difference: ${abs(total_annual_roi - 15682):,.2f}")
            
            # Try different assumptions
            print(f"\n🔍 TRYING DIFFERENT ASSUMPTIONS:")
            
            # Try with more users
            for test_users in [15, 20, 25]:
                test_daily_confusion = test_users * USER_CONFUSION_PER_FIELD_PER_DAY * field_count
                test_monthly_hours = (test_daily_confusion * WORKDAYS_PER_MONTH) / 60
                test_monthly_savings = test_monthly_hours * avg_user_rate * stage_multiplier
                test_annual_roi = (test_monthly_savings * 12) - cleanup_cost
                
                print(f"   With {test_users} users: ${test_annual_roi:,.2f}/year")
                
                if abs(test_annual_roi - 15682) < 100:
                    print(f"   ✅ {test_users} users produces approximately $15,682/yr!")
                    break
        
        return total_annual_roi

def main():
    """Main function to run the ROI investigation"""
    print("🚨 ROI CALCULATION INVESTIGATION")
    print("Investigating why 18 unused custom fields shows $15,682/yr savings")
    
    investigator = ROICalculationInvestigator()
    
    try:
        success = investigator.investigate_roi_calculation()
        
        if success:
            print(f"\n🎉 ROI INVESTIGATION COMPLETED")
            print(f"✅ Investigation completed successfully")
        else:
            print(f"\n❌ ROI INVESTIGATION FAILED")
            print(f"❌ Unable to complete investigation")
            
    except Exception as e:
        print(f"\n💥 INVESTIGATION ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()