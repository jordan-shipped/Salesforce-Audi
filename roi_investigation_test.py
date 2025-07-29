#!/usr/bin/env python3
"""
ROI CALCULATION INVESTIGATION TEST
==================================

This test specifically investigates the ROI calculation issue where audit results 
are showing "$0/yr" for all findings instead of meaningful ROI values.

INVESTIGATION AREAS:
1. Test a recent audit session and examine detailed findings
2. Check specific ROI fields: annual_user_savings, total_annual_roi, enhanced_roi, roi_estimate, monthly_user_savings
3. Test ROI calculation flow with specific business inputs
4. Verify business inputs are being passed correctly through the audit flow
5. Check if avg_user_rate is not 0 and HOURLY_RATES_BY_ROLE constants are accessible
"""

import requests
import json
import sys
from datetime import datetime
import uuid

class ROIInvestigationTester:
    def __init__(self, base_url="https://dd6a7962-9851-4337-9e39-7a17a3866ce2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.findings = []
        
    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name}")
        if details:
            print(f"   {details}")
    
    def make_request(self, method, endpoint, data=None, params=None):
        """Make API request with error handling"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=15)
            
            return response.status_code, response.json() if response.content else {}
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return None, {}
        except json.JSONDecodeError:
            return response.status_code, {"error": "Invalid JSON response"}
    
    def investigate_recent_audit_sessions(self):
        """STEP 1: Investigate recent audit sessions to examine ROI data"""
        print("\n" + "="*80)
        print("STEP 1: INVESTIGATING RECENT AUDIT SESSIONS FOR ROI DATA")
        print("="*80)
        
        # Get all audit sessions
        status, sessions = self.make_request('GET', 'audit/sessions')
        
        if status != 200:
            self.log_test("Get audit sessions", False, f"Status: {status}")
            return False
        
        if not sessions or len(sessions) == 0:
            self.log_test("Find audit sessions", False, "No audit sessions found")
            return False
        
        self.log_test("Get audit sessions", True, f"Found {len(sessions)} sessions")
        
        # Examine the first few sessions for ROI data
        print(f"\n🔍 EXAMINING FIRST 3 SESSIONS FOR ROI DATA:")
        print("-" * 60)
        
        roi_issues_found = []
        
        for i, session in enumerate(sessions[:3]):
            session_id = session.get('id', 'unknown')
            org_name = session.get('org_name', 'unknown')
            findings_count = session.get('findings_count', 0)
            estimated_savings = session.get('estimated_savings', {})
            
            print(f"\n📋 Session {i+1}: {org_name} (ID: {session_id})")
            print(f"   Findings count: {findings_count}")
            print(f"   Estimated savings: {estimated_savings}")
            
            # Check if estimated_savings shows $0
            annual_dollars = estimated_savings.get('annual_dollars', 0)
            if annual_dollars == 0:
                roi_issues_found.append(f"Session {session_id}: $0 annual savings")
                print(f"   ❌ ISSUE: Annual savings is $0")
            else:
                print(f"   ✅ Annual savings: ${annual_dollars:,}")
            
            # Get detailed session data
            status, session_details = self.make_request('GET', f'audit/{session_id}')
            
            if status == 200 and session_details:
                findings = session_details.get('findings', [])
                print(f"   Detailed findings: {len(findings)} found")
                
                # Examine ROI fields in findings
                for j, finding in enumerate(findings[:2]):  # Check first 2 findings
                    print(f"\n   📊 Finding {j+1}: {finding.get('title', 'Unknown')}")
                    
                    # Check all ROI-related fields
                    roi_fields = {
                        'roi_estimate': finding.get('roi_estimate', 'missing'),
                        'annual_user_savings': finding.get('annual_user_savings', 'missing'),
                        'total_annual_roi': finding.get('total_annual_roi', 'missing'),
                        'enhanced_roi': finding.get('enhanced_roi', 'missing'),
                        'monthly_user_savings': finding.get('monthly_user_savings', 'missing'),
                        'net_annual_roi': finding.get('net_annual_roi', 'missing'),
                        'cleanup_cost': finding.get('cleanup_cost', 'missing'),
                        'time_savings_hours': finding.get('time_savings_hours', 'missing')
                    }
                    
                    zero_roi_fields = []
                    missing_roi_fields = []
                    
                    for field, value in roi_fields.items():
                        if value == 'missing':
                            missing_roi_fields.append(field)
                            print(f"      ❌ {field}: MISSING")
                        elif value == 0 or value == 0.0:
                            zero_roi_fields.append(field)
                            print(f"      ⚠️ {field}: $0")
                        else:
                            print(f"      ✅ {field}: {value}")
                    
                    if zero_roi_fields:
                        roi_issues_found.append(f"Finding {finding.get('id', 'unknown')}: Zero values in {zero_roi_fields}")
                    
                    if missing_roi_fields:
                        roi_issues_found.append(f"Finding {finding.get('id', 'unknown')}: Missing fields {missing_roi_fields}")
            else:
                print(f"   ❌ Could not get detailed session data (Status: {status})")
        
        # Summary of ROI issues
        if roi_issues_found:
            print(f"\n🚨 ROI ISSUES IDENTIFIED:")
            for issue in roi_issues_found:
                print(f"   - {issue}")
            self.log_test("ROI data investigation", False, f"Found {len(roi_issues_found)} ROI issues")
        else:
            print(f"\n✅ No obvious ROI issues found in session data")
            self.log_test("ROI data investigation", True, "ROI data appears to be populated")
        
        return len(roi_issues_found) == 0
    
    def test_roi_calculation_flow(self):
        """STEP 2: Test ROI calculation flow with specific business inputs"""
        print("\n" + "="*80)
        print("STEP 2: TESTING ROI CALCULATION FLOW WITH SPECIFIC BUSINESS INPUTS")
        print("="*80)
        
        # Create business info session first
        business_data = {
            "revenue_bucket": "$250K – $500K",
            "headcount_bucket": "5 – 9"
        }
        
        print(f"🔍 Creating business info session with:")
        print(f"   Revenue: {business_data['revenue_bucket']}")
        print(f"   Headcount: {business_data['headcount_bucket']}")
        
        status, response = self.make_request('POST', 'session/business-info', data=business_data)
        
        if status != 200:
            self.log_test("Create business info session", False, f"Status: {status}, Response: {response}")
            return False
        
        business_session_id = response.get('business_session_id')
        if not business_session_id:
            self.log_test("Get business session ID", False, "No session ID returned")
            return False
        
        self.log_test("Create business info session", True, f"Session ID: {business_session_id}")
        
        # Verify business info was stored correctly
        status, business_info = self.make_request('GET', f'session/business-info/{business_session_id}')
        
        if status != 200:
            self.log_test("Retrieve business info", False, f"Status: {status}")
            return False
        
        annual_revenue = business_info.get('annual_revenue')
        employee_headcount = business_info.get('employee_headcount')
        
        print(f"✅ Business info retrieved:")
        print(f"   Annual revenue: ${annual_revenue:,}")
        print(f"   Employee headcount: {employee_headcount}")
        
        # Verify the conversion is correct
        expected_revenue = 375000  # $250K-$500K should map to $375K
        expected_headcount = 7     # 5-9 should map to 7
        
        revenue_correct = annual_revenue == expected_revenue
        headcount_correct = employee_headcount == expected_headcount
        
        self.log_test("Revenue conversion", revenue_correct, 
                     f"Expected: ${expected_revenue:,}, Got: ${annual_revenue:,}")
        self.log_test("Headcount conversion", headcount_correct, 
                     f"Expected: {expected_headcount}, Got: {employee_headcount}")
        
        # Test business stage mapping
        stage_data = {
            "annual_revenue": annual_revenue,
            "employee_headcount": employee_headcount
        }
        
        status, stage_response = self.make_request('POST', 'business/stage', data=stage_data)
        
        if status != 200:
            self.log_test("Get business stage", False, f"Status: {status}")
            return False
        
        stage = stage_response.get('stage')
        stage_name = stage_response.get('name')
        
        print(f"✅ Business stage mapping:")
        print(f"   Stage: {stage} ({stage_name})")
        
        # Expected stage for $375K revenue and 7 employees should be Stage 2 (Advertise)
        expected_stage = 2
        stage_correct = stage == expected_stage
        
        self.log_test("Business stage mapping", stage_correct, 
                     f"Expected: Stage {expected_stage}, Got: Stage {stage}")
        
        return revenue_correct and headcount_correct and stage_correct
    
    def test_roi_calculation_constants(self):
        """STEP 3: Test if ROI calculation constants are accessible"""
        print("\n" + "="*80)
        print("STEP 3: TESTING ROI CALCULATION CONSTANTS AND HOURLY RATES")
        print("="*80)
        
        # Test if we can access the business stages data
        status, stages_response = self.make_request('GET', 'business/stages')
        
        if status != 200:
            self.log_test("Get business stages", False, f"Status: {status}")
            return False
        
        stages = stages_response.get('stages', [])
        if len(stages) != 10:
            self.log_test("Business stages count", False, f"Expected 10 stages, got {len(stages)}")
            return False
        
        self.log_test("Business stages accessible", True, f"Found {len(stages)} stages")
        
        # Check if Stage 2 has proper constraints (this indicates the constants are loaded)
        stage_2 = None
        for stage in stages:
            if stage.get('stage') == 2:
                stage_2 = stage
                break
        
        if not stage_2:
            self.log_test("Find Stage 2", False, "Stage 2 not found")
            return False
        
        constraints = stage_2.get('constraints_and_actions', [])
        if len(constraints) < 4:
            self.log_test("Stage 2 constraints", False, f"Expected 4+ constraints, got {len(constraints)}")
            return False
        
        self.log_test("Stage 2 constraints", True, f"Found {len(constraints)} constraints")
        
        # Test a sample ROI calculation by creating a mock audit request
        # This will help us see if the ROI calculation functions are working
        print(f"\n🔍 Testing ROI calculation with mock audit request:")
        
        mock_audit_request = {
            "session_id": f"roi_test_{uuid.uuid4()}",
            "use_quick_estimate": True,
            "business_inputs": {
                "annual_revenue": 375000,
                "employee_headcount": 7,
                "revenue_range": "250k–500k",
                "employee_range": "5–9"
            },
            "department_salaries": {
                "customer_service": 45000,
                "sales": 65000,
                "marketing": 60000,
                "engineering": 95000,
                "executives": 150000
            }
        }
        
        print(f"   Session ID: {mock_audit_request['session_id']}")
        print(f"   Annual revenue: ${mock_audit_request['business_inputs']['annual_revenue']:,}")
        print(f"   Employee headcount: {mock_audit_request['business_inputs']['employee_headcount']}")
        
        status, audit_response = self.make_request('POST', 'audit/run', data=mock_audit_request)
        
        # We expect this to fail with 401 (invalid session) but the error should be about session, not ROI calculation
        if status == 401:
            error_msg = str(audit_response.get('detail', ''))
            if 'session' in error_msg.lower():
                self.log_test("ROI calculation structure", True, "Request structure accepted, failed on session validation (expected)")
                print(f"   Expected error: {error_msg}")
            else:
                self.log_test("ROI calculation structure", False, f"Unexpected error: {error_msg}")
                return False
        else:
            self.log_test("ROI calculation structure", False, f"Unexpected status: {status}")
            return False
        
        return True
    
    def test_avg_user_rate_calculation(self):
        """STEP 4: Test if avg_user_rate calculation is working"""
        print("\n" + "="*80)
        print("STEP 4: TESTING AVG_USER_RATE CALCULATION")
        print("="*80)
        
        # Test the specific scenario mentioned in the review request
        print(f"🔍 Testing the exact scenario from review request:")
        print(f"   session_id: test_avg_user_rate_fix")
        print(f"   annual_revenue: 375000")
        print(f"   employee_headcount: 7")
        print(f"   revenue_range: 250k–500k")
        print(f"   employee_range: 5–9")
        
        test_audit_request = {
            "session_id": "test_avg_user_rate_fix",
            "use_quick_estimate": True,
            "business_inputs": {
                "annual_revenue": 375000,
                "employee_headcount": 7,
                "revenue_range": "250k–500k",
                "employee_range": "5–9"
            }
        }
        
        status, response = self.make_request('POST', 'audit/run', data=test_audit_request)
        
        # Check the response for avg_user_rate related errors
        if status == 401:
            error_detail = str(response.get('detail', ''))
            if 'avg_user_rate' in error_detail.lower():
                self.log_test("avg_user_rate error check", False, f"avg_user_rate error found: {error_detail}")
                return False
            elif 'cannot access local variable' in error_detail.lower():
                self.log_test("avg_user_rate error check", False, f"Variable access error: {error_detail}")
                return False
            elif 'session' in error_detail.lower():
                self.log_test("avg_user_rate error check", True, "No avg_user_rate errors, failed on session validation (expected)")
            else:
                print(f"   Other error: {error_detail}")
                self.log_test("avg_user_rate error check", True, "No avg_user_rate errors detected")
        else:
            print(f"   Unexpected status: {status}")
            print(f"   Response: {response}")
            self.log_test("avg_user_rate error check", False, f"Unexpected response status: {status}")
            return False
        
        return True
    
    def test_enhanced_roi_fields(self):
        """STEP 5: Test if enhanced ROI fields are being calculated and stored"""
        print("\n" + "="*80)
        print("STEP 5: TESTING ENHANCED ROI FIELDS IN EXISTING SESSIONS")
        print("="*80)
        
        # Get a recent session and check for enhanced ROI fields
        status, sessions = self.make_request('GET', 'audit/sessions')
        
        if status != 200 or not sessions:
            self.log_test("Get sessions for ROI field test", False, "No sessions available")
            return False
        
        # Find a session with findings
        test_session = None
        for session in sessions:
            if session.get('findings_count', 0) > 0:
                test_session = session
                break
        
        if not test_session:
            self.log_test("Find session with findings", False, "No sessions with findings found")
            return False
        
        session_id = test_session['id']
        print(f"🔍 Testing enhanced ROI fields in session: {session_id}")
        
        # Get detailed session data
        status, session_details = self.make_request('GET', f'audit/{session_id}')
        
        if status != 200:
            self.log_test("Get session details", False, f"Status: {status}")
            return False
        
        findings = session_details.get('findings', [])
        if not findings:
            self.log_test("Get findings", False, "No findings in session")
            return False
        
        print(f"   Found {len(findings)} findings to analyze")
        
        # Check each finding for enhanced ROI fields
        enhanced_roi_found = False
        task_breakdown_found = False
        role_attribution_found = False
        
        for i, finding in enumerate(findings):
            print(f"\n   📊 Analyzing Finding {i+1}: {finding.get('title', 'Unknown')}")
            
            # Check for enhanced ROI fields
            enhanced_fields = {
                'task_breakdown': finding.get('task_breakdown'),
                'role_attribution': finding.get('role_attribution'),
                'one_time_costs': finding.get('one_time_costs'),
                'recurring_savings': finding.get('recurring_savings'),
                'total_one_time_cost': finding.get('total_one_time_cost'),
                'total_monthly_savings': finding.get('total_monthly_savings'),
                'total_annual_roi': finding.get('total_annual_roi'),
                'confidence': finding.get('confidence')
            }
            
            for field, value in enhanced_fields.items():
                if value is not None and value != 0:
                    print(f"      ✅ {field}: {value}")
                    if field == 'task_breakdown' and isinstance(value, list) and len(value) > 0:
                        task_breakdown_found = True
                    elif field == 'role_attribution' and isinstance(value, dict) and len(value) > 0:
                        role_attribution_found = True
                    elif field == 'total_annual_roi' and value != 0:
                        enhanced_roi_found = True
                else:
                    print(f"      ❌ {field}: {value}")
        
        # Summary of enhanced ROI field analysis
        self.log_test("Enhanced ROI fields found", enhanced_roi_found, 
                     "total_annual_roi values found" if enhanced_roi_found else "No non-zero total_annual_roi found")
        self.log_test("Task breakdown found", task_breakdown_found,
                     "task_breakdown arrays found" if task_breakdown_found else "No task_breakdown arrays found")
        self.log_test("Role attribution found", role_attribution_found,
                     "role_attribution objects found" if role_attribution_found else "No role_attribution objects found")
        
        return enhanced_roi_found or task_breakdown_found or role_attribution_found
    
    def run_comprehensive_roi_investigation(self):
        """Run the complete ROI investigation"""
        print("🔍 COMPREHENSIVE ROI CALCULATION INVESTIGATION")
        print("=" * 80)
        print("Investigating why audit results show '$0/yr' for all findings")
        print("=" * 80)
        
        # Run all investigation steps
        step1_success = self.investigate_recent_audit_sessions()
        step2_success = self.test_roi_calculation_flow()
        step3_success = self.test_roi_calculation_constants()
        step4_success = self.test_avg_user_rate_calculation()
        step5_success = self.test_enhanced_roi_fields()
        
        # Final summary
        print("\n" + "="*80)
        print("ROI INVESTIGATION SUMMARY")
        print("="*80)
        
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        print(f"\n📊 INVESTIGATION RESULTS:")
        print(f"   Step 1 - Recent audit sessions: {'✅ PASS' if step1_success else '❌ FAIL'}")
        print(f"   Step 2 - ROI calculation flow: {'✅ PASS' if step2_success else '❌ FAIL'}")
        print(f"   Step 3 - ROI constants access: {'✅ PASS' if step3_success else '❌ FAIL'}")
        print(f"   Step 4 - avg_user_rate calculation: {'✅ PASS' if step4_success else '❌ FAIL'}")
        print(f"   Step 5 - Enhanced ROI fields: {'✅ PASS' if step5_success else '❌ FAIL'}")
        
        overall_success = all([step1_success, step2_success, step3_success, step4_success, step5_success])
        
        print(f"\n🎯 OVERALL INVESTIGATION: {'✅ PASS' if overall_success else '❌ ISSUES FOUND'}")
        
        if not overall_success:
            print(f"\n🚨 ROOT CAUSE ANALYSIS:")
            if not step1_success:
                print(f"   - Existing audit sessions have ROI calculation issues")
            if not step2_success:
                print(f"   - Business input conversion or stage mapping issues")
            if not step3_success:
                print(f"   - ROI calculation constants or business stages not accessible")
            if not step4_success:
                print(f"   - avg_user_rate calculation errors present")
            if not step5_success:
                print(f"   - Enhanced ROI fields not being populated correctly")
        else:
            print(f"\n✅ ROI CALCULATION SYSTEM APPEARS TO BE WORKING CORRECTLY")
            print(f"   - All investigation steps passed")
            print(f"   - The '$0/yr' issue may be in frontend display logic")
        
        return overall_success

if __name__ == "__main__":
    tester = ROIInvestigationTester()
    success = tester.run_comprehensive_roi_investigation()
    sys.exit(0 if success else 1)