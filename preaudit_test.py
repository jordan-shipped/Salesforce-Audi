#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import re
from urllib.parse import urlparse, parse_qs

class PreAuditModalTester:
    def __init__(self, base_url="https://0c6c660a-787f-48ab-8364-a6e87a12d36b.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

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

    def test_preaudit_modal_backend_comprehensive(self):
        """COMPREHENSIVE PREAUDIT MODAL BACKEND TESTING - As requested in review"""
        print("\n🎯 PREAUDIT MODAL BACKEND COMPREHENSIVE TESTING")
        print("=" * 60)
        print("Testing BusinessInfoRequest model and /api/session/business-info endpoint")
        
        all_tests_passed = True
        test_results = {}
        
        # 1. TEST POST /api/session/business-info WITH VALID DATA
        print("\n📋 1. TESTING POST /api/session/business-info WITH VALID DATA")
        print("-" * 50)
        
        # Test all valid revenue buckets
        valid_revenue_buckets = [
            "Under $100K", "$100K – $250K", "$250K – $500K", "$500K – $1M", 
            "$1M – $3M", "$3M – $10M", "$10M – $30M", "$30M+"
        ]
        
        valid_headcount_buckets = [
            "Just me, no revenue", "Just me, some revenue", "Me & vendors",
            "2 – 4", "5 – 9", "10 – 19", "20 – 49", "50 – 99", "100 – 249", "250 – 500"
        ]
        
        # Test with each valid revenue bucket
        print("🔍 Testing all valid revenue buckets...")
        revenue_test_results = []
        
        for revenue_bucket in valid_revenue_buckets:
            test_data = {
                "revenue_bucket": revenue_bucket,
                "headcount_bucket": "5 – 9"  # Use consistent headcount for revenue tests
            }
            
            success, response = self.run_test(
                f"POST business-info (Revenue: {revenue_bucket})",
                "POST",
                "session/business-info",
                200,
                data=test_data
            )
            
            if success:
                # Validate response structure
                required_fields = ['success', 'business_session_id', 'message']
                valid_response = all(field in response for field in required_fields)
                
                if valid_response and response.get('success') == True:
                    print(f"✅ Revenue bucket '{revenue_bucket}' accepted")
                    revenue_test_results.append(True)
                    
                    # Store session ID for later testing
                    if revenue_bucket == "$30M+":  # Test the highest bucket for Stage 9 mapping
                        test_results['stage9_session_id'] = response['business_session_id']
                    elif revenue_bucket == "$250K – $500K":  # Test mid-range bucket
                        test_results['mid_range_session_id'] = response['business_session_id']
                else:
                    print(f"❌ Invalid response structure for '{revenue_bucket}': {response}")
                    revenue_test_results.append(False)
                    all_tests_passed = False
            else:
                print(f"❌ Revenue bucket '{revenue_bucket}' rejected")
                revenue_test_results.append(False)
                all_tests_passed = False
        
        test_results['revenue_buckets_valid'] = all(revenue_test_results)
        print(f"Revenue buckets test: {sum(revenue_test_results)}/{len(revenue_test_results)} passed")
        
        # Test with each valid headcount bucket
        print("\n🔍 Testing all valid headcount buckets...")
        headcount_test_results = []
        
        for headcount_bucket in valid_headcount_buckets:
            test_data = {
                "revenue_bucket": "$1M – $3M",  # Use consistent revenue for headcount tests
                "headcount_bucket": headcount_bucket
            }
            
            success, response = self.run_test(
                f"POST business-info (Headcount: {headcount_bucket})",
                "POST",
                "session/business-info",
                200,
                data=test_data
            )
            
            if success:
                required_fields = ['success', 'business_session_id', 'message']
                valid_response = all(field in response for field in required_fields)
                
                if valid_response and response.get('success') == True:
                    print(f"✅ Headcount bucket '{headcount_bucket}' accepted")
                    headcount_test_results.append(True)
                    
                    # Store session ID for testing "250 – 500" mapping
                    if headcount_bucket == "250 – 500":
                        test_results['large_headcount_session_id'] = response['business_session_id']
                else:
                    print(f"❌ Invalid response structure for '{headcount_bucket}': {response}")
                    headcount_test_results.append(False)
                    all_tests_passed = False
            else:
                print(f"❌ Headcount bucket '{headcount_bucket}' rejected")
                headcount_test_results.append(False)
                all_tests_passed = False
        
        test_results['headcount_buckets_valid'] = all(headcount_test_results)
        print(f"Headcount buckets test: {sum(headcount_test_results)}/{len(headcount_test_results)} passed")
        
        # 2. TEST VALIDATION WITH INVALID DATA
        print("\n📋 2. TESTING VALIDATION WITH INVALID DATA")
        print("-" * 50)
        
        # Test invalid revenue bucket
        print("🔍 Testing invalid revenue bucket...")
        invalid_revenue_data = {
            "revenue_bucket": "Invalid Revenue Range",
            "headcount_bucket": "5 – 9"
        }
        
        success, response = self.run_test(
            "POST business-info (Invalid Revenue)",
            "POST",
            "session/business-info",
            400,
            data=invalid_revenue_data
        )
        
        test_results['invalid_revenue_rejected'] = success
        if success:
            print("✅ Invalid revenue bucket properly rejected with 400 error")
        else:
            print("❌ Invalid revenue bucket not properly rejected")
            all_tests_passed = False
        
        # Test invalid headcount bucket
        print("🔍 Testing invalid headcount bucket...")
        invalid_headcount_data = {
            "revenue_bucket": "$1M – $3M",
            "headcount_bucket": "Invalid Headcount Range"
        }
        
        success, response = self.run_test(
            "POST business-info (Invalid Headcount)",
            "POST",
            "session/business-info",
            400,
            data=invalid_headcount_data
        )
        
        test_results['invalid_headcount_rejected'] = success
        if success:
            print("✅ Invalid headcount bucket properly rejected with 400 error")
        else:
            print("❌ Invalid headcount bucket not properly rejected")
            all_tests_passed = False
        
        # Test missing fields
        print("🔍 Testing missing required fields...")
        missing_fields_data = {
            "revenue_bucket": "$1M – $3M"
            # Missing headcount_bucket
        }
        
        success, response = self.run_test(
            "POST business-info (Missing Fields)",
            "POST",
            "session/business-info",
            422,  # Pydantic validation error
            data=missing_fields_data
        )
        
        test_results['missing_fields_rejected'] = success
        if success:
            print("✅ Missing fields properly rejected with 422 validation error")
        else:
            print("❌ Missing fields not properly rejected")
            all_tests_passed = False
        
        # 3. TEST GET /api/session/business-info/{session_id}
        print("\n📋 3. TESTING GET /api/session/business-info/{session_id}")
        print("-" * 50)
        
        # Test retrieval with valid session ID
        if test_results.get('mid_range_session_id'):
            session_id = test_results['mid_range_session_id']
            print(f"🔍 Testing retrieval with session ID: {session_id}")
            
            success, response = self.run_test(
                "GET business-info (Valid Session)",
                "GET",
                f"session/business-info/{session_id}",
                200
            )
            
            if success:
                # Validate response structure
                expected_fields = ['business_session_id', 'revenue_bucket', 'headcount_bucket', 'annual_revenue', 'employee_headcount']
                valid_structure = all(field in response for field in expected_fields)
                
                if valid_structure:
                    print("✅ Business info retrieval successful with complete structure")
                    print(f"   Revenue bucket: {response.get('revenue_bucket')}")
                    print(f"   Headcount bucket: {response.get('headcount_bucket')}")
                    print(f"   Annual revenue: ${response.get('annual_revenue'):,}")
                    print(f"   Employee headcount: {response.get('employee_headcount')}")
                    test_results['retrieval_valid_session'] = True
                else:
                    print(f"❌ Invalid response structure: {response}")
                    test_results['retrieval_valid_session'] = False
                    all_tests_passed = False
            else:
                print("❌ Failed to retrieve business info with valid session")
                test_results['retrieval_valid_session'] = False
                all_tests_passed = False
        else:
            print("⚠️ No valid session ID available for retrieval test")
            test_results['retrieval_valid_session'] = False
            all_tests_passed = False
        
        # Test retrieval with non-existent session ID
        print("🔍 Testing retrieval with non-existent session ID...")
        success, response = self.run_test(
            "GET business-info (Non-existent Session)",
            "GET",
            "session/business-info/nonexistent-session-id-12345",
            404
        )
        
        test_results['retrieval_nonexistent_session'] = success
        if success:
            print("✅ Non-existent session properly returns 404")
        else:
            print("❌ Non-existent session handling failed")
            all_tests_passed = False
        
        # 4. TEST NUMERIC CONVERSION MAPPINGS
        print("\n📋 4. TESTING NUMERIC CONVERSION MAPPINGS")
        print("-" * 50)
        
        # Test "$30M+" converts to $150,000,000 (Stage 9 mapping)
        if test_results.get('stage9_session_id'):
            session_id = test_results['stage9_session_id']
            print("🔍 Testing $30M+ → $150,000,000 conversion...")
            
            success, response = self.run_test(
                "GET business-info (Stage 9 Revenue)",
                "GET",
                f"session/business-info/{session_id}",
                200
            )
            
            if success and response.get('annual_revenue') == 150000000:
                print("✅ $30M+ correctly converts to $150,000,000")
                test_results['stage9_revenue_mapping'] = True
            else:
                print(f"❌ $30M+ conversion failed. Expected: 150000000, Got: {response.get('annual_revenue')}")
                test_results['stage9_revenue_mapping'] = False
                all_tests_passed = False
        else:
            print("⚠️ No Stage 9 session available for revenue mapping test")
            test_results['stage9_revenue_mapping'] = False
            all_tests_passed = False
        
        # Test "250 – 500" converts to 375 employees
        if test_results.get('large_headcount_session_id'):
            session_id = test_results['large_headcount_session_id']
            print("🔍 Testing '250 – 500' → 375 employees conversion...")
            
            success, response = self.run_test(
                "GET business-info (Large Headcount)",
                "GET",
                f"session/business-info/{session_id}",
                200
            )
            
            if success and response.get('employee_headcount') == 375:
                print("✅ '250 – 500' correctly converts to 375 employees")
                test_results['large_headcount_mapping'] = True
            else:
                print(f"❌ '250 – 500' conversion failed. Expected: 375, Got: {response.get('employee_headcount')}")
                test_results['large_headcount_mapping'] = False
                all_tests_passed = False
        else:
            print("⚠️ No large headcount session available for mapping test")
            test_results['large_headcount_mapping'] = False
            all_tests_passed = False
        
        # Test a few more key mappings
        print("🔍 Testing additional key mappings...")
        
        # Test "$250K – $500K" → 375000
        test_data = {
            "revenue_bucket": "$250K – $500K",
            "headcount_bucket": "5 – 9"
        }
        
        success, response = self.run_test(
            "POST business-info (Mid Revenue Test)",
            "POST",
            "session/business-info",
            200,
            data=test_data
        )
        
        if success:
            session_id = response.get('business_session_id')
            success2, response2 = self.run_test(
                "GET business-info (Mid Revenue Mapping)",
                "GET",
                f"session/business-info/{session_id}",
                200
            )
            
            if success2 and response2.get('annual_revenue') == 375000 and response2.get('employee_headcount') == 7:
                print("✅ '$250K – $500K' → $375,000 and '5 – 9' → 7 employees")
                test_results['mid_range_mappings'] = True
            else:
                print(f"❌ Mid-range mappings failed. Revenue: {response2.get('annual_revenue')}, Headcount: {response2.get('employee_headcount')}")
                test_results['mid_range_mappings'] = False
                all_tests_passed = False
        else:
            test_results['mid_range_mappings'] = False
            all_tests_passed = False
        
        # SUMMARY OF PREAUDIT MODAL TESTING
        print("\n📊 PREAUDIT MODAL BACKEND TESTING SUMMARY")
        print("=" * 60)
        
        test_criteria = [
            ("✅ All valid revenue buckets accepted", test_results.get('revenue_buckets_valid', False)),
            ("✅ All valid headcount buckets accepted", test_results.get('headcount_buckets_valid', False)),
            ("✅ Invalid revenue bucket rejected (400)", test_results.get('invalid_revenue_rejected', False)),
            ("✅ Invalid headcount bucket rejected (400)", test_results.get('invalid_headcount_rejected', False)),
            ("✅ Missing fields rejected (422)", test_results.get('missing_fields_rejected', False)),
            ("✅ Valid session retrieval works", test_results.get('retrieval_valid_session', False)),
            ("✅ Non-existent session returns 404", test_results.get('retrieval_nonexistent_session', False)),
            ("✅ $30M+ → $150,000,000 mapping", test_results.get('stage9_revenue_mapping', False)),
            ("✅ '250 – 500' → 375 employees mapping", test_results.get('large_headcount_mapping', False)),
            ("✅ Mid-range mappings correct", test_results.get('mid_range_mappings', False))
        ]
        
        passed_count = 0
        for description, passed in test_criteria:
            if passed:
                print(f"{description}")
                passed_count += 1
            else:
                print(f"❌{description[1:]}")
        
        print(f"\n🎯 PREAUDIT MODAL TEST RESULTS: {passed_count}/{len(test_criteria)} PASSED")
        
        if all_tests_passed:
            print("🎉 ALL PREAUDIT MODAL BACKEND TESTS PASSED!")
            print("✅ BusinessInfoRequest model validation working correctly")
            print("✅ POST /api/session/business-info endpoint fully functional")
            print("✅ GET /api/session/business-info/{session_id} endpoint working")
            print("✅ All revenue and headcount bucket validations working")
            print("✅ Numeric conversion mappings are correct")
            print("✅ Error handling for invalid data working properly")
        else:
            print("⚠️ SOME PREAUDIT MODAL BACKEND TESTS FAILED")
            print("❌ Review the failed test cases above for specific issues")
        
        return all_tests_passed, test_results

if __name__ == "__main__":
    tester = PreAuditModalTester()
    
    print("🎯 RUNNING PREAUDIT MODAL BACKEND TESTS")
    print("=" * 60)
    
    success, results = tester.test_preaudit_modal_backend_comprehensive()
    
    print(f"\n📊 Final Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if success:
        print("\n🎉 PREAUDIT MODAL BACKEND TESTING COMPLETED SUCCESSFULLY!")
        print("✅ All backend functionality is working as expected")
        print("✅ Apple-style UI changes did not affect backend functionality")
    else:
        print("\n⚠️ SOME PREAUDIT MODAL BACKEND TESTS FAILED!")
        print("❌ Backend functionality may have been affected by UI changes")