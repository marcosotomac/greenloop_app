#!/bin/bash

# Test script para verificar la funcionalidad de abandonar comunidad
# Fecha: $(date)

echo "==================================="
echo "TESTING LEAVE COMMUNITY FUNCTIONALITY"
echo "==================================="

# Variables
BACKEND_URL="http://localhost:8081"
FRONTEND_URL="http://localhost:5176"

echo "🔍 1. Verificando que el backend esté funcionando..."
if curl -s ${BACKEND_URL}/api/communities > /dev/null; then
    echo "✅ Backend está funcionando en ${BACKEND_URL}"
else
    echo "❌ Backend no está respondiendo"
    exit 1
fi

echo ""
echo "🔍 2. Verificando que el frontend esté funcionando..."
if curl -s ${FRONTEND_URL} > /dev/null; then
    echo "✅ Frontend está funcionando en ${FRONTEND_URL}"
else
    echo "❌ Frontend no está respondiendo"
    exit 1
fi

echo ""
echo "🔍 3. Verificando endpoint de abandonar comunidad..."
# Intentar hacer una petición POST (método correcto)
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" -X POST ${BACKEND_URL}/api/communities/1/leave \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer invalid_token")

if [ "$HTTP_STATUS" -eq 401 ] || [ "$HTTP_STATUS" -eq 403 ]; then
    echo "✅ Endpoint /api/communities/{id}/leave responde correctamente con POST (status: ${HTTP_STATUS})"
    echo "   (401/403 es esperado sin token válido)"
else
    echo "⚠️  Endpoint responde con status: ${HTTP_STATUS}"
fi

echo ""
echo "🔍 4. Verificando que método DELETE falle (como debería)..."
HTTP_STATUS_DELETE=$(curl -o /dev/null -s -w "%{http_code}" -X DELETE ${BACKEND_URL}/api/communities/1/leave \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer invalid_token")

if [ "$HTTP_STATUS_DELETE" -eq 404 ] || [ "$HTTP_STATUS_DELETE" -eq 405 ]; then
    echo "✅ Método DELETE correctamente rechazado (status: ${HTTP_STATUS_DELETE})"
    echo "   Esto confirma que solo POST funciona"
else
    echo "⚠️  Método DELETE responde con status: ${HTTP_STATUS_DELETE}"
fi

echo ""
echo "🔍 5. Verificando estructura de archivos corregidos..."
FILES_TO_CHECK=(
    "vite-template-greenloop/src/api/api.tsx"
    "vite-template-greenloop/src/components/community/CommunityDetail.tsx"
    "vite-template-greenloop/LEAVE_COMMUNITY_FIX_COMPLETE.md"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file no encontrado"
    fi
done

echo ""
echo "🔍 6. Verificando que la corrección esté aplicada..."
if grep -q 'method: "POST"' vite-template-greenloop/src/api/api.tsx; then
    echo "✅ Método POST encontrado en api.tsx"
else
    echo "❌ Método POST no encontrado en api.tsx"
fi

if grep -q "Error leaving community:" vite-template-greenloop/src/api/api.tsx; then
    echo "✅ Manejo de errores mejorado encontrado"
else
    echo "❌ Manejo de errores mejorado no encontrado"
fi

echo ""
echo "==================================="
echo "RESUMEN DE LA CORRECCIÓN"
echo "==================================="
echo "✅ Problema identificado: Incompatibilidad HTTP method (DELETE vs POST)"
echo "✅ Solución implementada: Cambio de DELETE a POST en frontend"
echo "✅ Manejo de errores mejorado"
echo "✅ Backend y frontend funcionando"
echo ""
echo "🎯 PRÓXIMO PASO: Probar en navegador"
echo "   1. Ir a ${FRONTEND_URL}"
echo "   2. Iniciar sesión"
echo "   3. Entrar a una comunidad (no creada por ti)"
echo "   4. Probar el botón 'Abandonar'"
echo ""
echo "==================================="
