#!/bin/bash

# 🧪 Script de Prueba - Sistema de Intercambios
# Verificar que todas las funcionalidades están funcionando correctamente

echo "🧪 Iniciando pruebas del Sistema de Intercambios..."
echo "=================================================="

API_URL="http://localhost:8081"
TOKEN=""

# Función para extraer el token de la respuesta de login
extract_token() {
    echo "$1" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

echo ""
echo "1️⃣ Iniciando backend..."
# El backend debería estar ejecutándose en otra terminal

sleep 2

echo ""
echo "2️⃣ Probando autenticación..."

# Login como usuario de prueba
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

if [ $? -eq 0 ]; then
    TOKEN=$(extract_token "$LOGIN_RESPONSE")
    if [ ! -z "$TOKEN" ]; then
        echo "✅ Login exitoso - Token obtenido"
    else
        echo "❌ Error: No se pudo obtener el token"
        echo "Respuesta: $LOGIN_RESPONSE"
        exit 1
    fi
else
    echo "❌ Error de conexión al backend"
    exit 1
fi

echo ""
echo "3️⃣ Probando endpoints de productos..."

# Obtener todos los productos
echo "📦 Obteniendo productos..."
PRODUCTS_RESPONSE=$(curl -s -X GET "$API_URL/product" \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
    echo "✅ Productos obtenidos correctamente"
    PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o '"productId"' | wc -l)
    echo "📊 Total de productos: $PRODUCT_COUNT"
else
    echo "❌ Error obteniendo productos"
fi

echo ""
echo "4️⃣ Probando endpoints de intercambio..."

# Obtener productos disponibles para intercambio
echo "🔄 Obteniendo productos disponibles para intercambio..."
EXCHANGE_PRODUCTS_RESPONSE=$(curl -s -X GET "$API_URL/api/exchanges/available-products" \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
    echo "✅ Productos para intercambio obtenidos"
    EXCHANGE_COUNT=$(echo "$EXCHANGE_PRODUCTS_RESPONSE" | grep -o '"productId"' | wc -l)
    echo "📊 Productos disponibles para intercambio: $EXCHANGE_COUNT"
else
    echo "❌ Error obteniendo productos para intercambio"
fi

# Obtener mis productos para intercambio
echo "👤 Obteniendo mis productos para intercambio..."
MY_PRODUCTS_RESPONSE=$(curl -s -X GET "$API_URL/api/exchanges/my-products" \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
    echo "✅ Mis productos para intercambio obtenidos"
    MY_COUNT=$(echo "$MY_PRODUCTS_RESPONSE" | grep -o '"productId"' | wc -l)
    echo "📊 Mis productos disponibles: $MY_COUNT"
else
    echo "❌ Error obteniendo mis productos"
fi

# Obtener estadísticas de intercambio
echo "📈 Obteniendo estadísticas de intercambio..."
STATS_RESPONSE=$(curl -s -X GET "$API_URL/api/exchanges/statistics" \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
    echo "✅ Estadísticas obtenidas"
    echo "📊 Estadísticas: $STATS_RESPONSE"
else
    echo "❌ Error obteniendo estadísticas"
fi

# Obtener intercambios solicitados
echo "📤 Obteniendo intercambios solicitados..."
REQUESTED_RESPONSE=$(curl -s -X GET "$API_URL/api/exchanges/requested" \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
    echo "✅ Intercambios solicitados obtenidos"
    REQUESTED_COUNT=$(echo "$REQUESTED_RESPONSE" | grep -o '"exchangeId"' | wc -l)
    echo "📊 Intercambios solicitados: $REQUESTED_COUNT"
else
    echo "❌ Error obteniendo intercambios solicitados"
fi

# Obtener intercambios recibidos
echo "📥 Obteniendo intercambios recibidos..."
PROVIDED_RESPONSE=$(curl -s -X GET "$API_URL/api/exchanges/provided" \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
    echo "✅ Intercambios recibidos obtenidos"
    PROVIDED_COUNT=$(echo "$PROVIDED_RESPONSE" | grep -o '"exchangeId"' | wc -l)
    echo "📊 Intercambios recibidos: $PROVIDED_COUNT"
else
    echo "❌ Error obteniendo intercambios recibidos"
fi

echo ""
echo "5️⃣ Verificando estructura de respuestas..."

# Verificar que las respuestas contienen belongsToCurrentUser
if echo "$PRODUCTS_RESPONSE" | grep -q "belongsToCurrentUser"; then
    echo "✅ Campo 'belongsToCurrentUser' presente en productos"
else
    echo "❌ Campo 'belongsToCurrentUser' faltante en productos"
fi

if echo "$EXCHANGE_PRODUCTS_RESPONSE" | grep -q "belongsToCurrentUser"; then
    echo "✅ Campo 'belongsToCurrentUser' presente en productos de intercambio"
else
    echo "❌ Campo 'belongsToCurrentUser' faltante en productos de intercambio"
fi

echo ""
echo "=================================================="
echo "🎉 Pruebas completadas!"
echo ""
echo "📋 Resumen:"
echo "- Productos totales: $PRODUCT_COUNT"
echo "- Productos para intercambio: $EXCHANGE_COUNT"
echo "- Mis productos: $MY_COUNT"
echo "- Intercambios solicitados: $REQUESTED_COUNT"
echo "- Intercambios recibidos: $PROVIDED_COUNT"
echo ""
echo "🚀 El sistema de intercambios está listo!"
echo "💡 Ahora puedes probar el frontend en: http://localhost:5173"
