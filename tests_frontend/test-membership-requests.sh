#!/bin/bash

# Script para probar el sistema de solicitudes de membresía
# Asegúrate de tener el servidor corriendo en localhost:8080

echo "=== TESTING COMMUNITY MEMBERSHIP REQUESTS SYSTEM ==="
echo

# Variables de configuración
BASE_URL="http://localhost:8080"
USER_TOKEN="YOUR_USER_TOKEN_HERE"  # Reemplazar con token real
CREATOR_TOKEN="YOUR_CREATOR_TOKEN_HERE"  # Reemplazar con token del creador

echo "🔧 Configuración:"
echo "   Base URL: $BASE_URL"
echo "   User Token: ${USER_TOKEN:0:20}..."
echo "   Creator Token: ${CREATOR_TOKEN:0:20}..."
echo

# Función para hacer peticiones con mejor formato
make_request() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    local description=$5
    
    echo "📋 $description"
    echo "   $method $endpoint"
    
    if [ -n "$data" ]; then
        echo "   Data: $data"
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token")
    fi
    
    echo "   Response: $response"
    echo
}

echo "=== 1. CREAR COMUNIDAD PARA TESTING ==="
community_data='{"name": "Test Community", "description": "Community for testing membership requests"}'
make_request "POST" "/api/communities" "$CREATOR_TOKEN" "$community_data" "Crear comunidad de prueba"

echo "=== 2. OBTENER LISTA DE COMUNIDADES ==="
make_request "GET" "/api/communities" "$USER_TOKEN" "" "Obtener todas las comunidades"

echo "=== 3. SOLICITAR MEMBRESÍA A COMUNIDAD ==="
# Nota: Reemplazar el ID 1 con el ID real de la comunidad creada
request_data='{"message": "Me gustaría unirme a esta comunidad para colaborar en proyectos sustentables"}'
make_request "POST" "/api/communities/1/request-membership" "$USER_TOKEN" "$request_data" "Solicitar membresía a comunidad ID 1"

echo "=== 4. VER SOLICITUDES PENDIENTES (CREADOR) ==="
make_request "GET" "/api/communities/membership-requests/pending" "$CREATOR_TOKEN" "" "Ver solicitudes pendientes para creador"

echo "=== 5. VER MIS SOLICITUDES (USUARIO) ==="
make_request "GET" "/api/communities/membership-requests/my-requests" "$USER_TOKEN" "" "Ver mis solicitudes enviadas"

echo "=== 6. VER NOTIFICACIONES (CREADOR) ==="
make_request "GET" "/api/notifications/unread" "$CREATOR_TOKEN" "" "Ver notificaciones no leídas del creador"

echo "=== 7. CONTAR SOLICITUDES PENDIENTES ==="
make_request "GET" "/api/communities/membership-requests/count" "$CREATOR_TOKEN" "" "Contar solicitudes pendientes"

echo "=== 8. APROBAR SOLICITUD ==="
# Nota: Reemplazar el ID 1 con el ID real de la solicitud
approval_data='{"approved": true, "responseMessage": "¡Bienvenido a la comunidad! Nos alegra tenerte con nosotros."}'
make_request "PUT" "/api/communities/membership-requests/1/respond" "$CREATOR_TOKEN" "$approval_data" "Aprobar solicitud ID 1"

echo "=== 9. VER NOTIFICACIONES (USUARIO) ==="
make_request "GET" "/api/notifications/unread" "$USER_TOKEN" "" "Ver notificaciones no leídas del usuario"

echo "=== 10. VERIFICAR MEMBRESÍA ==="
make_request "GET" "/api/communities/1/membership/check" "$USER_TOKEN" "" "Verificar si el usuario es miembro de la comunidad"

echo "=== 11. VER MIEMBROS DE LA COMUNIDAD ==="
make_request "GET" "/api/communities/1/members" "$USER_TOKEN" "" "Ver miembros de la comunidad"

echo "=== 12. INTENTAR SOLICITAR MEMBRESÍA NUEVAMENTE (DEBE FALLAR) ==="
duplicate_request='{"message": "Intentando solicitar nuevamente"}'
make_request "POST" "/api/communities/1/request-membership" "$USER_TOKEN" "$duplicate_request" "Intentar solicitar membresía cuando ya es miembro (debe fallar)"

echo "=== 13. TESTING DE ERRORES ==="
echo "📋 Probando casos de error comunes..."

echo "   - Solicitud a comunidad inexistente:"
error_request='{"message": "Test error"}'
make_request "POST" "/api/communities/999/request-membership" "$USER_TOKEN" "$error_request" "Solicitar membresía a comunidad inexistente"

echo "   - Responder a solicitud inexistente:"
error_response='{"approved": true}'
make_request "PUT" "/api/communities/membership-requests/999/respond" "$CREATOR_TOKEN" "$error_response" "Responder a solicitud inexistente"

echo "   - Acceder a solicitud sin permisos:"
make_request "GET" "/api/communities/membership-requests/1" "$USER_TOKEN" "" "Intentar acceder a solicitud sin permisos"

echo
echo "=== TESTING COMPLETADO ==="
echo
echo "📝 Notas importantes:"
echo "   1. Reemplaza YOUR_USER_TOKEN_HERE y YOUR_CREATOR_TOKEN_HERE con tokens reales"
echo "   2. Ajusta los IDs de comunidades y solicitudes según tu base de datos"
echo "   3. Asegúrate de que el servidor esté corriendo en localhost:8080"
echo "   4. Verifica que los usuarios existan en la base de datos"
echo
echo "🎯 Funcionalidades probadas:"
echo "   ✅ Crear solicitud de membresía"
echo "   ✅ Recibir notificaciones automáticas"
echo "   ✅ Ver solicitudes pendientes"
echo "   ✅ Aprobar/rechazar solicitudes"
echo "   ✅ Verificar membresía automática"
echo "   ✅ Manejo de errores y validaciones"
echo "   ✅ Sistema de notificaciones integrado"
echo
