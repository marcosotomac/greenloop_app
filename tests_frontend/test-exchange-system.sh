#!/bin/bash

echo "🔄 Probando Sistema de Intercambios - GreenLoop"
echo "=============================================="

BASE_URL="http://localhost:8080/api"
AUTH_TOKEN="your_jwt_token_here"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -d "$data" \
            "$BASE_URL$endpoint"
    else
        curl -s -X $method \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            "$BASE_URL$endpoint"
    fi
}

echo -e "${YELLOW}1. Obteniendo productos disponibles para intercambio...${NC}"
response=$(make_request "GET" "/exchanges/available-products")
echo "Response: $response"
echo ""

echo -e "${YELLOW}2. Obteniendo mis productos para intercambio...${NC}"
response=$(make_request "GET" "/exchanges/my-products")
echo "Response: $response"
echo ""

echo -e "${YELLOW}3. Creando solicitud de intercambio...${NC}"
exchange_data='{
    "requestedProductId": 1,
    "offeredProductId": 2
}'
response=$(make_request "POST" "/exchanges" "$exchange_data")
echo "Response: $response"
echo ""

echo -e "${YELLOW}4. Obteniendo mis solicitudes de intercambio...${NC}"
response=$(make_request "GET" "/exchanges/requested")
echo "Response: $response"
echo ""

echo -e "${YELLOW}5. Obteniendo solicitudes recibidas...${NC}"
response=$(make_request "GET" "/exchanges/provided")
echo "Response: $response"
echo ""

echo -e "${YELLOW}6. Obteniendo estadísticas de intercambios...${NC}"
response=$(make_request "GET" "/exchanges/statistics")
echo "Response: $response"
echo ""

echo -e "${YELLOW}7. Probando búsqueda con filtros...${NC}"
response=$(make_request "GET" "/exchanges/available-products?category=ELECTRONICS&search=laptop")
echo "Response: $response"
echo ""

echo -e "${GREEN}✅ Pruebas del sistema de intercambios completadas${NC}"
echo ""
echo -e "${YELLOW}Nota: Asegúrate de:${NC}"
echo "- Tener el servidor Spring Boot ejecutándose en puerto 8080"
echo "- Reemplazar 'your_jwt_token_here' con un token JWT válido"
echo "- Tener productos creados en la base de datos con IDs 1 y 2"
echo "- Que los productos estén marcados como availableForExchange=true"
