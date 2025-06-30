#!/bin/bash

echo "=== CREANDO USUARIO DE PRUEBA ==="

# Datos del usuario de prueba
USER_DATA='{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123"
}'

echo "Creando usuario: $USER_DATA"

# Crear usuario
SIGNUP_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST http://localhost:8081/auth/signup \
  -H "Content-Type: application/json" \
  -d "$USER_DATA")

echo "Respuesta del signup:"
echo "$SIGNUP_RESPONSE"

# Extraer status code
HTTP_STATUS=$(echo "$SIGNUP_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$SIGNUP_RESPONSE" | sed '/HTTP_STATUS/d')

echo ""
echo "Status Code: $HTTP_STATUS"
echo "Response Body: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ Usuario creado exitosamente!"
    # Extraer token del signup
    TOKEN=$(echo $RESPONSE_BODY | jq -r '.token' 2>/dev/null)
    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo "Token obtenido del signup: ${TOKEN:0:20}..."
        
        echo ""
        echo "=== PROBANDO CREACIÓN DE PRODUCTO ==="
        
        # Producto de prueba
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

        echo "Respuesta del producto:"
        echo "$PRODUCT_RESPONSE"

        # Extraer status code del producto
        PRODUCT_HTTP_STATUS=$(echo "$PRODUCT_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
        PRODUCT_RESPONSE_BODY=$(echo "$PRODUCT_RESPONSE" | sed '/HTTP_STATUS/d')

        echo ""
        echo "Product Status Code: $PRODUCT_HTTP_STATUS"
        echo "Product Response Body: $PRODUCT_RESPONSE_BODY"

        if [ "$PRODUCT_HTTP_STATUS" = "200" ] || [ "$PRODUCT_HTTP_STATUS" = "201" ]; then
            echo "✅ Producto creado exitosamente!"
        else
            echo "❌ ERROR $PRODUCT_HTTP_STATUS al crear producto"
            echo "Detalles del error: $PRODUCT_RESPONSE_BODY"
        fi
    fi
else
    echo "❌ ERROR $HTTP_STATUS al crear usuario"
    echo "Intentando con usuario existente..."
    
    # Si el usuario ya existe, intentar login
    echo ""
    echo "=== INTENTANDO LOGIN CON USUARIO EXISTENTE ==="
    
    LOGIN_DATA='{
      "email": "test@example.com",
      "password": "password123"
    }'
    
    LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
      -X POST http://localhost:8081/auth/signin \
      -H "Content-Type: application/json" \
      -d "$LOGIN_DATA")

    echo "Respuesta del login:"
    echo "$LOGIN_RESPONSE"
    
    LOGIN_HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
    LOGIN_RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS/d')
    
    if [ "$LOGIN_HTTP_STATUS" = "200" ]; then
        TOKEN=$(echo $LOGIN_RESPONSE_BODY | jq -r '.token' 2>/dev/null)
        if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
            echo "✅ Login exitoso, probando creación de producto..."
            
            # Producto de prueba
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

            # Crear producto
            PRODUCT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
              -X POST http://localhost:8081/product \
              -H "Content-Type: application/json" \
              -H "Authorization: Bearer $TOKEN" \
              -d "$PRODUCT_DATA")

            echo "Respuesta del producto:"
            echo "$PRODUCT_RESPONSE"

            PRODUCT_HTTP_STATUS=$(echo "$PRODUCT_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
            PRODUCT_RESPONSE_BODY=$(echo "$PRODUCT_RESPONSE" | sed '/HTTP_STATUS/d')

            echo ""
            echo "Product Status Code: $PRODUCT_HTTP_STATUS"
            echo "Product Response Body: $PRODUCT_RESPONSE_BODY"

            if [ "$PRODUCT_HTTP_STATUS" = "200" ] || [ "$PRODUCT_HTTP_STATUS" = "201" ]; then
                echo "✅ Producto creado exitosamente!"
            else
                echo "❌ ERROR $PRODUCT_HTTP_STATUS al crear producto"
                echo "Detalles del error: $PRODUCT_RESPONSE_BODY"
            fi
        fi
    fi
fi
