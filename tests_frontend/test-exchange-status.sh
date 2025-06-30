#!/bin/bash

# Script para verificar el estado de intercambio de productos

echo "🔍 Verificando estado de intercambio de productos..."

# Test 1: Obtener productos del usuario actual
echo "📋 Test 1: Obteniendo todos los productos..."
curl -s -X GET "http://localhost:8081/product" \
  -H "Authorization: Bearer $(cat ~/.greenloop_token 2>/dev/null || echo 'TOKEN_HERE')" \
  -H "Content-Type: application/json" | jq -r '.[] | "\(.productId): \(.productName) - Intercambio: \(.availableForExchange) - Propietario: \(.belongsToCurrentUser)"'

echo ""

# Test 2: Obtener productos disponibles para intercambio del usuario
echo "🔄 Test 2: Obteniendo MIS productos disponibles para intercambio..."
curl -s -X GET "http://localhost:8081/api/exchanges/my-products" \
  -H "Authorization: Bearer $(cat ~/.greenloop_token 2>/dev/null || echo 'TOKEN_HERE')" \
  -H "Content-Type: application/json" | jq -r '.[] | "\(.productId): \(.productName) - Intercambio: \(.availableForExchange)"'

echo ""

# Test 3: Verificar productos disponibles para intercambio en general
echo "🌍 Test 3: Obteniendo TODOS los productos disponibles para intercambio..."
curl -s -X GET "http://localhost:8081/api/exchanges/available" \
  -H "Authorization: Bearer $(cat ~/.greenloop_token 2>/dev/null || echo 'TOKEN_HERE')" \
  -H "Content-Type: application/json" | jq -r '.[] | "\(.productId): \(.productName) - Propietario: \(.ownerName)"'

echo ""
echo "✅ Verificación completada"
echo ""
echo "💡 Instrucciones:"
echo "1. Reemplaza 'TOKEN_HERE' con tu token de autenticación real"
echo "2. Si no ves productos en 'Test 2', activa el intercambio desde la interfaz"
echo "3. Los logs de debug en la consola del navegador te mostrarán el estado real"
