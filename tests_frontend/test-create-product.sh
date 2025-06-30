#!/bin/bash

# Test script para crear un producto
echo "Testing product creation..."

# Datos de prueba del producto
PRODUCT_DATA='{
  "productName": "Test Product",
  "description": "This is a test product description",
  "imageUrl": "https://example.com/image.jpg",
  "category": "ELECTRONICS",
  "condition": "NEW",
  "availableForExchange": true,
  "exchangePreferences": "Looking for books or electronics",
  "estimatedValue": 50.0
}'

# Token de prueba (necesitas reemplazar con un token válido)
TOKEN="your-jwt-token-here"

echo "Sending POST request to create product..."
echo "Data: $PRODUCT_DATA"

curl -X POST http://localhost:8081/product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$PRODUCT_DATA" \
  -v

echo -e "\n\nTest completed."
