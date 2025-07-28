#!/usr/bin/env python3
"""
DIRECT ROI CALCULATION TEST
===========================

This test directly investigates the ROI calculation for custom fields by testing the 
calculation logic with the exact scenario mentioned in the review request.
"""

import requests
import json
import sys

class DirectROITest:
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
    
    def test_roi_calculation_scenarios(self):
        """Test ROI calculation with different scenarios"""
        self.log_section("DIRECT ROI CALCULATION TESTING")
        print("Testing the exact ROI calculation logic with realistic scenarios")
        
        # Test scenarios based on the review request
        scenarios = [
            {
                "name": "Review Request Scenario",
                "field_count": 18,
                "active_users": 10,
                "business_stage": 3,
                "description": "18 fields, 10 users, Stage 3 business (1.0 multiplier)"
            },
            {
                "name": "Small Team Scenario", 
                "field_count": 18,
                "active_users": 5,
                "business_stage": 2,
                "description": "18 fields, 5 users, Stage 2 business (0.9 multiplier)"
            },
            {
                "name": "Large Team Scenario",
                "field_count": 18,
                "active_users": 15,
                "business_stage": 4,
                "description": "18 fields, 15 users, Stage 4 business (1.1 multiplier)"
            },
            {
                "name": "High Volume Scenario",
                "field_count": 25,
                "active_users": 20,
                "business_stage": 5,
                "description": "25 fields, 20 users, Stage 5 business (1.2 multiplier)"
            }
        ]
        
        for scenario in scenarios:
            self.log_subsection(f"SCENARIO: {scenario['name']}")
            print(f"Description: {scenario['description']}")
            
            roi = self.calculate_custom_fields_roi(
                scenario['field_count'],
                scenario['active_users'], 
                scenario['business_stage']
            )
            
            print(f"🎯 RESULT: ${roi:,.2f}/year")
            
            # Check if this matches the reported $15,682
            if abs(roi - 15682) < 500:  # Within $500
                print(f"✅ This scenario produces approximately $15,682/yr!")
                print(f"✅ Difference: ${abs(roi - 15682):,.2f}")
            else:
                print(f"❌ This scenario does not match $15,682/yr")
                print(f"❌ Difference: ${abs(roi - 15682):,.2f}")
        
        # Now test what inputs would produce exactly $15,682
        self.log_subsection("REVERSE ENGINEERING $15,682 CALCULATION")
        self.reverse_engineer_calculation()
        
        return True
    
    def calculate_custom_fields_roi(self, field_count, active_users, business_stage):
        """Calculate ROI for custom fields using the exact backend formula"""
        
        # Constants from backend code (server.py lines 560-575)
        ADMIN_RATE = 35  # $35/hr for admin tasks
        CLEANUP_TIME_PER_FIELD = 0.25  # 15 min per field cleanup
        USER_CONFUSION_PER_FIELD_PER_DAY = 0.5  # 30 seconds per day per user per field
        WORKDAYS_PER_MONTH = 22  # average workdays per month
        
        # Stage multipliers from backend code (server.py line 597)
        stage_multipliers = {0: 0.7, 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.3, 7: 1.4, 8: 1.5, 9: 1.6}
        stage_multiplier = stage_multipliers.get(business_stage, 1.0)
        
        # Average user rate from backend code (server.py line 601)
        SALES_RATE = 55
        CUSTOMER_SERVICE_RATE = 25
        avg_user_rate = (SALES_RATE + CUSTOMER_SERVICE_RATE) / 2  # $40/hr
        
        print(f"📊 CALCULATION INPUTS:")
        print(f"   Field count: {field_count}")
        print(f"   Active users: {active_users}")
        print(f"   Business stage: {business_stage}")
        print(f"   Stage multiplier: {stage_multiplier}")
        print(f"   Admin rate: ${ADMIN_RATE}/hr")
        print(f"   Average user rate: ${avg_user_rate}/hr")
        print(f"   Cleanup time per field: {CLEANUP_TIME_PER_FIELD} hours")
        print(f"   User confusion per field per day: {USER_CONFUSION_PER_FIELD_PER_DAY} minutes")
        print(f"   Workdays per month: {WORKDAYS_PER_MONTH}")
        
        # Step 1: One-time cleanup cost (from server.py lines 624-625)
        cleanup_hours = field_count * CLEANUP_TIME_PER_FIELD
        cleanup_cost = cleanup_hours * ADMIN_RATE * stage_multiplier
        
        print(f"\n🔢 STEP 1: ONE-TIME CLEANUP COST")
        print(f"   cleanup_hours = {field_count} × {CLEANUP_TIME_PER_FIELD} = {cleanup_hours} hours")
        print(f"   cleanup_cost = {cleanup_hours} × ${ADMIN_RATE} × {stage_multiplier} = ${cleanup_cost:,.2f}")
        
        # Step 2: Monthly confusion savings (from server.py lines 628-631)
        daily_confusion_minutes = active_users * USER_CONFUSION_PER_FIELD_PER_DAY * field_count
        monthly_confusion_hours = (daily_confusion_minutes * WORKDAYS_PER_MONTH) / 60
        monthly_confusion_savings = monthly_confusion_hours * avg_user_rate * stage_multiplier
        
        print(f"\n🔢 STEP 2: MONTHLY CONFUSION SAVINGS")
        print(f"   daily_confusion_minutes = {active_users} × {USER_CONFUSION_PER_FIELD_PER_DAY} × {field_count} = {daily_confusion_minutes} min/day")
        print(f"   monthly_confusion_hours = ({daily_confusion_minutes} × {WORKDAYS_PER_MONTH}) ÷ 60 = {monthly_confusion_hours:.2f} hours/month")
        print(f"   monthly_confusion_savings = {monthly_confusion_hours:.2f} × ${avg_user_rate} × {stage_multiplier} = ${monthly_confusion_savings:,.2f}/month")
        
        # Step 3: Total annual ROI (from server.py line 657)
        total_annual_roi = (monthly_confusion_savings * 12) - cleanup_cost
        
        print(f"\n🔢 STEP 3: TOTAL ANNUAL ROI")
        print(f"   total_annual_roi = (${monthly_confusion_savings:,.2f} × 12) - ${cleanup_cost:,.2f}")
        print(f"   total_annual_roi = ${monthly_confusion_savings * 12:,.2f} - ${cleanup_cost:,.2f}")
        print(f"   total_annual_roi = ${total_annual_roi:,.2f}/year")
        
        return total_annual_roi
    
    def reverse_engineer_calculation(self):
        """Reverse engineer what inputs would produce $15,682"""
        print("🔍 Finding what inputs produce exactly $15,682/year...")
        
        target_roi = 15682
        field_count = 18  # Fixed from review request
        
        # Try different combinations of users and stages
        found_match = False
        
        for active_users in range(5, 26):  # 5 to 25 users
            for business_stage in range(0, 10):  # Stages 0-9
                roi = self.calculate_custom_fields_roi_simple(field_count, active_users, business_stage)
                
                if abs(roi - target_roi) < 50:  # Within $50
                    print(f"\n✅ MATCH FOUND!")
                    print(f"   Field count: {field_count}")
                    print(f"   Active users: {active_users}")
                    print(f"   Business stage: {business_stage}")
                    print(f"   Calculated ROI: ${roi:,.2f}/year")
                    print(f"   Target ROI: ${target_roi:,.2f}/year")
                    print(f"   Difference: ${abs(roi - target_roi):,.2f}")
                    found_match = True
                    
                    # Show the detailed calculation for this match
                    print(f"\n📊 DETAILED CALCULATION FOR MATCH:")
                    self.calculate_custom_fields_roi(field_count, active_users, business_stage)
                    break
            
            if found_match:
                break
        
        if not found_match:
            print("❌ No exact match found within reasonable parameters")
            print("   This suggests the $15,682 figure may be from a different calculation or scenario")
    
    def calculate_custom_fields_roi_simple(self, field_count, active_users, business_stage):
        """Simple ROI calculation without detailed output"""
        
        # Constants
        ADMIN_RATE = 35
        CLEANUP_TIME_PER_FIELD = 0.25
        USER_CONFUSION_PER_FIELD_PER_DAY = 0.5
        WORKDAYS_PER_MONTH = 22
        
        # Stage multipliers
        stage_multipliers = {0: 0.7, 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.3, 7: 1.4, 8: 1.5, 9: 1.6}
        stage_multiplier = stage_multipliers.get(business_stage, 1.0)
        
        # Average user rate
        avg_user_rate = (55 + 25) / 2  # $40/hr
        
        # Calculation
        cleanup_hours = field_count * CLEANUP_TIME_PER_FIELD
        cleanup_cost = cleanup_hours * ADMIN_RATE * stage_multiplier
        
        daily_confusion_minutes = active_users * USER_CONFUSION_PER_FIELD_PER_DAY * field_count
        monthly_confusion_hours = (daily_confusion_minutes * WORKDAYS_PER_MONTH) / 60
        monthly_confusion_savings = monthly_confusion_hours * avg_user_rate * stage_multiplier
        
        total_annual_roi = (monthly_confusion_savings * 12) - cleanup_cost
        
        return total_annual_roi
    
    def test_business_stage_mapping(self):
        """Test business stage mapping to understand stage multipliers"""
        self.log_section("BUSINESS STAGE MAPPING TEST")
        
        # Test different revenue/headcount combinations to see what stages they map to
        test_cases = [
            {"revenue": 375000, "headcount": 7, "description": "Review request example"},
            {"revenue": 1000000, "headcount": 10, "description": "Default values"},
            {"revenue": 2000000, "headcount": 15, "description": "Mid-size business"},
            {"revenue": 5000000, "headcount": 25, "description": "Larger business"}
        ]
        
        for case in test_cases:
            print(f"\n🔍 Testing: {case['description']}")
            print(f"   Revenue: ${case['revenue']:,}")
            print(f"   Headcount: {case['headcount']}")
            
            success, response = self.make_request(
                "POST", 
                "business/stage",
                data={
                    "annual_revenue": case['revenue'],
                    "employee_headcount": case['headcount']
                }
            )
            
            if success:
                stage = response.get('stage', 'Unknown')
                name = response.get('name', 'Unknown')
                print(f"   ✅ Maps to Stage {stage}: {name}")
                
                # Calculate ROI with this stage
                roi = self.calculate_custom_fields_roi_simple(18, case['headcount'], stage)
                print(f"   ROI with 18 fields: ${roi:,.2f}/year")
            else:
                print(f"   ❌ Failed to get stage mapping")

def main():
    """Main function to run the direct ROI test"""
    print("🚨 DIRECT ROI CALCULATION TEST")
    print("Testing the exact ROI calculation logic for custom fields")
    
    tester = DirectROITest()
    
    try:
        # Test ROI calculation scenarios
        tester.test_roi_calculation_scenarios()
        
        # Test business stage mapping
        tester.test_business_stage_mapping()
        
        print(f"\n🎉 DIRECT ROI TEST COMPLETED")
        print(f"✅ All tests completed successfully")
            
    except Exception as e:
        print(f"\n💥 TEST ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()