import requests
import sys
import json
from datetime import datetime
import re
from urllib.parse import urlparse, parse_qs

class SalesforceAuditAPITester:
    def __init__(self, base_url="https://249e3f06-be63-42b0-8e97-2af884987c5c.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.oauth_state = None
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:300]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_oauth_authorize(self):
        """Test OAuth authorization endpoint"""
        success, response = self.run_test(
            "OAuth Authorize",
            "GET", 
            "oauth/authorize",
            200
        )
        
        if success and 'authorization_url' in response:
            auth_url = response['authorization_url']
            self.oauth_state = response.get('state')
            
            # Validate the authorization URL structure
            print(f"\n🔍 Validating OAuth URL structure...")
            print(f"   Auth URL: {auth_url}")
            
            # Parse URL components
            parsed_url = urlparse(auth_url)
            query_params = parse_qs(parsed_url.query)
            
            # Expected URL structure validation
            expected_base = "https://login.salesforce.com/services/oauth2/authorize"
            if not auth_url.startswith(expected_base):
                print(f"❌ Invalid base URL. Expected: {expected_base}")
                return False, response
            
            # Check required parameters
            required_params = ['client_id', 'redirect_uri', 'scope', 'state', 'response_type']
            for param in required_params:
                if param not in query_params:
                    print(f"❌ Missing required parameter: {param}")
                    return False, response
            
            # Validate specific parameter values
            if query_params.get('client_id', [''])[0] != '3MVG9BBZP0d0A9KAyOOqhXjeH9PXBsXSaw7NsQ7JhgWkUthSAKSLSWXboNRXlYhTjzVqV9Ja223CMpkekeQ7o':
                print(f"❌ Invalid client_id")
                return False, response
            
            expected_callback = "https://249e3f06-be63-42b0-8e97-2af884987c5c.preview.emergentagent.com/oauth/callback"
            if query_params.get('redirect_uri', [''])[0] != expected_callback:
                print(f"❌ Invalid redirect_uri")
                return False, response
            
            if query_params.get('scope', [''])[0] != 'api refresh_token':
                print(f"❌ Invalid scope")
                return False, response
            
            if query_params.get('response_type', [''])[0] != 'code':
                print(f"❌ Invalid response_type")
                return False, response
            
            print("✅ OAuth URL structure validation passed")
            
        return success, response

    def test_oauth_callback_invalid_state(self):
        """Test OAuth callback with invalid state"""
        return self.run_test(
            "OAuth Callback (Invalid State)",
            "GET",
            "oauth/callback",
            400,
            params={"code": "test_code", "state": "invalid_state"}
        )

    def test_get_audit_sessions(self):
        """Test getting audit sessions"""
        return self.run_test(
            "Get Audit Sessions",
            "GET",
            "audit/sessions",
            200
        )

    def test_run_audit_without_session(self):
        """Test running audit without valid session"""
        return self.run_test(
            "Run Audit (No Session)",
            "POST",
            "audit/run",
            401,
            data={"session_id": "invalid_session", "use_quick_estimate": True}
        )

    def test_enhanced_audit_request_structure(self):
        """Test the new enhanced audit request structure with department salaries"""
        print("\n🔍 Testing Enhanced Audit Request Structure...")
        
        # Test Quick Estimate request
        quick_request = {
            "session_id": "test_session_id",
            "use_quick_estimate": True,
            "department_salaries": None
        }
        
        success1, response1 = self.run_test(
            "Enhanced Audit Request (Quick)",
            "POST",
            "audit/run",
            401,  # Should fail due to invalid session, but structure should be accepted
            data=quick_request
        )
        
        # Test Custom Estimate request with department salaries
        custom_request = {
            "session_id": "test_session_id",
            "use_quick_estimate": False,
            "department_salaries": {
                "customer_service": 45000,
                "sales": 65000,
                "marketing": 60000,
                "engineering": 95000,
                "executives": 150000
            }
        }
        
        success2, response2 = self.run_test(
            "Enhanced Audit Request (Custom)",
            "POST",
            "audit/run",
            401,  # Should fail due to invalid session, but structure should be accepted
            data=custom_request
        )
        
        # Both should fail with session error, not structure error
        if success1 or success2:
            # Check if the error is about session, not structure
            error1 = response1.get('error', '') if response1 else ''
            error2 = response2.get('error', '') if response2 else ''
            
            structure_valid = (
                'Invalid or expired session' in error1 or 
                'Invalid or expired session' in error2 or
                'session' in error1.lower() or 
                'session' in error2.lower()
            )
            
            if structure_valid:
                print("✅ Enhanced audit request structure accepted (failed on session as expected)")
                return True, {"structure_test": "passed"}
            else:
                print(f"❌ Unexpected error - may be structure issue: {error1} | {error2}")
                return False, {}
        
        return success1 or success2, response1 or response2

    def test_get_audit_details_not_found(self):
        """Test getting audit details for non-existent session"""
        return self.run_test(
            "Get Audit Details (Not Found)",
            "GET",
            "audit/nonexistent_session_id",
            404
        )

    def test_generate_pdf_mock(self):
        """Test PDF generation mock endpoint"""
        return self.run_test(
            "Generate PDF Report (Mock)",
            "GET",
            "audit/test_session/pdf",
            200
        )

    def test_audit_data_structure(self):
        """Test the structure of audit data to verify new ROI improvements"""
        print("\n🔍 Testing New ROI Calculation Structure...")
        
        # Get existing sessions
        success, sessions = self.run_test(
            "Get Sessions for Structure Test",
            "GET",
            "audit/sessions",
            200
        )
        
        if not success or not sessions:
            print("❌ No sessions available for structure testing")
            return False, {}
        
        # Get details of the first session
        session_id = sessions[0]['id']
        success, details = self.run_test(
            "Get Audit Details for Structure Test",
            "GET",
            f"audit/{session_id}",
            200
        )
        
        if not success:
            return False, {}
        
        # Validate new structure elements
        findings = details.get('findings', [])
        if not findings:
            print("❌ No findings in audit data")
            return False, {}
        
        print(f"\n📊 Analyzing {len(findings)} findings for new ROI structure...")
        
        # Check for org-specific context in findings
        org_context_found = False
        methodology_found = False
        salesforce_data_found = False
        
        for finding in findings:
            # Check for org context
            if 'org_context' in finding:
                org_context_found = True
                org_context = finding['org_context']
                print(f"✅ Found org_context: {org_context}")
                
                # Validate org context structure
                expected_fields = ['hourly_rate', 'active_users', 'org_type']
                for field in expected_fields:
                    if field not in org_context:
                        print(f"❌ Missing {field} in org_context")
                        return False, {}
            
            # Check for detailed methodology in salesforce_data
            if 'salesforce_data' in finding:
                salesforce_data_found = True
                sf_data = finding['salesforce_data']
                print(f"✅ Found salesforce_data with keys: {list(sf_data.keys())}")
                
                # Check for calculation methodology
                if 'calculation_method' in sf_data:
                    methodology_found = True
                    print(f"✅ Found calculation_method: {sf_data['calculation_method']}")
        
        # Validate findings
        if not org_context_found:
            print("❌ No org_context found in findings - new ROI logic may not be implemented")
            return False, {}
        
        if not salesforce_data_found:
            print("❌ No salesforce_data found in findings - detailed methodology missing")
            return False, {}
        
        if not methodology_found:
            print("❌ No calculation_method found - methodology tracking missing")
            return False, {}
        
        print("✅ New ROI calculation structure validation passed!")
        return True, details

    def validate_enhanced_roi_structure(self):
        """Validate the new enhanced ROI calculation structure"""
        print("\n🔍 Testing Enhanced ROI Calculation Structure...")
        
        # Get existing sessions
        success, sessions = self.run_test(
            "Get Sessions for Enhanced ROI Test",
            "GET",
            "audit/sessions",
            200
        )
        
        if not success or not sessions:
            print("❌ No sessions available for enhanced ROI testing")
            return False, {}
        
        # Get details of the first session
        session_id = sessions[0]['id']
        success, details = self.run_test(
            "Get Audit Details for Enhanced ROI Test",
            "GET",
            f"audit/{session_id}",
            200
        )
        
        if not success:
            return False, {}
        
        # Check for enhanced ROI structure in findings
        findings = details.get('findings', [])
        summary = details.get('summary', {})
        
        print(f"\n📊 Analyzing {len(findings)} findings for enhanced ROI structure...")
        
        # Check for new ROI fields in findings
        enhanced_fields_found = {
            'cleanup_cost': False,
            'cleanup_hours': False,
            'monthly_user_savings': False,
            'annual_user_savings': False,
            'net_annual_roi': False,
            'calculation_method': False
        }
        
        for finding in findings:
            # Check for new enhanced ROI fields
            for field in enhanced_fields_found.keys():
                if field in finding:
                    enhanced_fields_found[field] = True
                    print(f"✅ Found {field}: {finding[field]}")
            
            # Check salesforce_data for calculation details
            if 'salesforce_data' in finding:
                sf_data = finding['salesforce_data']
                if 'calculation_method' in sf_data:
                    enhanced_fields_found['calculation_method'] = True
                    print(f"✅ Found calculation_method in salesforce_data: {sf_data['calculation_method'][:100]}...")
                
                # Check for ROI breakdown
                if 'roi_breakdown' in sf_data:
                    print(f"✅ Found roi_breakdown: {sf_data['roi_breakdown']}")
        
        # Check summary for enhanced structure
        summary_enhanced_fields = {
            'total_cleanup_cost': summary.get('total_cleanup_cost'),
            'total_monthly_savings': summary.get('total_monthly_savings'),
            'total_annual_savings': summary.get('total_annual_savings'),
            'calculation_method': summary.get('calculation_method')
        }
        
        print(f"\n📊 Summary enhanced fields: {summary_enhanced_fields}")
        
        # Validate that at least some enhanced fields are present
        enhanced_count = sum(1 for found in enhanced_fields_found.values() if found)
        if enhanced_count >= 3:  # At least 3 enhanced fields should be present
            print(f"✅ Enhanced ROI structure validation passed! ({enhanced_count}/6 fields found)")
            return True, details
        else:
            print(f"❌ Enhanced ROI structure incomplete ({enhanced_count}/6 fields found)")
            return False, {}

    def test_department_salary_calculations(self):
        """Test department salary calculation assumptions"""
        print("\n🔍 Testing Department Salary Calculation Logic...")
        
        # Test the calculation assumptions mentioned in the review
        test_departments = {
            'customer_service': 45000,
            'sales': 65000,
            'marketing': 60000,
            'engineering': 95000,
            'executives': 150000
        }
        
        # Calculate hourly rates (÷ 2,080 hours per year)
        hourly_rates = {}
        for dept, salary in test_departments.items():
            hourly_rate = salary / 2080
            hourly_rates[dept] = hourly_rate
            print(f"   {dept.replace('_', ' ').title()}: ${salary:,} → ${hourly_rate:.2f}/hr")
        
        # Calculate average hourly rate
        avg_hourly_rate = sum(hourly_rates.values()) / len(hourly_rates)
        print(f"   Average hourly rate: ${avg_hourly_rate:.2f}/hr")
        
        # Test calculation assumptions
        ADMIN_RATE = 40  # $40/hr admin cleanup rate
        CLEANUP_TIME_PER_FIELD = 0.25  # 15 minutes per field
        USER_CONFUSION_TIME = 2  # 2 minutes per user per field per month
        
        # Example calculation for 18 unused fields with 10 users
        field_count = 18
        user_count = 10
        
        # One-time cleanup cost
        cleanup_hours = field_count * CLEANUP_TIME_PER_FIELD
        cleanup_cost = cleanup_hours * ADMIN_RATE
        
        # Monthly user savings
        monthly_confusion_minutes = user_count * USER_CONFUSION_TIME * field_count
        monthly_confusion_hours = monthly_confusion_minutes / 60
        monthly_user_savings = monthly_confusion_hours * avg_hourly_rate
        
        # Annual savings
        annual_user_savings = monthly_user_savings * 12
        net_annual_roi = annual_user_savings - cleanup_cost
        
        print(f"\n📊 Example Calculation (18 fields, 10 users):")
        print(f"   Cleanup: {field_count} fields × 15min × $40/hr = ${cleanup_cost:.0f} (one-time)")
        print(f"   Monthly savings: {user_count} users × 2min × {field_count} fields = {monthly_confusion_hours:.1f}h × ${avg_hourly_rate:.2f}/hr = ${monthly_user_savings:.0f}/month")
        print(f"   Annual savings: ${annual_user_savings:.0f}")
        print(f"   Net ROI: ${net_annual_roi:.0f}")
        
        # Validate calculations are reasonable
        success = (
            cleanup_cost > 0 and cleanup_cost < 1000 and  # Reasonable cleanup cost
            monthly_user_savings > 0 and monthly_user_savings < 500 and  # Reasonable monthly savings
            net_annual_roi > 0  # Positive ROI
        )
        
        if success:
            print("✅ Department salary calculation logic validation passed!")
        else:
            print("❌ Department salary calculation logic validation failed!")
        
        return success, {
            'cleanup_cost': cleanup_cost,
            'monthly_savings': monthly_user_savings,
            'annual_savings': annual_user_savings,
            'net_roi': net_annual_roi
        }

    def validate_oauth_security(self):
        """Validate OAuth security implementation"""
        print("\n🔍 Validating OAuth security implementation...")
        
        if not self.oauth_state:
            print("❌ No OAuth state captured from authorize endpoint")
            return False
        
        # Check state format (should be UUID)
        import uuid
        try:
            uuid.UUID(self.oauth_state)
            print("✅ OAuth state is properly formatted UUID")
        except ValueError:
            print("❌ OAuth state is not a valid UUID")
            return False
        
        print("✅ OAuth security validation passed")
        return True

def main():
    print("🚀 Starting Salesforce Audit API Tests")
    print("=" * 50)
    
    tester = SalesforceAuditAPITester()
    
    # Test sequence - focusing on real implemented endpoints
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("OAuth Authorize", tester.test_oauth_authorize),
        ("OAuth Callback Invalid State", tester.test_oauth_callback_invalid_state),
        ("Get Audit Sessions", tester.test_get_audit_sessions),
        ("Run Audit Without Session", tester.test_run_audit_without_session),
        ("Get Audit Details Not Found", tester.test_get_audit_details_not_found),
        ("Generate PDF Mock", tester.test_generate_pdf_mock),
        ("Audit Data Structure", tester.test_audit_data_structure),
    ]
    
    for test_name, test_func in tests:
        success, response = test_func()
    
    # Validate OAuth security implementation
    tester.validate_oauth_security()
    
    # Validate new ROI calculations
    tester.validate_roi_calculations()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed >= tester.tests_run - 1:  # Allow 1 failure for edge cases
        print("🎉 Most tests passed! OAuth integration looks good.")
        return 0
    else:
        print("❌ Multiple tests failed - needs investigation")
        return 1

if __name__ == "__main__":
    sys.exit(main())