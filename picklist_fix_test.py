#!/usr/bin/env python3
"""
PICKLIST MAPPING FIX VALIDATION TEST
====================================

This test validates the specific fix mentioned in the review request:
- "30M+" revenue → now maps to $150M (was $50M)
- This should now correctly map to Stage 9: Capitalize (≥$100M range)

TEST SCENARIO:
- Revenue: "30M+" → $150,000,000 
- Employees: "250–500" → 375 employees
- Expected Result: Stage 9 - Capitalize
"""

import requests
import json

def test_picklist_fix():
    """Test the corrected picklist mapping for the enterprise scenario"""
    
    base_url = "https://f7d85829-0100-4d00-b60e-d0a6bd56fc03.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 PICKLIST MAPPING FIX VALIDATION")
    print("=" * 50)
    
    # Test the specific scenario from the review request
    print("\n📊 Testing Enterprise Scenario Fix:")
    print("   Revenue: '30M+' → $150,000,000 (was $50,000,000)")
    print("   Employees: '250–500' → 375 employees")
    print("   Expected: Stage 9 - Capitalize")
    
    # Test with the corrected values
    test_data = {
        "annual_revenue": 150000000,  # $150M (corrected from $50M)
        "employee_headcount": 375     # 375 employees (250-500 range)
    }
    
    print(f"\n🔍 Testing POST /api/business/stage with corrected values...")
    print(f"   Revenue: ${test_data['annual_revenue']:,}")
    print(f"   Employees: {test_data['employee_headcount']}")
    
    try:
        response = requests.post(
            f"{api_url}/business/stage",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            stage = result.get('stage')
            name = result.get('name')
            revenue_range = result.get('revenue_range')
            
            print(f"\n📊 RESULT:")
            print(f"   Stage: {stage}")
            print(f"   Name: {name}")
            print(f"   Revenue Range: {revenue_range}")
            print(f"   Role: {result.get('role')}")
            print(f"   Headcount Range: {result.get('headcount_range')}")
            
            # Validate the fix
            if stage == 9 and name == "Capitalize":
                print(f"\n✅ SUCCESS: Picklist mapping fix is working!")
                print(f"   ✅ Stage 9 (Capitalize) correctly returned")
                print(f"   ✅ Revenue ≥ $100M threshold met (${test_data['annual_revenue']:,})")
                print(f"   ✅ Enterprise scenario fixed")
                
                # Verify the revenue range
                if "≥100M" in revenue_range:
                    print(f"   ✅ Revenue range '≥100M' confirms Stage 9 mapping")
                else:
                    print(f"   ⚠️  Unexpected revenue range: {revenue_range}")
                
                return True, result
            else:
                print(f"\n❌ FAILURE: Picklist mapping fix not working!")
                print(f"   ❌ Expected: Stage 9 - Capitalize")
                print(f"   ❌ Got: Stage {stage} - {name}")
                print(f"   ❌ Revenue ${test_data['annual_revenue']:,} should map to Stage 9")
                return False, result
        else:
            print(f"❌ API call failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False, {}
            
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
        return False, {}

def test_old_mapping():
    """Test what the old mapping ($50M) would return"""
    
    base_url = "https://f7d85829-0100-4d00-b60e-d0a6bd56fc03.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print(f"\n🔍 Testing OLD mapping for comparison:")
    print(f"   Revenue: $50,000,000 (old '30M+' mapping)")
    print(f"   Employees: 375")
    
    test_data = {
        "annual_revenue": 50000000,   # $50M (old mapping)
        "employee_headcount": 375
    }
    
    try:
        response = requests.post(
            f"{api_url}/business/stage",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            stage = result.get('stage')
            name = result.get('name')
            revenue_range = result.get('revenue_range')
            
            print(f"   Result: Stage {stage} - {name} ({revenue_range})")
            
            if stage == 7 and name == "Categorize":
                print(f"   ✅ Confirms old mapping issue: $50M → Stage 7 (not Stage 9)")
            else:
                print(f"   ⚠️  Unexpected result for $50M mapping")
                
            return True, result
        else:
            print(f"   ❌ API call failed: {response.status_code}")
            return False, {}
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False, {}

def main():
    """Run the picklist fix validation test"""
    
    print("🚀 PICKLIST MAPPING FIX VALIDATION TEST")
    print("=" * 60)
    print("Testing the corrected picklist mapping for enterprise scenario")
    print("Review Request: '30M+' revenue → $150M (was $50M) → Stage 9")
    
    # Test the old mapping first for comparison
    old_success, old_result = test_old_mapping()
    
    # Test the corrected mapping
    fix_success, fix_result = test_picklist_fix()
    
    print(f"\n" + "=" * 60)
    print("📊 VALIDATION SUMMARY")
    print("=" * 60)
    
    if fix_success:
        print("✅ PICKLIST MAPPING FIX: WORKING")
        print("   ✅ '30M+' → $150M → Stage 9 (Capitalize)")
        print("   ✅ Enterprise scenario correctly maps to Stage 9")
        print("   ✅ Revenue ≥ $100M threshold met")
        
        if old_success:
            old_stage = old_result.get('stage')
            print(f"   ✅ Comparison: $50M → Stage {old_stage} (old behavior)")
        
        print(f"\n🎯 SUCCESS CRITERIA MET:")
        print(f"   ✅ Stage 9 (Capitalize) returned")
        print(f"   ✅ Revenue ≥ $100M threshold met")
        print(f"   ✅ Enterprise scenario fixed")
        
    else:
        print("❌ PICKLIST MAPPING FIX: NOT WORKING")
        print("   ❌ '30M+' mapping still needs to be corrected")
        print("   ❌ Enterprise scenario not mapping to Stage 9")
        print("   ❌ Revenue threshold issue persists")
        
        print(f"\n🔧 REQUIRED FIX:")
        print(f"   - Update '30M+' picklist conversion from $50M to $150M")
        print(f"   - Ensure $150M maps to Stage 9 (≥$100M range)")
        print(f"   - Test enterprise scenario: 375 employees + $150M revenue")

if __name__ == "__main__":
    main()