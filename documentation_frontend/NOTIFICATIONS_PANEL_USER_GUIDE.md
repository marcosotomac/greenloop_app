# GUÍA DE USO - SISTEMA DE NOTIFICACIONES GREENLOOP

## CÓMO EJECUTAR EL SISTEMA

### 1. Prerequisitos

```bash
# Asegúrate de tener Node.js y npm instalados
node --version  # v18 o superior
npm --version   # v8 o superior
```

### 2. Iniciar el Frontend

```bash
cd vite-template-greenloop
npm install
npm run dev
```

### 3. Acceder al Panel de Notificaciones

- Navega a: `http://localhost:5173/notificaciones`
- O usa el enlace en la navegación de la aplicación

## FUNCIONALIDADES DISPONIBLES

### 📱 Panel Principal

- **Vista de todas las notificaciones** con paginación automática
- **Contadores en tiempo real** (total y no leídas)
- **Botones de acción masiva** (marcar todas, eliminar todas)

### 🔍 Sistema de Filtros

- **Por tipo**: Donaciones, intercambios, comunidades, etc.
- **Por período**: Última semana, último mes, últimos 3 meses
- **Por estado**: Solo no leídas

### ⚡ Acciones Disponibles

- **Marcar como leída**: Click en notificación individual
- **Responder**: Para solicitudes de membresía
- **Eliminar**: Notificaciones individuales
- **Ver detalles**: Enlaces a contenido relacionado

### 🔄 Actualizaciones Automáticas

- El sistema se actualiza automáticamente cada 30 segundos
- Botón "Actualizar" para refrescar manualmente

## TESTING DEL SISTEMA

### 1. Crear Notificaciones de Prueba

```bash
# Ejecutar script de demo desde el backend
cd ..
./demo-ai-endpoints.sh
```

### 2. Probar Diferentes Tipos

```javascript
// Desde la consola del navegador, puedes simular notificaciones:
fetch("/api/notifications", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Notificación de prueba",
    message: "Este es un mensaje de prueba",
    type: "GENERAL",
  }),
});
```

### 3. Verificar Funcionalidades

1. **Carga inicial**: Verifica que las notificaciones se muestran
2. **Filtros**: Prueba cada tipo de filtro
3. **Acciones**: Marca como leída, elimina notificaciones
4. **Responsive**: Prueba en móvil y desktop
5. **Estados**: Verifica loading states y mensajes de error

## INTEGRACIÓN CON OTROS MÓDULOS

### 🏘️ Comunidades

- Las solicitudes de membresía aparecen como notificaciones
- Modal especial para aprobar/rechazar solicitudes

### 🎁 Donaciones

- Notificaciones automáticas cuando recibes donaciones
- Enlaces directos a detalles de la donación

### 🔄 Intercambios

- Notificaciones de nuevas solicitudes
- Notificaciones de intercambios completados

### 📱 Posts y Productos

- Notificaciones de "me gusta" en productos
- Notificaciones de comentarios en posts

## SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Cannot read properties of undefined"

```bash
# Verificar que el backend está ejecutándose
curl http://localhost:8080/api/notifications/count

# Si falla, iniciar el backend:
cd ..
./mvnw spring-boot:run
```

### ❌ Notificaciones no se cargan

1. Verificar conexión a internet
2. Abrir DevTools > Network para ver requests
3. Verificar que el usuario está autenticado
4. Revisar consola para errores JavaScript

### ❌ Filtros no funcionan

1. Limpiar cache del navegador
2. Verificar que los tipos de notificación existen en el backend
3. Comprobar formato de fechas

### ❌ Modal de membresía no aparece

1. Verificar que la notificación tiene `referenceId`
2. Comprobar que el tipo es `COMMUNITY_REQUEST`
3. Verificar que el componente MembershipRequestModal está importado

## CONFIGURACIÓN AVANZADA

### 🔧 Modificar Intervalo de Polling

```typescript
// En useNotifications.tsx, línea ~220
useEffect(() => {
  const interval = setInterval(() => {
    loadCount();
  }, 30000); // Cambiar este valor (en ms)

  return () => clearInterval(interval);
}, [loadCount]);
```

### 🎨 Personalizar Colores de Tipos

```typescript
// En notificationService.tsx, función getNotificationTypeColor
export const getNotificationTypeColor = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.DONATION_RECEIVED:
      return "bg-green-100 text-green-800"; // Cambiar aquí
    // ... otros tipos
  }
};
```

### 📱 Modificar Tamaño de Página

```typescript
// En notificaciones.tsx, en useEffect inicial
useEffect(() => {
  loadNotifications(0, 20, filters); // Cambiar 20 por el número deseado
}, [filters, loadNotifications]);
```

## MONITOREO Y LOGS

### 📊 Verificar Estado del Sistema

```javascript
// En la consola del navegador
console.log(localStorage.getItem("notifications_cache"));
console.log(sessionStorage.getItem("notification_filters"));
```

### 🔍 Debug Mode

```typescript
// Agregar en useNotifications.tsx para debugging
const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  console.log("Notificaciones cargadas:", notifications);
  console.log("Filtros aplicados:", filters);
  console.log("Estado de carga:", loading);
}
```

## MEJORES PRÁCTICAS

### ✅ Performance

- Usar filtros para reducir cantidad de notificaciones cargadas
- Limpiar notificaciones antiguas regularmente
- Cerrar el panel cuando no se use para reducir polling

### ✅ UX

- Revisar notificaciones regularmente
- Usar filtros para encontrar notificaciones específicas
- Responder rápidamente a solicitudes de membresía

### ✅ Mantenimiento

- Backup regular de notificaciones importantes
- Limpiar notificaciones leídas periódicamente
- Reportar bugs o sugerencias al equipo de desarrollo

---

**💡 Tip**: Mantén el panel de notificaciones abierto en una pestaña para recibir actualizaciones automáticas de nuevas notificaciones.

**🔗 Enlaces Útiles**:

- Documentación técnica: `NOTIFICATIONS_PANEL_IMPLEMENTATION_COMPLETE.md`
- Código fuente: `src/pages/notificaciones.tsx`
- Servicios: `src/services/notificationService.tsx`
