#!/bin/bash

echo "🔍 Test simple de intercambio"
echo "=============================="
echo ""

# Verificar si hay productos del usuario logueado
echo "📋 1. Verificando productos del usuario..."
curl -s -X GET "http://localhost:8081/product" \
  -H "Authorization: Bearer $(localStorage.getItem('token') || echo 'YOUR_TOKEN_HERE')" \
  -H "Content-Type: application/json" > /tmp/all_products.json

if [ -s /tmp/all_products.json ]; then
    echo "✅ Productos encontrados:"
    cat /tmp/all_products.json | jq -r '.[] | "  ID: \(.productId) - \(.productName) - Intercambio: \(.availableForExchange) - Tuyo: \(.belongsToCurrentUser)"'
else
    echo "❌ No se pudieron obtener productos. Verifica el token de autenticación."
fi

echo ""
echo "🔄 2. Verificando productos disponibles para intercambio..."
curl -s -X GET "http://localhost:8081/api/exchanges/my-products" \
  -H "Authorization: Bearer $(localStorage.getItem('token') || echo 'YOUR_TOKEN_HERE')" \
  -H "Content-Type: application/json" > /tmp/my_exchange_products.json

if [ -s /tmp/my_exchange_products.json ]; then
    count=$(cat /tmp/my_exchange_products.json | jq length)
    echo "✅ Tienes $count productos disponibles para intercambio:"
    cat /tmp/my_exchange_products.json | jq -r '.[] | "  ID: \(.productId) - \(.productName)"'
else
    echo "❌ No tienes productos disponibles para intercambio"
fi

echo ""
echo "💡 SOLUCIÓN:"
echo "============"
echo "1. Ve a la página de productos"
echo "2. Busca TUS productos (donde dice tu nombre como propietario)"
echo "3. En la parte inferior de cada producto tuyo, haz clic en 'Activar intercambio'"
echo "4. El botón debe volverse verde y decir 'Desactivar intercambio'"
echo "5. Debe aparecer un badge verde que dice '🔄 Disponible para intercambio'"
echo "6. Luego podrás intercambiar productos de otros usuarios"

echo ""
echo "🔧 DEBUGGING:"
echo "============="
echo "- Abre la consola del navegador (F12)"
echo "- Busca logs que empiecen con 'Product debug:'"
echo "- Para TUS productos debe decir 'belongsToCurrentUser: true'"
echo "- Después de activar intercambio debe decir 'availableForExchange: true'"

# Limpiar archivos temporales
rm -f /tmp/all_products.json /tmp/my_exchange_products.json
