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
            params={"session_id": "invalid_session"}
        )

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

    def validate_audit_data(self, audit_response):
        """Validate the structure and content of audit data"""
        print("\n🔍 Validating audit data structure...")
        
        required_fields = ['session_id', 'summary', 'findings']
        for field in required_fields:
            if field not in audit_response:
                print(f"❌ Missing required field: {field}")
                return False
        
        summary = audit_response['summary']
        required_summary_fields = ['total_findings', 'total_time_savings_hours', 'total_annual_roi', 'category_breakdown']
        for field in required_summary_fields:
            if field not in summary:
                print(f"❌ Missing summary field: {field}")
                return False
        
        findings = audit_response['findings']
        if not isinstance(findings, list) or len(findings) == 0:
            print("❌ Findings should be a non-empty list")
            return False
        
        # Check first finding structure
        first_finding = findings[0]
        required_finding_fields = ['id', 'category', 'title', 'description', 'impact', 'time_savings_hours', 'roi_estimate', 'recommendation']
        for field in required_finding_fields:
            if field not in first_finding:
                print(f"❌ Missing finding field: {field}")
                return False
        
        # Validate categories
        expected_categories = ['Time Savings', 'Revenue Leaks', 'Automation Opportunities']
        found_categories = set(f['category'] for f in findings)
        for category in expected_categories:
            if category not in found_categories:
                print(f"❌ Missing expected category: {category}")
                return False
        
        print("✅ Audit data structure validation passed")
        return True

def main():
    print("🚀 Starting Salesforce Audit API Tests")
    print("=" * 50)
    
    tester = SalesforceAuditAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("OAuth Connect", tester.test_oauth_connect),
        ("Run Audit", tester.test_run_audit),
        ("Get Audit Sessions", tester.test_get_audit_sessions),
        ("Get Audit Details", tester.test_get_audit_details),
        ("Generate PDF", tester.test_generate_pdf),
    ]
    
    audit_data = None
    
    for test_name, test_func in tests:
        success, response = test_func()
        if test_name == "Run Audit" and success:
            audit_data = response
    
    # Validate audit data structure if we got it
    if audit_data:
        tester.validate_audit_data(audit_data)
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())