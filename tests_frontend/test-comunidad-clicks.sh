#!/bin/bash

# 🧪 Test de Funcionalidad - Página de Comunidades
# Verificar que los clics funcionan correctamente

echo "🧪 Iniciando pruebas de la página de comunidades..."
echo "=================================================="

# Verificar que el frontend está ejecutándose
echo ""
echo "1️⃣ Verificando frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend está ejecutándose en http://localhost:5173"
else
    echo "❌ Frontend no está disponible. Ejecuta: cd vite-template-greenloop && npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ Verificando backend..."
if curl -s http://localhost:8081/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend está ejecutándose en http://localhost:8081"
else
    echo "❌ Backend no está disponible. Ejecuta: ./mvnw spring-boot:run"
    exit 1
fi

echo ""
echo "3️⃣ Verificando archivos corregidos..."

# Verificar que el overlay no bloquea los clics
if grep -q "pointer-events-none" vite-template-greenloop/src/pages/comunidad.tsx; then
    echo "✅ Overlay decorativo tiene pointer-events-none"
else
    echo "❌ Falta pointer-events-none en el overlay"
fi

# Verificar imports correctos
if grep -q "@nextui-org/react" vite-template-greenloop/src/pages/comunidad.tsx; then
    echo "✅ Imports de NextUI correctos"
else
    echo "❌ Imports incorrectos detectados"
fi

# Verificar que CommunityCard tiene botones funcionales
if grep -q "onClick={handleViewClick}" vite-template-greenloop/src/components/community/CommunityCard.tsx; then
    echo "✅ Botón 'Ver Detalles' está configurado"
else
    echo "❌ Botón 'Ver Detalles' no encontrado"
fi

if grep -q "onClick={handleJoinClick}" vite-template-greenloop/src/components/community/CommunityCard.tsx; then
    echo "✅ Botón 'Unirse' está configurado"
else
    echo "❌ Botón 'Unirse' no encontrado"
fi

echo ""
echo "4️⃣ Verificando funciones de manejo de eventos..."

# Verificar que las funciones están definidas
if grep -q "handleViewCommunity" vite-template-greenloop/src/pages/comunidad.tsx; then
    echo "✅ Función handleViewCommunity definida"
else
    echo "❌ Función handleViewCommunity no encontrada"
fi

if grep -q "handleJoinCommunity" vite-template-greenloop/src/pages/comunidad.tsx; then
    echo "✅ Función handleJoinCommunity definida"
else
    echo "❌ Función handleJoinCommunity no encontrada"
fi

if grep -q "handleRequestMembership" vite-template-greenloop/src/pages/comunidad.tsx; then
    echo "✅ Función handleRequestMembership definida"
else
    echo "❌ Función handleRequestMembership no encontrada"
fi

echo ""
echo "5️⃣ Verificando props pasadas a CommunityCard..."

if grep -q "onView={handleViewCommunity}" vite-template-greenloop/src/pages/comunidad.tsx; then
    echo "✅ Prop onView pasada correctamente"
else
    echo "❌ Prop onView no encontrada"
fi

if grep -q "onJoin={handleJoinCommunity}" vite-template-greenloop/src/pages/comunidad.tsx; then
    echo "✅ Prop onJoin pasada correctamente"
else
    echo "❌ Prop onJoin no encontrada"
fi

if grep -q "onRequestMembership={handleRequestMembership}" vite-template-greenloop/src/pages/comunidad.tsx; then
    echo "✅ Prop onRequestMembership pasada correctamente"
else
    echo "❌ Prop onRequestMembership no encontrada"
fi

echo ""
echo "=================================================="
echo "🎉 Diagnóstico completado!"
echo ""
echo "💡 Para probar la funcionalidad:"
echo "1. Ve a http://localhost:5173/comunidad"
echo "2. Haz clic en 'Ver Detalles' en cualquier card"
echo "3. Haz clic en 'Unirse' o 'Solicitar' según el tipo de comunidad"
echo "4. Verifica que los clics respondan correctamente"
echo ""
echo "🔧 Si hay problemas:"
echo "- Verifica que ambos servidores estén ejecutándose"
echo "- Abre las herramientas de desarrollador (F12)"
echo "- Revisa la consola por errores JavaScript"
echo "- Verifica que no hay overlays bloqueando los clics"
