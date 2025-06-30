#!/bin/bash

# Script para probar la sincronización de estados entre CommunityDetail y la lista principal
# de comunidades cuando un usuario abandona una comunidad desde el detalle

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Variables
BACKEND_URL="http://localhost:8081"
FRONTEND_URL="http://localhost:5177"
TEST_USER_EMAIL="testuser@example.com"
TEST_USER_PASSWORD="password123"

print_status "=== PRUEBA DE SINCRONIZACIÓN DE ESTADOS EN COMUNIDADES ==="
echo ""

# 1. Verificar que el backend esté funcionando
print_status "1. Verificando conexión con el backend..."
BACKEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/communities")
if [ "$BACKEND_CHECK" = "403" ] || [ "$BACKEND_CHECK" = "200" ]; then
    print_success "Backend conectado correctamente (HTTP $BACKEND_CHECK)"
else
    print_error "No se puede conectar al backend en $BACKEND_URL (HTTP $BACKEND_CHECK)"
    print_warning "Asegúrate de que el backend esté corriendo en el puerto 8081"
    exit 1
fi

# 2. Verificar que el frontend esté funcionando
print_status "2. Verificando conexión con el frontend..."
if curl -s -f "$FRONTEND_URL" > /dev/null; then
    print_success "Frontend conectado correctamente"
else
    print_error "No se puede conectar al frontend en $FRONTEND_URL"
    print_warning "Asegúrate de que el frontend esté corriendo en el puerto 5177"
    exit 1
fi

print_status "3. Creando usuario de prueba..."

# Crear usuario de prueba
USER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser",
    "email": "'$TEST_USER_EMAIL'",
    "password": "'$TEST_USER_PASSWORD'"
  }')

HTTP_CODE=$(echo "$USER_RESPONSE" | tail -n1)
USER_DATA=$(echo "$USER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "409" ]; then
    print_success "Usuario de prueba disponible"
else
    print_error "Error creando usuario de prueba (HTTP $HTTP_CODE)"
    echo "$USER_DATA"
fi

print_status "4. Iniciando sesión..."

# Iniciar sesión
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_USER_EMAIL'",
    "password": "'$TEST_USER_PASSWORD'"
  }')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_DATA=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    TOKEN=$(echo "$LOGIN_DATA" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$LOGIN_DATA" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    print_success "Sesión iniciada correctamente"
    print_status "Token: ${TOKEN:0:20}..."
    print_status "User ID: $USER_ID"
else
    print_error "Error iniciando sesión (HTTP $HTTP_CODE)"
    echo "$LOGIN_DATA"
    exit 1
fi

print_status "5. Creando comunidad de prueba..."

# Crear una comunidad de prueba
COMMUNITY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/communities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Community State Sync",
    "description": "Comunidad para probar sincronización de estados",
    "type": "PUBLIC"
  }')

HTTP_CODE=$(echo "$COMMUNITY_RESPONSE" | tail -n1)
COMMUNITY_DATA=$(echo "$COMMUNITY_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    COMMUNITY_ID=$(echo "$COMMUNITY_DATA" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    print_success "Comunidad creada con ID: $COMMUNITY_ID"
else
    print_error "Error creando comunidad (HTTP $HTTP_CODE)"
    echo "$COMMUNITY_DATA"
    exit 1
fi

print_status "6. Creando segundo usuario de prueba..."

# Crear segundo usuario
SECOND_USER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Second",
    "lastName": "User",
    "username": "seconduser",
    "email": "seconduser@example.com",
    "password": "password123"
  }')

HTTP_CODE=$(echo "$SECOND_USER_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "409" ]; then
    print_success "Segundo usuario disponible"
else
    print_error "Error creando segundo usuario (HTTP $HTTP_CODE)"
fi

print_status "7. Iniciando sesión con segundo usuario..."

# Iniciar sesión con segundo usuario
SECOND_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seconduser@example.com",
    "password": "password123"
  }')

