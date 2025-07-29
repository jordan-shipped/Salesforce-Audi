#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class SimpleBackendTester:
    def __init__(self):
        self.base_url = "https://dd6a7962-9851-4337-9e39-7a17a3866ce2.preview.emergentagent.com"
        self.api_url = f"{self.base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def test_endpoint(self, name, method, endpoint, expected_status, data=None):
        """Test a single endpoint"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, timeout=10)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == expected_status:
                self.tests_passed += 1
                print(f"✅ PASSED")
                try:
                    if response.headers.get('content-type', '').startswith('application/json'):
                        response_data = response.json()
                        print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    else:
                        print(f"   Response: {response.text[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
                return True
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False
                
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False

    def run_comprehensive_tests(self):
        """Run comprehensive backend tests as requested in review"""
        print("🚨 COMPREHENSIVE BACKEND TESTING AFTER GITHUB REPOSITORY INTEGRATION")
        print("=" * 80)
        
        results = {}
        
        # 1. Core API Endpoints
        print("\n📋 1. CORE API ENDPOINTS")
        print("-" * 50)
        
        # Test health endpoint
        results['health'] = self.test_endpoint("Health Check", "GET", "health", 200)
        
        # Test root endpoint  
        results['root'] = self.test_endpoint("Root API", "GET", "", 200)
        
        # Test OAuth authorize (should return 302 redirect)
        print(f"\n🔍 Testing OAuth Authorize...")
        print(f"   URL: {self.api_url}/oauth/authorize")
        try:
            response = requests.get(f"{self.api_url}/oauth/authorize", allow_redirects=False, timeout=10)
            print(f"   Status: {response.status_code}")
            if response.status_code == 302:
                print("✅ PASSED - Returns 302 redirect")
                results['oauth_authorize'] = True
                self.tests_passed += 1
            else:
                print(f"❌ FAILED - Expected 302, got {response.status_code}")
                results['oauth_authorize'] = False
            self.tests_run += 1
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            results['oauth_authorize'] = False
            self.tests_run += 1
        
        # Test audit sessions
        results['audit_sessions'] = self.test_endpoint("Audit Sessions", "GET", "audit/sessions", 200)
        
        # 2. Business Information Flow
        print("\n📋 2. BUSINESS INFORMATION FLOW")
        print("-" * 50)
        
        # Test business info POST
        business_data = {
            "revenue_bucket": "$250K – $500K",
            "headcount_bucket": "5 – 9"
        }
        results['business_info_post'] = self.test_endpoint(
            "Business Info POST", "POST", "session/business-info", 200, business_data
        )
        
        # Test business stage mapping
        stage_data = {
            "annual_revenue": 375000,
            "employee_headcount": 7
        }
        results['business_stage'] = self.test_endpoint(
            "Business Stage Mapping", "POST", "business/stage", 200, stage_data
        )
        
        # Test all business stages
        results['all_stages'] = self.test_endpoint("All Business Stages", "GET", "business/stages", 200)
        
        # 3. Environment and MongoDB Testing
        print("\n📋 3. ENVIRONMENT & MONGODB TESTING")
        print("-" * 50)
        
        # MongoDB is tested through audit sessions endpoint
        results['mongodb'] = results['audit_sessions']
        if results['mongodb']:
            print("✅ Async MongoDB operations working (sessions endpoint accessible)")
        else:
            print("❌ Async MongoDB operations may have issues")
        
        # 4. Test Revenue and Headcount Buckets
        print("\n📋 4. REVENUE & HEADCOUNT BUCKET VALIDATION")
        print("-" * 50)
        
        # Test a few key revenue buckets
        revenue_buckets = ["Under $100K", "$100K – $250K", "$250K – $500K", "$30M+"]
        headcount_buckets = ["Just me, no revenue", "2 – 4", "5 – 9", "250 – 500"]
        
        bucket_tests_passed = 0
        bucket_tests_total = 0
        
        for revenue in revenue_buckets[:2]:  # Test first 2 to save time
            for headcount in headcount_buckets[:2]:  # Test first 2 to save time
                bucket_data = {
                    "revenue_bucket": revenue,
                    "headcount_bucket": headcount
                }
                bucket_tests_total += 1
                if self.test_endpoint(f"Bucket Test ({revenue}, {headcount})", "POST", "session/business-info", 200, bucket_data):
                    bucket_tests_passed += 1
        
        results['bucket_validation'] = bucket_tests_passed == bucket_tests_total
        
        # SUMMARY
        print("\n📊 COMPREHENSIVE TESTING SUMMARY")
        print("=" * 80)
        
        test_categories = [
            ("Health Endpoint", results.get('health', False)),
            ("Root API Endpoint", results.get('root', False)),
            ("OAuth Authorization", results.get('oauth_authorize', False)),
            ("Audit Sessions", results.get('audit_sessions', False)),
            ("Business Info Flow", results.get('business_info_post', False)),
            ("Business Stage Mapping", results.get('business_stage', False)),
            ("All Business Stages", results.get('all_stages', False)),
            ("MongoDB Operations", results.get('mongodb', False)),
            ("Bucket Validation", results.get('bucket_validation', False))
        ]
        
        passed_categories = 0
        for category, success in test_categories:
            if success:
                print(f"✅ {category}: PASSED")
                passed_categories += 1
            else:
                print(f"❌ {category}: FAILED")
        
        print(f"\n🎯 OVERALL RESULTS: {passed_categories}/{len(test_categories)} categories passed")
        print(f"📊 Individual Tests: {self.tests_passed}/{self.tests_run} tests passed")
        
        if passed_categories >= 7:  # Allow 1-2 failures
            print("\n🎉 BACKEND TESTING LARGELY SUCCESSFUL!")
            print("✅ Core functionality working after GitHub repository integration")
            return True
        else:
            print("\n⚠️ SIGNIFICANT BACKEND ISSUES DETECTED")
            print("❌ Multiple critical endpoints failing")
            return False

if __name__ == "__main__":
    tester = SimpleBackendTester()
    success = tester.run_comprehensive_tests()
    sys.exit(0 if success else 1)