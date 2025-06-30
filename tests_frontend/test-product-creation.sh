#!/bin/bash

echo "=== TESTING PRODUCT CREATION ==="

# Datos de usuario para login (ajusta según tus datos de prueba)
USERNAME="user@example.com"
PASSWORD="password123"

echo "1. Intentando hacer login..."

# Login para obtener token
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8081/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

echo "Login response: $TOKEN_RESPONSE"

# Extraer token (asumiendo que la respuesta es JSON con un campo 'token')
TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ ERROR: No se pudo obtener el token de autenticación"
    echo "Respuesta del servidor: $TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."

echo ""
echo "2. Intentando crear producto..."

# Producto de prueba (con las categorías corregidas)
PRODUCT_DATA='{
  "productName": "Test Product",
  "description": "This is a test product description with more than 10 characters",
  "imageUrl": "https://via.placeholder.com/300x200.jpg",
  "category": "ELECTRONICS",
  "condition": "NEW",
  "availableForExchange": true,
  "exchangePreferences": "Looking for books or other electronics in good condition",
  "estimatedValue": 50.0
}'

echo "Enviando producto: $PRODUCT_DATA"
echo ""

# Crear producto
PRODUCT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST http://localhost:8081/product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$PRODUCT_DATA")

echo "Respuesta completa del servidor:"
echo "$PRODUCT_RESPONSE"

# Extraer status code
HTTP_STATUS=$(echo "$PRODUCT_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$PRODUCT_RESPONSE" | sed '/HTTP_STATUS/d')

echo ""
echo "Status Code: $HTTP_STATUS"
echo "Response Body: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ Producto creado exitosamente!"
else
    echo "❌ ERROR $HTTP_STATUS al crear producto"
    echo "Detalles del error: $RESPONSE_BODY"
fi
