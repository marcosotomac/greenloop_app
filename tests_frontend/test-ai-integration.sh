#!/bin/bash

echo "🔍 Testing GreenLoop AI Chat Integration"
echo "========================================="

# Test 1: Backend Health Check
echo "1. Testing backend health..."
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/api/ai/chat -X POST -H "Content-Type: application/json" -d '{"message": "test"}')

if [ "$backend_status" = "200" ]; then
    echo "✅ Backend AI endpoint is working (HTTP $backend_status)"
else
    echo "❌ Backend AI endpoint failed (HTTP $backend_status)"
fi

# Test 2: Primary AI Chat Endpoint
echo "2. Testing primary AI chat endpoint..."
primary_response=$(curl -s -X POST http://localhost:8081/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Qué es la economía circular?"}')

if echo "$primary_response" | grep -q "response"; then
    echo "✅ Primary AI chat endpoint working"
    echo "   Response: $(echo "$primary_response" | jq -r '.response' 2>/dev/null || echo "$primary_response")"
else
    echo "❌ Primary AI chat endpoint failed"
fi

# Test 3: GitHub Models Fallback Endpoint
echo "3. Testing GitHub Models fallback endpoint..."
fallback_response=$(curl -s -X POST http://localhost:8081/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "¿Cómo funciona el sistema de intercambios?", "model": "gpt-4o"}')

if echo "$fallback_response" | grep -q "response"; then
    echo "✅ GitHub Models fallback endpoint working"
    echo "   Response: $(echo "$fallback_response" | jq -r '.response' 2>/dev/null || echo "$fallback_response")"
else
    echo "❌ GitHub Models fallback endpoint failed"
fi

# Test 4: Frontend Availability
echo "4. Testing frontend availability..."
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/greenloop-ai)

if [ "$frontend_status" = "200" ]; then
    echo "✅ Frontend AI page is accessible (HTTP $frontend_status)"
else
    echo "❌ Frontend AI page not accessible (HTTP $frontend_status)"
fi

echo ""
echo "🎉 Integration test completed!"
echo "📱 Access the AI Chat at: http://localhost:5173/greenloop-ai"
echo "🖥️  Backend running at: http://localhost:8081"
