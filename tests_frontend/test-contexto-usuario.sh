#!/bin/bash

echo "🧪 SCRIPT DE VALIDACIÓN - CONTEXTO DE USUARIO"
echo "=============================================="
echo ""

echo "🔍 VERIFICANDO IMPLEMENTACIÓN BACKEND..."
echo "========================================"
echo ""

# Verificar que los archivos del backend existen
if [ -f "src/main/java/com/greenloop/greenloop/User/dto/CurrentUserDto.java" ]; then
    echo "✅ CurrentUserDto.java - EXISTE"
else
    echo "❌ CurrentUserDto.java - NO ENCONTRADO"
fi

if grep -q "getCurrentUser" "src/main/java/com/greenloop/greenloop/User/domain/UserService.java" 2>/dev/null; then
    echo "✅ UserService.getCurrentUser() - IMPLEMENTADO"
else
    echo "❌ UserService.getCurrentUser() - NO ENCONTRADO"
fi

if grep -q "/me" "src/main/java/com/greenloop/greenloop/User/application/UserController.java" 2>/dev/null; then
    echo "✅ UserController GET /user/me - IMPLEMENTADO"
else
    echo "❌ UserController GET /user/me - NO ENCONTRADO"
fi

echo ""
echo "🔍 VERIFICANDO IMPLEMENTACIÓN FRONTEND..."
echo "========================================"
echo ""

# Verificar que los archivos del frontend existen
if [ -f "vite-template-greenloop/src/contexts/UserContext.tsx" ]; then
    echo "✅ UserContext.tsx - EXISTE"
else
    echo "❌ UserContext.tsx - NO ENCONTRADO"
fi

if grep -q "CurrentUserDto" "vite-template-greenloop/src/types/interfaces.tsx" 2>/dev/null; then
    echo "✅ CurrentUserDto interface - DEFINIDO"
else
    echo "❌ CurrentUserDto interface - NO ENCONTRADO"
fi

if grep -q "getCurrentUser" "vite-template-greenloop/src/api/api.tsx" 2>/dev/null; then
    echo "✅ getCurrentUser API function - IMPLEMENTADO"
else
    echo "❌ getCurrentUser API function - NO ENCONTRADO"
fi

if grep -q "UserProvider" "vite-template-greenloop/src/provider.tsx" 2>/dev/null; then
    echo "✅ UserProvider en Provider - INTEGRADO"
else
    echo "❌ UserProvider en Provider - NO INTEGRADO"
fi

if grep -q "useUser" "vite-template-greenloop/src/components/sidebar.tsx" 2>/dev/null; then
    echo "✅ useUser en Sidebar - IMPLEMENTADO"
else
    echo "❌ useUser en Sidebar - NO IMPLEMENTADO"
fi

echo ""
echo "🚀 PASOS PARA PROBAR MANUALMENTE:"
echo "================================="
echo ""

echo "1. 🏗️  COMPILAR Y EJECUTAR BACKEND:"
echo "   cd proyecto-backend-greenloopppp_front_initial"
echo "   ./mvnw spring-boot:run"
echo ""

echo "2. 🌐 COMPILAR Y EJECUTAR FRONTEND:"
echo "   cd vite-template-greenloop"
echo "   npm install (si es necesario)"
echo "   npm run dev"
echo ""

echo "3. 🔐 HACER LOGIN:"
echo "   - Ir a http://localhost:5173"
echo "   - Hacer login con usuario válido"
echo "   - Verificar que sidebar muestra datos reales"
echo ""

echo "4. 🔍 VERIFICAR DATOS:"
echo "   - Abrir DevTools (F12)"
echo "   - Ir a Network tab"
echo "   - Buscar llamada a '/user/me'"
echo "   - Verificar que retorna datos correctos"
echo ""

echo "5. 📱 PROBAR RESPONSIVE:"
echo "   - Cambiar a vista móvil en DevTools"
echo "   - Verificar que sidebar se adapta"
echo "   - Verificar que datos se muestran correctamente"
echo ""

echo "🎯 RESULTADOS ESPERADOS:"
echo "======================="
echo ""

echo "✅ En lugar de 'Carlos Méndez' debe aparecer:"
echo "   👤 [Tu Nombre Real]"
echo "   📧 tu.email@real.com"
echo ""

echo "✅ Durante la carga inicial:"
echo "   🔄 Skeleton loading animation"
echo "   ⏳ Datos aparecen después de cargar"
echo ""

echo "✅ Al hacer logout:"
echo "   🚪 Datos se limpian automáticamente"
echo "   🔄 Vuelve a estado por defecto"
echo ""

echo "🐛 TROUBLESHOOTING:"
echo "=================="
echo ""

echo "Si no funciona, verificar:"
echo ""

echo "🔧 BACKEND:"
echo "   - ¿El servidor está corriendo en puerto 8081?"
echo "   - ¿Hay errores en los logs del servidor?"
echo "   - ¿El endpoint /user/me responde correctamente?"
echo ""

echo "🔧 FRONTEND:"
echo "   - ¿Hay errores en la consola del navegador?"
echo "   - ¿El token está presente en localStorage?"
echo "   - ¿La llamada a la API se está realizando?"
echo ""

echo "🔧 CORS:"
echo "   - ¿El backend permite requests del frontend?"
echo "   - ¿Los headers de autenticación se envían?"
echo ""

echo "📞 COMANDOS DE DEBUG:"
echo "===================="
echo ""

echo "# Verificar que el backend responde:"
echo "curl -H \"Authorization: Bearer <tu-token>\" http://localhost:8081/user/me"
echo ""

echo "# Verificar logs del backend:"
echo "tail -f logs/spring.log"
echo ""

echo "# Verificar estado del frontend:"
echo "# En DevTools Console:"
echo "localStorage.getItem('token')"
echo ""

echo "🎉 ¡LISTO PARA PROBAR!"
echo "====================="
echo "Si todo está implementado correctamente,"
echo "deberías ver tu información real en el sidebar."
echo ""

echo "¡VALIDACIÓN COMPLETA! ✨"
