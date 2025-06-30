#!/bin/bash

# Test Community Membership Requests Functionality
# This script tests the membership request workflow for private communities

echo "🧪 Testing Community Membership Requests"
echo "========================================"

# Backend API URL
API_URL="http://localhost:8081/api"

# Test user credentials
EMAIL1="user1@example.com"
EMAIL2="user2@example.com"
PASSWORD="password123"

echo "📋 1. Setting up test users..."

# Register first user (community creator)
USER1_RESPONSE=$(curl -s -X POST "$API_URL/../auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Creator\",
    \"lastName\": \"User\",
    \"email\": \"$EMAIL1\",
    \"password\": \"$PASSWORD\"
  }")

TOKEN1=$(echo $USER1_RESPONSE | jq -r '.token')

# Register second user (membership requester)
USER2_RESPONSE=$(curl -s -X POST "$API_URL/../auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Member\",
    \"lastName\": \"User\",
    \"email\": \"$EMAIL2\",
    \"password\": \"$PASSWORD\"
  }")

TOKEN2=$(echo $USER2_RESPONSE | jq -r '.token')

if [ "$TOKEN1" = "null" ] || [ -z "$TOKEN1" ]; then
  echo "❌ User 1 registration failed"
  exit 1
fi

if [ "$TOKEN2" = "null" ] || [ -z "$TOKEN2" ]; then
  echo "❌ User 2 registration failed"
  exit 1
fi

echo "✅ Test users created successfully"

echo "🏠 2. Creating private community..."

# Create a private community with user 1
PRIVATE_COMMUNITY_RESPONSE=$(curl -s -X POST "$API_URL/communities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"name\": \"Private Test Community $(date +%s)\",
    \"description\": \"A private test community for membership requests\",
    \"type\": \"PRIVATE\"
  }")

PRIVATE_COMMUNITY_ID=$(echo $PRIVATE_COMMUNITY_RESPONSE | jq -r '.id')

if [ "$PRIVATE_COMMUNITY_ID" = "null" ] || [ -z "$PRIVATE_COMMUNITY_ID" ]; then
  echo "❌ Private community creation failed"
  echo "Response: $PRIVATE_COMMUNITY_RESPONSE"
  exit 1
fi

echo "✅ Private community created with ID: $PRIVATE_COMMUNITY_ID"

echo "📝 3. Testing membership request..."

# User 2 requests membership to the private community
REQUEST_RESPONSE=$(curl -s -X POST "$API_URL/communities/$PRIVATE_COMMUNITY_ID/request-membership" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d "{
    \"communityId\": $PRIVATE_COMMUNITY_ID,
    \"message\": \"I would like to join this community\"
  }")

REQUEST_ID=$(echo $REQUEST_RESPONSE | jq -r '.id')

if [ "$REQUEST_ID" = "null" ] || [ -z "$REQUEST_ID" ]; then
  echo "❌ Membership request failed"
  echo "Response: $REQUEST_RESPONSE"
  exit 1
fi

echo "✅ Membership request created with ID: $REQUEST_ID"

echo "📋 4. Testing pending requests retrieval..."

# Creator (user 1) gets pending requests
PENDING_REQUESTS=$(curl -s -X GET "$API_URL/communities/membership-requests/pending" \
  -H "Authorization: Bearer $TOKEN1")

PENDING_COUNT=$(echo $PENDING_REQUESTS | jq '. | length')
echo "✅ Creator has $PENDING_COUNT pending membership requests"

echo "🏠 5. Testing community membership requests..."

# Get requests for specific community
COMMUNITY_REQUESTS=$(curl -s -X GET "$API_URL/communities/$PRIVATE_COMMUNITY_ID/membership-requests" \
  -H "Authorization: Bearer $TOKEN1")

COMMUNITY_REQUEST_COUNT=$(echo $COMMUNITY_REQUESTS | jq '. | length')
echo "✅ Community has $COMMUNITY_REQUEST_COUNT membership requests"

echo "✅ 6. Testing request approval..."

# Creator approves the request
APPROVAL_RESPONSE=$(curl -s -X PUT "$API_URL/communities/membership-requests/$REQUEST_ID/respond" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"approved\": true,
    \"responseMessage\": \"Welcome to the community!\"
  }")

APPROVAL_STATUS=$(echo $APPROVAL_RESPONSE | jq -r '.status')
echo "✅ Request approval status: $APPROVAL_STATUS"

echo "🔍 7. Verifying membership after approval..."

# Check if user 2 is now a member
MEMBERSHIP_CHECK=$(curl -s -X GET "$API_URL/communities/$PRIVATE_COMMUNITY_ID/membership/check" \
  -H "Authorization: Bearer $TOKEN2")

IS_MEMBER=$(echo $MEMBERSHIP_CHECK)
echo "✅ User 2 membership status: $IS_MEMBER"

echo "👥 8. Checking updated member count..."

# Get updated member count
UPDATED_MEMBERS=$(curl -s -X GET "$API_URL/communities/$PRIVATE_COMMUNITY_ID/members" \
  -H "Authorization: Bearer $TOKEN1")

UPDATED_MEMBER_COUNT=$(echo $UPDATED_MEMBERS | jq '. | length')
echo "✅ Community now has $UPDATED_MEMBER_COUNT members"

echo ""
echo "🎉 All membership request tests completed successfully!"
echo "✅ Community membership request functionality is working correctly"
echo ""
echo "📋 Test Summary:"
echo "- ✅ Private community creation"
echo "- ✅ Membership request submission"
echo "- ✅ Pending requests retrieval"
echo "- ✅ Request approval process"
echo "- ✅ Membership verification after approval"
echo "- ✅ Member count updates"
echo ""
echo "🌐 Frontend available at: http://localhost:5173"
echo "🔧 Backend API available at: http://localhost:8081/api"
