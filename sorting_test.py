#!/usr/bin/env python3
"""
Focused test for GET /api/audit/sessions sorting functionality
Testing the fix for sessions being sorted by created_at in descending order
"""

import requests
import json
from datetime import datetime
import sys

def test_sessions_sorting():
    """Test that sessions are properly sorted by created_at descending"""
    
    base_url = "https://0c6c660a-787f-48ab-8364-a6e87a12d36b.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing GET /api/audit/sessions sorting functionality")
    print("=" * 60)
    
    try:
        # Get all sessions
        response = requests.get(f"{api_url}/audit/sessions", timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Failed to get sessions: {response.status_code}")
            return False
        
        sessions = response.json()
        
        if not isinstance(sessions, list):
            print("❌ Response is not a list")
            return False
        
        print(f"✅ Retrieved {len(sessions)} sessions")
        
        if len(sessions) == 0:
            print("ℹ️ No sessions to test sorting (empty database)")
            return True
        
        # Extract and validate created_at dates
        dates = []
        print("\n📅 Session dates (first 10):")
        
        for i, session in enumerate(sessions[:10]):  # Show first 10 for readability
            created_at = session.get('created_at')
            org_name = session.get('org_name', 'Unknown')
            
            if not created_at:
                print(f"❌ Session {i+1} missing created_at field")
                return False
            
            try:
                # Parse the datetime
                if isinstance(created_at, str):
                    dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                else:
                    dt = created_at
                
                dates.append(dt)
                print(f"   {i+1:2d}. {org_name[:20]:20s} - {created_at}")
                
            except Exception as e:
                print(f"❌ Invalid date format in session {i+1}: {created_at} - {e}")
                return False
        
        # Check if dates are in descending order (newest first)
        print(f"\n🔍 Checking sort order for all {len(sessions)} sessions...")
        
        all_dates = []
        for session in sessions:
            created_at = session.get('created_at')
            if created_at:
                try:
                    if isinstance(created_at, str):
                        dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    else:
                        dt = created_at
                    all_dates.append(dt)
                except:
                    continue
        
        # Verify descending order
        is_sorted_desc = True
        first_violation = None
        
        for i in range(len(all_dates) - 1):
            if all_dates[i] < all_dates[i + 1]:
                is_sorted_desc = False
                first_violation = i
                break
        
        if is_sorted_desc:
            print("✅ All sessions are properly sorted by created_at in descending order")
            print(f"   Newest: {all_dates[0].isoformat()}")
            print(f"   Oldest: {all_dates[-1].isoformat()}")
            
            # Additional validation: check date range
            date_range = all_dates[0] - all_dates[-1]
            print(f"   Date range: {date_range.days} days")
            
            return True
        else:
            print(f"❌ Sessions are NOT properly sorted!")
            print(f"   Violation at position {first_violation + 1}:")
            print(f"   Session {first_violation + 1}: {all_dates[first_violation].isoformat()}")
            print(f"   Session {first_violation + 2}: {all_dates[first_violation + 1].isoformat()}")
            print(f"   Expected: {all_dates[first_violation].isoformat()} >= {all_dates[first_violation + 1].isoformat()}")
            
            return False
            
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

def test_data_structure_compatibility():
    """Test that all sessions have the required fields for frontend compatibility"""
    
    base_url = "https://0c6c660a-787f-48ab-8364-a6e87a12d36b.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("\n🔍 Testing frontend data structure compatibility")
    print("=" * 60)
    
    try:
        response = requests.get(f"{api_url}/audit/sessions", timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Failed to get sessions: {response.status_code}")
            return False
        
        sessions = response.json()
        
        if len(sessions) == 0:
            print("ℹ️ No sessions to test structure")
            return True
        
        # Required fields for frontend
        required_fields = ['id', 'org_name', 'findings_count', 'estimated_savings', 'created_at']
        
        print(f"📊 Validating structure for {len(sessions)} sessions...")
        
        for i, session in enumerate(sessions):
            # Check required fields
            missing_fields = []
            for field in required_fields:
                if field not in session:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"❌ Session {i+1} missing fields: {missing_fields}")
                return False
            
            # Validate estimated_savings structure
            savings = session.get('estimated_savings', {})
            if not isinstance(savings, dict):
                print(f"❌ Session {i+1} estimated_savings is not a dict: {type(savings)}")
                return False
            
            if 'annual_dollars' not in savings:
                print(f"❌ Session {i+1} missing estimated_savings.annual_dollars")
                print(f"   Available keys: {list(savings.keys())}")
                return False
        
        print("✅ All sessions have required fields for frontend compatibility")
        
        # Show sample structure
        sample = sessions[0]
        print(f"\n📋 Sample session structure:")
        print(f"   id: {sample['id']}")
        print(f"   org_name: {sample['org_name']}")
        print(f"   findings_count: {sample['findings_count']}")
        print(f"   estimated_savings.annual_dollars: {sample['estimated_savings']['annual_dollars']}")
        print(f"   created_at: {sample['created_at']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during structure testing: {e}")
        return False

def main():
    """Run all sorting and compatibility tests"""
    
    print("🚀 GET /api/audit/sessions Sorting Fix Verification")
    print("Testing the fix for sessions sorted by created_at descending")
    print("=" * 80)
    
    # Test 1: Sorting functionality
    sorting_passed = test_sessions_sorting()
    
    # Test 2: Data structure compatibility
    structure_passed = test_data_structure_compatibility()
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SORTING FIX VERIFICATION RESULTS:")
    print(f"   ✅ Sorting Test: {'PASSED' if sorting_passed else 'FAILED'}")
    print(f"   ✅ Structure Test: {'PASSED' if structure_passed else 'FAILED'}")
    
    if sorting_passed and structure_passed:
        print("\n🎉 SUCCESS: GET /api/audit/sessions sorting fix is working correctly!")
        print("   • Sessions are sorted by created_at in descending order (newest first)")
        print("   • All sessions have correct data structure for frontend compatibility")
        print("   • Endpoint returns 200 status and proper array format")
        return 0
    else:
        print("\n❌ FAILURE: Issues found with the sorting implementation")
        return 1

if __name__ == "__main__":
    sys.exit(main())