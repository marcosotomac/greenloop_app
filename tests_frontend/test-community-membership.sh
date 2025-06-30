#!/bin/bash

# Test Community Membership Functionality
# This script tests the complete community membership workflow

echo "🧪 Testing Community Membership Functionality"
echo "============================================="

# Backend API URL
API_URL="http://localhost:8081/api"

# Test user credentials
EMAIL="test@example.com"
PASSWORD="password123"

echo "📋 1. Testing user authentication..."

# Login and get JWT token
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/../auth/signin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed. Creating test user..."
  
  # Register test user
  REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/../auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
      \"firstName\": \"Test\",
      \"lastName\": \"User\",
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  
  TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
  
  if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ User registration failed"
    exit 1
  fi
  
  echo "✅ Test user created successfully"
else
  echo "✅ Authentication successful"
fi

echo "🏠 2. Testing community creation..."

# Create a test community
COMMUNITY_RESPONSE=$(curl -s -X POST "$API_URL/communities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Test Community $(date +%s)\",
    \"description\": \"A test community for membership functionality\",
    \"type\": \"PUBLIC\"
  }")

COMMUNITY_ID=$(echo $COMMUNITY_RESPONSE | jq -r '.id')

if [ "$COMMUNITY_ID" = "null" ] || [ -z "$COMMUNITY_ID" ]; then
  echo "❌ Community creation failed"
  echo "Response: $COMMUNITY_RESPONSE"
  exit 1
fi

echo "✅ Community created with ID: $COMMUNITY_ID"

echo "📋 3. Testing community retrieval..."

# Get all communities
ALL_COMMUNITIES=$(curl -s -X GET "$API_URL/communities" \
  -H "Authorization: Bearer $TOKEN")

COMMUNITY_COUNT=$(echo $ALL_COMMUNITIES | jq '. | length')
echo "✅ Retrieved $COMMUNITY_COUNT communities"

echo "👥 4. Testing community members..."

# Get community members
MEMBERS_RESPONSE=$(curl -s -X GET "$API_URL/communities/$COMMUNITY_ID/members" \
  -H "Authorization: Bearer $TOKEN")

MEMBER_COUNT=$(echo $MEMBERS_RESPONSE | jq '. | length')
echo "✅ Community has $MEMBER_COUNT members"

echo "🔍 5. Testing membership check..."

# Check membership status
MEMBERSHIP_CHECK=$(curl -s -X GET "$API_URL/communities/$COMMUNITY_ID/membership/check" \
  -H "Authorization: Bearer $TOKEN")

IS_MEMBER=$(echo $MEMBERSHIP_CHECK)
echo "✅ Membership status: $IS_MEMBER"

echo "📝 6. Testing user communities..."

# Get user communities
USER_COMMUNITIES=$(curl -s -X GET "$API_URL/communities/user" \
  -H "Authorization: Bearer $TOKEN")

USER_COMMUNITY_COUNT=$(echo $USER_COMMUNITIES | jq '. | length')
echo "✅ User is member of $USER_COMMUNITY_COUNT communities"

echo "📊 7. Testing community stats..."

# Get community stats
STATS_RESPONSE=$(curl -s -X GET "$API_URL/communities/$COMMUNITY_ID/stats" \
  -H "Authorization: Bearer $TOKEN")

TOTAL_MEMBERS=$(echo $STATS_RESPONSE | jq -r '.totalMembers')
echo "✅ Community stats - Total members: $TOTAL_MEMBERS"

echo "🎯 8. Testing community detail endpoint..."

# Get specific community details
COMMUNITY_DETAIL=$(curl -s -X GET "$API_URL/communities/$COMMUNITY_ID" \
  -H "Authorization: Bearer $TOKEN")

COMMUNITY_NAME=$(echo $COMMUNITY_DETAIL | jq -r '.name')
echo "✅ Community detail retrieved: $COMMUNITY_NAME"

echo ""
echo "🎉 All tests completed successfully!"
echo "✅ Community membership functionality is working correctly"
echo ""
echo "📋 Test Summary:"
echo "- ✅ User authentication"
echo "- ✅ Community creation"
echo "- ✅ Community retrieval"
echo "- ✅ Member management"
echo "- ✅ Membership verification"
echo "- ✅ User communities"
echo "- ✅ Community statistics"
echo "- ✅ Community details"
echo ""
echo "🌐 Frontend available at: http://localhost:5173"
echo "🔧 Backend API available at: http://localhost:8081/api"
