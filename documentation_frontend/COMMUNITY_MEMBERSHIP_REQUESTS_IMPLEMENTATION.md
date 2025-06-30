# Sistema de Solicitudes de Membresía para Comunidades

## Resumen

Se ha implementado un sistema completo de solicitudes de membresía que permite a los usuarios solicitar unirse a comunidades y a los creadores de comunidades aprobar o rechazar estas solicitudes a través de notificaciones.

## Funcionalidades Implementadas

### 1. Nuevas Entidades

#### CommunityMembershipRequest

- **Ubicación**: `src/main/java/com/greenloop/greenloop/community/domain/CommunityMembershipRequest.java`
- **Campos**:
  - `id`: ID único de la solicitud
  - `community`: Comunidad a la que se solicita unirse
  - `user`: Usuario que solicita la membresía
  - `message`: Mensaje opcional del solicitante
  - `status`: Estado de la solicitud (PENDING, APPROVED, REJECTED)
  - `createdAt`: Fecha de creación de la solicitud
  - `respondedAt`: Fecha de respuesta (cuando el creador responde)
  - `responseMessage`: Mensaje opcional del creador al responder

### 2. Nuevos DTOs

#### MembershipRequestDto

- Para enviar solicitudes de membresía
- Campo: `message` (opcional)

#### MembershipRequestResponseDto

- Para respuestas de solicitudes
- Incluye toda la información de la solicitud

#### MembershipRequestActionDto

- Para responder a solicitudes
- Campos: `approved` (boolean) y `responseMessage` (opcional)

### 3. Nuevos Servicios

#### CommunityMembershipRequestService

- **Ubicación**: `src/main/java/com/greenloop/greenloop/community/domain/CommunityMembershipRequestService.java`
- **Métodos principales**:
  - `createMembershipRequest()`: Crear solicitud de membresía
  - `respondToMembershipRequest()`: Aprobar/rechazar solicitud
  - `getPendingRequestsForCreator()`: Obtener solicitudes pendientes para un creador
  - `getUserRequests()`: Obtener solicitudes de un usuario
  - `getCommunityPendingRequests()`: Obtener solicitudes de una comunidad específica

### 4. Nuevos Endpoints en CommunityController

#### POST `/api/communities/{id}/request-membership`

- Solicitar membresía a una comunidad
- Requiere autenticación
- Body: `MembershipRequestDto`

#### GET `/api/communities/membership-requests/pending`

- Obtener solicitudes pendientes para las comunidades del usuario autenticado
- Solo muestra solicitudes donde el usuario es creador de la comunidad

#### GET `/api/communities/membership-requests/my-requests`

- Obtener todas las solicitudes de membresía del usuario autenticado

#### GET `/api/communities/{id}/membership-requests`

- Obtener solicitudes pendientes para una comunidad específica
- Solo el creador de la comunidad puede acceder

#### PUT `/api/communities/membership-requests/{requestId}/respond`

- Responder a una solicitud de membresía (aprobar/rechazar)
- Solo el creador de la comunidad puede responder
- Body: `MembershipRequestActionDto`

#### GET `/api/communities/membership-requests/{requestId}`

- Obtener detalles de una solicitud específica
- Solo el solicitante o el creador pueden acceder

#### GET `/api/communities/membership-requests/count`

- Contar solicitudes pendientes para las comunidades del usuario

### 5. Sistema de Notificaciones Integrado

#### Nuevo Tipo de Notificación

- Se agregó `COMMUNITY_REQUEST` al enum `NotificationType`

#### Notificaciones Automáticas

1. **Cuando se crea una solicitud**:

   - Se envía notificación al creador de la comunidad
   - Tipo: `COMMUNITY_REQUEST`
   - Incluye enlace para responder: `/api/communities/membership-requests/{requestId}`

2. **Cuando se responde a una solicitud**:
   - Se envía notificación al solicitante
   - Tipo: `COMMUNITY`
   - Mensaje indica si fue aprobada o rechazada
   - Incluye enlace a la comunidad si fue aprobada

#### NotificationService Mejorado

- Nuevo método: `createNotification()` con parámetros avanzados
- Soporte para `referenceId` y `actionUrl`
- Integración con `NotificationEvent` para notificaciones asíncronas

## Flujo de Uso

### 1. Solicitar Membresía

```bash
POST /api/communities/123/request-membership
{
  "message": "Me gustaría unirme a esta comunidad para..."
}
```

### 2. El Creador Recibe Notificación

- Notificación automática con título: "Nueva solicitud de membresía"
- Mensaje incluye nombre del solicitante y mensaje opcional
- `actionUrl` apunta al endpoint para responder

