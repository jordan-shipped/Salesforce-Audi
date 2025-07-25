#!/usr/bin/env python3
"""
Unit test for None handling in business stage determination
"""

import sys
import os
sys.path.append('/app/backend')

# Mock the required imports
class MockBusinessInputs:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

def test_none_handling():
    """Test that None values don't cause comparison errors"""
    
    # Import the functions we need to test
    from server import determine_business_stage, convert_picklist_to_numeric
    
    print("Testing None handling in business stage determination...")
    
    # Test 1: None values directly
    print("\nTest 1: None values directly")
    try:
        result = determine_business_stage(None, None)
        print(f"✅ determine_business_stage(None, None) = Stage {result['stage']} ({result['name']})")
    except Exception as e:
        print(f"❌ determine_business_stage(None, None) failed: {e}")
        return False
    
    # Test 2: convert_picklist_to_numeric with None input
    print("\nTest 2: convert_picklist_to_numeric with None input")
    try:
        revenue, headcount = convert_picklist_to_numeric(None)
        print(f"✅ convert_picklist_to_numeric(None) = revenue={revenue}, headcount={headcount}")
    except Exception as e:
        print(f"❌ convert_picklist_to_numeric(None) failed: {e}")
        return False
    
    # Test 3: Business inputs with None values
    print("\nTest 3: Business inputs with None values")
    try:
        inputs = MockBusinessInputs(annual_revenue=None, employee_headcount=None)
        revenue, headcount = convert_picklist_to_numeric(inputs)
        result = determine_business_stage(revenue, headcount)
        print(f"✅ Business inputs with None values = Stage {result['stage']} ({result['name']})")
    except Exception as e:
        print(f"❌ Business inputs with None values failed: {e}")
        return False
    
    # Test 4: Empty business inputs
    print("\nTest 4: Empty business inputs")
    try:
        inputs = MockBusinessInputs()
        revenue, headcount = convert_picklist_to_numeric(inputs)
        result = determine_business_stage(revenue, headcount)
        print(f"✅ Empty business inputs = Stage {result['stage']} ({result['name']})")
    except Exception as e:
        print(f"❌ Empty business inputs failed: {e}")
        return False
    
    # Test 5: Valid picklist values
    print("\nTest 5: Valid picklist values")
    try:
        inputs = MockBusinessInputs(revenue_range="1M–3M", employee_range="5–9")
        revenue, headcount = convert_picklist_to_numeric(inputs)
        result = determine_business_stage(revenue, headcount)
        print(f"✅ Valid picklist values = Stage {result['stage']} ({result['name']}) with revenue=${revenue:,}, headcount={headcount}")
    except Exception as e:
        print(f"❌ Valid picklist values failed: {e}")
        return False
    
    print("\n🎉 All None handling tests passed!")
    return True

if __name__ == "__main__":
    success = test_none_handling()
    sys.exit(0 if success else 1)