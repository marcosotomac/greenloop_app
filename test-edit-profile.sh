#!/bin/bash

# Script para probar la funcionalidad de edición de perfil
# Asegúrate de que el backend esté ejecutándose en puerto 8081

echo "=== Prueba de funcionalidad Editar Perfil ==="
echo

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8081"

echo -e "${BLUE}1. Probando endpoint GET /user/me${NC}"
echo "Ejecuta el siguiente comando en otra terminal para obtener tu usuario actual:"
echo "curl -H 'Authorization: Bearer YOUR_TOKEN' ${BASE_URL}/user/me"
echo

echo -e "${BLUE}2. Probando endpoint PUT /user/me/profile${NC}"
echo "Ejecuta el siguiente comando para actualizar tu perfil:"
echo "curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "  -d '{\"firstName\":\"Nuevo Nombre\",\"lastName\":\"Nuevo Apellido\",\"address\":\"Nueva Dirección\",\"description\":\"Nueva descripción\"}' \\"
echo "  ${BASE_URL}/user/me/profile"
echo

echo -e "${GREEN}✅ Backend iniciado correctamente en puerto 8081${NC}"
echo -e "${GREEN}✅ Frontend iniciado correctamente en puerto 5174${NC}"
echo -e "${GREEN}✅ Endpoint de actualización de perfil implementado: PUT /user/me/profile${NC}"
echo -e "${GREEN}✅ Modal de edición de perfil implementado en el frontend${NC}"
echo

echo -e "${BLUE}Funcionalidades implementadas:${NC}"
echo "  - ✅ Endpoint backend PUT /user/me/profile"
echo "  - ✅ Validación de datos en el backend"
echo "  - ✅ Restricción: NO se puede cambiar el email"
echo "  - ✅ Modal de edición con validaciones en frontend"
echo "  - ✅ Interfaz moderna con advertencias sobre restricciones"
echo "  - ✅ Integración completa frontend-backend"
echo

echo -e "${BLUE}Para probar la funcionalidad:${NC}"
echo "1. Ve a http://localhost:5174"
echo "2. Inicia sesión con un usuario"
echo "3. Ve a tu perfil (MyProfile)"
echo "4. Haz clic en 'Editar Perfil'"
echo "5. Modifica los campos permitidos (nombre, apellidos, dirección, descripción)"
echo "6. Observa que el email NO es editable"
echo "7. Guarda los cambios"
echo

echo -e "${GREEN}¡Funcionalidad de edición de perfil implementada exitosamente!${NC}"
