import requests
import sys
import json
from datetime import datetime

class SalesforceAuditAPITester:
    def __init__(self, base_url="https://249e3f06-be63-42b0-8e97-2af884987c5c.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
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

    def test_oauth_connect(self):
        """Test OAuth connection endpoint"""
        return self.run_test(
            "OAuth Connect",
            "POST", 
            "oauth/connect",
            200,
            data={"org_name": "Test Salesforce Org"}
        )

    def test_run_audit(self):
        """Test running an audit"""
        success, response = self.run_test(
            "Run Audit",
            "POST",
            "audit/run", 
            200
        )
        if success and 'session_id' in response:
            self.session_id = response['session_id']
            print(f"   Session ID: {self.session_id}")
        return success, response

    def test_get_audit_sessions(self):
        """Test getting audit sessions"""
        return self.run_test(
            "Get Audit Sessions",
            "GET",
            "audit/sessions",
            200
        )

    def test_get_audit_details(self):
        """Test getting audit details"""
        if not self.session_id:
            print("❌ Skipping audit details test - no session ID available")
            return False, {}
        
        return self.run_test(
            "Get Audit Details",
            "GET",
            f"audit/{self.session_id}",
            200
        )

    def test_generate_pdf(self):
        """Test PDF generation"""
        if not self.session_id:
            print("❌ Skipping PDF test - no session ID available")
            return False, {}
            
        return self.run_test(
            "Generate PDF Report",
            "GET",
            f"audit/{self.session_id}/pdf",
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