### 3. Ver Solicitudes Pendientes

```bash
GET /api/communities/membership-requests/pending
```

### 4. Responder a Solicitud

```bash
PUT /api/communities/membership-requests/456/respond
{
  "approved": true,
  "responseMessage": "Bienvenido a la comunidad!"
}
```

### 5. El Solicitante Recibe Notificación

- Notificación automática indicando si fue aprobado o rechazado
- Si fue aprobado, automáticamente se agrega a la comunidad
- `actionUrl` apunta a la página de la comunidad

## Seguridad y Validaciones

### Validaciones Implementadas

1. **No duplicar solicitudes**: Se verifica que no exista una solicitud pendiente
2. **No solicitar si ya es miembro**: Se verifica que el usuario no sea ya miembro
3. **Solo creador puede responder**: Solo el creador de la comunidad puede aprobar/rechazar
4. **Solo responder solicitudes pendientes**: No se pueden cambiar solicitudes ya respondidas
5. **Autorización para ver solicitudes**: Solo el solicitante o creador pueden ver los detalles

### Manejo de Errores

- Excepciones específicas: `CommunityNotFoundException`, `CommunityAuthorizationException`, `CommunityMembershipException`
- Manejo de transacciones: Si falla agregar a la comunidad, se revierte el estado de la solicitud
- Respuestas HTTP apropiadas con mensajes descriptivos

## Casos de Uso Cubiertos

1. ✅ Usuario solicita unirse a una comunidad
2. ✅ Creador recibe notificación de nueva solicitud
3. ✅ Creador puede ver todas sus solicitudes pendientes
4. ✅ Creador puede aprobar o rechazar desde la notificación
5. ✅ Usuario recibe notificación de la respuesta
6. ✅ Si es aprobado, se agrega automáticamente a la comunidad
7. ✅ Usuario puede ver el estado de sus solicitudes
8. ✅ Sistema previene duplicados y solicitudes inválidas

## Base de Datos

### Nueva Tabla: `community_membership_requests`

```sql
CREATE TABLE community_membership_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    message VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    responded_at DATETIME,
    response_message VARCHAR(500),
    FOREIGN KEY (community_id) REFERENCES communities(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Índices Recomendados

```sql
CREATE INDEX idx_community_status ON community_membership_requests(community_id, status);
CREATE INDEX idx_user_created ON community_membership_requests(user_id, created_at);
CREATE INDEX idx_creator_pending ON community_membership_requests(community_id, status, created_at);
```

## Integración Frontend

### Ejemplos de Integración

#### 1. Botón para Solicitar Membresía

```javascript
const requestMembership = async (communityId, message) => {
  const response = await fetch(
    `/api/communities/${communityId}/request-membership`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }
  );
  return response.json();
};
```

#### 2. Panel de Solicitudes Pendientes

```javascript
const getPendingRequests = async () => {
  const response = await fetch("/api/communities/membership-requests/pending", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

#### 3. Responder a Solicitud

```javascript
const respondToRequest = async (requestId, approved, responseMessage) => {
  const response = await fetch(
    `/api/communities/membership-requests/${requestId}/respond`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ approved, responseMessage }),
    }
  );
  return response.json();
};
```

## Testing

### Endpoints para Probar

1. **Crear solicitud**:

   ```bash
   curl -X POST http://localhost:8080/api/communities/1/request-membership \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message": "Quiero unirme a esta comunidad"}'
   ```

2. **Ver solicitudes pendientes**:

   ```bash
   curl -X GET http://localhost:8080/api/communities/membership-requests/pending \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Responder a solicitud**:
   ```bash
   curl -X PUT http://localhost:8080/api/communities/membership-requests/1/respond \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"approved": true, "responseMessage": "Bienvenido!"}'
   ```

## Próximos Pasos Recomendados

1. **Tests Unitarios**: Crear tests para el `CommunityMembershipRequestService`
2. **Tests de Integración**: Probar el flujo completo de solicitud → notificación → respuesta
3. **UI Components**: Crear componentes React para mostrar y manejar solicitudes
4. **Paginación**: Agregar paginación a los endpoints de listado
5. **Filtros**: Permitir filtrar solicitudes por estado, fecha, etc.
6. **Métricas**: Agregar métricas sobre solicitudes de membresía
7. **Email Notifications**: Opcionalmente enviar emails además de notificaciones in-app

## Conclusión

El sistema de solicitudes de membresía está completamente implementado y funcional. Integra perfectamente con el sistema de notificaciones existente y proporciona una experiencia de usuario fluida para unirse a comunidades de manera controlada.