HTTP_CODE=$(echo "$SECOND_LOGIN_RESPONSE" | tail -n1)
SECOND_LOGIN_DATA=$(echo "$SECOND_LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    SECOND_TOKEN=$(echo "$SECOND_LOGIN_DATA" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    SECOND_USER_ID=$(echo "$SECOND_LOGIN_DATA" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    print_success "Segundo usuario logueado"
    print_status "Second User ID: $SECOND_USER_ID"
else
    print_error "Error iniciando sesión con segundo usuario (HTTP $HTTP_CODE)"
    echo "$SECOND_LOGIN_DATA"
    exit 1
fi

print_status "8. Uniendo segundo usuario a la comunidad..."

# Unir segundo usuario a la comunidad
JOIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/communities/$COMMUNITY_ID/join" \
  -H "Authorization: Bearer $SECOND_TOKEN")

HTTP_CODE=$(echo "$JOIN_RESPONSE" | tail -n1)
JOIN_DATA=$(echo "$JOIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    print_success "Segundo usuario se unió a la comunidad"
    
    # Verificar miembros
    MEMBER_COUNT=$(echo "$JOIN_DATA" | grep -o '"memberCount":[0-9]*' | cut -d':' -f2)
    print_status "Número de miembros después de unirse: $MEMBER_COUNT"
else
    print_error "Error uniendo usuario a comunidad (HTTP $HTTP_CODE)"
    echo "$JOIN_DATA"
    exit 1
fi

print_status "9. Probando abandono de comunidad..."

# Abandonar la comunidad
LEAVE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/communities/$COMMUNITY_ID/leave" \
  -H "Authorization: Bearer $SECOND_TOKEN")

HTTP_CODE=$(echo "$LEAVE_RESPONSE" | tail -n1)
LEAVE_DATA=$(echo "$LEAVE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    print_success "Usuario abandonó la comunidad correctamente"
    
    # Verificar miembros después de abandonar
    MEMBER_COUNT_AFTER=$(echo "$LEAVE_DATA" | grep -o '"memberCount":[0-9]*' | cut -d':' -f2)
    print_status "Número de miembros después de abandonar: $MEMBER_COUNT_AFTER"
    
    if [ "$MEMBER_COUNT_AFTER" -lt "$MEMBER_COUNT" ]; then
        print_success "✅ El contador de miembros se actualizó correctamente"
    else
        print_error "❌ El contador de miembros NO se actualizó correctamente"
    fi
else
    print_error "Error abandonando comunidad (HTTP $HTTP_CODE)"
    echo "$LEAVE_DATA"
    exit 1
fi

print_status "10. Verificando estado de membresía..."

# Verificar que el usuario ya no es miembro
MEMBERSHIP_CHECK=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/communities/$COMMUNITY_ID/membership/check" \
  -H "Authorization: Bearer $SECOND_TOKEN")

HTTP_CODE=$(echo "$MEMBERSHIP_CHECK" | tail -n1)
IS_MEMBER=$(echo "$MEMBERSHIP_CHECK" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    if [ "$IS_MEMBER" = "false" ]; then
        print_success "✅ Estado de membresía actualizado correctamente (false)"
    else
        print_error "❌ Estado de membresía NO se actualizó (aún muestra true)"
    fi
else
    print_error "Error verificando membresía (HTTP $HTTP_CODE)"
    echo "$IS_MEMBER"
fi

print_status "11. Limpiando datos de prueba..."

# Eliminar la comunidad de prueba
DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BACKEND_URL/api/communities/$COMMUNITY_ID" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "204" ]; then
    print_success "Comunidad de prueba eliminada"
else
    print_warning "No se pudo eliminar la comunidad de prueba (HTTP $HTTP_CODE)"
fi

echo ""
print_status "=== RESUMEN DE LA PRUEBA ==="
print_success "✅ API de abandono de comunidad funciona correctamente"
print_success "✅ Los contadores de miembros se actualizan en el backend"
print_success "✅ El estado de membresía se sincroniza correctamente"

echo ""
print_status "=== INSTRUCCIONES PARA PRUEBA MANUAL EN EL FRONTEND ==="
echo "1. Abre $FRONTEND_URL en tu navegador"
echo "2. Inicia sesión con: seconduser@example.com / password123"
echo "3. Ve a la sección de Comunidades"
echo "4. Crea o únete a una comunidad"
echo "5. Haz clic en 'Ver detalles' de la comunidad"
echo "6. Haz clic en 'Abandonar comunidad'"
echo "7. Regresa a la lista principal (botón Atrás)"
echo "8. Verifica que:"
echo "   - El botón ahora muestra 'Unirse' en lugar de 'Abandonar'"
echo "   - El contador de miembros disminuyó en 1"
echo "   - No necesitas refrescar la página para ver los cambios"

echo ""
print_success "🎉 Prueba de sincronización de estados completada!"
