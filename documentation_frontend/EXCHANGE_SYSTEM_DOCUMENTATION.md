# 🔄 Sistema de Intercambios - GreenLoop

## 📋 Descripción

El sistema de intercambios de GreenLoop permite a los usuarios intercambiar productos de manera sostenible, fomentando la economía circular y reduciendo el desperdicio.

## 🚀 Funcionalidades Implementadas

### Backend (Spring Boot)

#### 📊 Entidades y Modelo de Datos

- **Exchange**: Entidad principal que gestiona los intercambios

  - Estados: PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED
  - Relaciones: requester, provider, requestedProduct, offeredProduct
  - Timestamps: requestedAt, completedAt

- **Product**: Mejorado con campos para intercambios
  - `availableForExchange`: Boolean para disponibilidad
  - `exchangePreferences`: Preferencias del propietario
  - `estimatedValue`: Valor estimado para intercambios justos
  - Relaciones con intercambios

#### 🛠 Servicios y Lógica de Negocio

- **ExchangeService**: Lógica completa de intercambios
  - Solicitud de intercambios con validaciones
  - Aceptación/rechazo por parte del proveedor
  - Completar intercambios con intercambio de propiedades
  - Sistema de puntos (10 puntos por intercambio completado)
  - Estadísticas detalladas de intercambios

#### 🌐 API REST Endpoints

```
POST   /api/exchanges                    - Solicitar intercambio
PUT    /api/exchanges/{id}/accept        - Aceptar intercambio
PUT    /api/exchanges/{id}/reject        - Rechazar intercambio
PUT    /api/exchanges/{id}/complete      - Completar intercambio
PUT    /api/exchanges/{id}/cancel        - Cancelar intercambio
GET    /api/exchanges/requested          - Mis solicitudes
GET    /api/exchanges/provided           - Solicitudes recibidas
GET    /api/exchanges/available-products - Productos disponibles
GET    /api/exchanges/my-products        - Mis productos para intercambio
GET    /api/exchanges/statistics         - Estadísticas de intercambios
```

#### 🎯 Validaciones y Reglas de Negocio

- Un usuario no puede intercambiar consigo mismo
- Solo el propietario puede ofrecer sus productos
- Solo el proveedor puede aceptar/rechazar solicitudes
- Solo el solicitante puede cancelar intercambios
- Productos deben estar disponibles para intercambio
- Control de estados de intercambio

### Frontend (React + TypeScript)

#### 🎨 Componentes Principales

1. **IntercambiosPage**: Página principal de gestión de intercambios

   - Tabs para solicitudes enviadas y recibidas
   - Estadísticas en tiempo real
   - Acciones contextuales según el rol

2. **ExchangeCard**: Tarjeta de intercambio

   - Información de productos y participantes
   - Botones de acción según estado y rol
   - Indicadores visuales de estado

3. **ExchangeStats**: Panel de estadísticas

   - Total de intercambios
   - Estados detallados
   - Puntos ganados

4. **CreateExchangeModal**: Modal para crear intercambios

   - Proceso de 2 pasos
   - Búsqueda y filtrado de productos
   - Selección de productos propios

5. **ExchangeMarketplacePage**: Marketplace de productos
   - Exploración de productos disponibles
   - Filtros por categoría y búsqueda
   - Iniciación rápida de intercambios

#### 🔧 Servicios y Hooks

- **exchangeService**: Cliente API para todas las operaciones
- **useExchanges**: Hook para gestión de estado de intercambios
- **useExchangeStatistics**: Hook para estadísticas

#### 📱 Experiencia de Usuario

- **Estados Visuales**: Colores diferenciados por estado de intercambio
- **Navegación Intuitiva**: Tabs y modales para una experiencia fluida
- **Feedback Inmediato**: Actualizaciones en tiempo real
- **Responsive Design**: Optimizado para móviles y desktop

## 🔄 Flujo de Intercambio

### 1. Descubrimiento

```
Usuario A → Explora marketplace → Encuentra producto de Usuario B
```

### 2. Solicitud

```
Usuario A → Selecciona producto deseado → Selecciona su producto → Envía solicitud
Estado: PENDING
```

### 3. Evaluación

```
Usuario B → Recibe notificación → Revisa solicitud → Acepta/Rechaza
Estado: ACCEPTED/REJECTED
```

### 4. Intercambio

```
Ambos usuarios → Coordinan intercambio → Marcan como completado
Estado: COMPLETED
```

### 5. Finalización

```
Sistema → Intercambia propiedades → Otorga puntos → Actualiza estadísticas
```

## 🎮 Estados de Intercambio

| Estado        | Descripción                                  | Acciones Disponibles                                 |
| ------------- | -------------------------------------------- | ---------------------------------------------------- |
| **PENDING**   | Solicitud enviada, esperando respuesta       | Aceptar/Rechazar (Proveedor), Cancelar (Solicitante) |
| **ACCEPTED**  | Intercambio aceptado, pendiente de completar | Completar (Ambos), Cancelar (Solicitante)            |
| **COMPLETED** | Intercambio finalizado exitosamente          | Solo visualización                                   |
| **REJECTED**  | Solicitud rechazada                          | Solo visualización                                   |
| **CANCELLED** | Intercambio cancelado por el solicitante     | Solo visualización                                   |

## 🏆 Sistema de Puntos y Gamificación

- **10 puntos** por intercambio completado (para ambos participantes)
- Contador de items intercambiados en perfil de usuario
- Estadísticas detalladas para tracking de progreso
- Valor promedio de productos para métricas

## 🔐 Seguridad y Validaciones

### Backend

- Validación de propiedad de productos
- Control de permisos por rol (solicitante/proveedor)
- Validación de estados de intercambio
- Transacciones atómicas para completar intercambios

### Frontend

- Validación de formularios
- Manejo de errores de API
- Estados de carga
- Protección contra acciones no autorizadas

## 📊 Métricas y Analíticas

El sistema proporciona estadísticas detalladas:

- Total de intercambios por usuario
- Intercambios por estado
- Puntos ganados
- Valor promedio de productos
- Historial completo de actividad

## 🚀 Cómo Usar

### Para Usuarios

1. **Configurar Productos**:

   - Marcar productos como disponibles para intercambio
   - Establecer preferencias de intercambio
   - Definir valor estimado

2. **Explorar Marketplace**:

   - Buscar productos por categoría o texto
   - Filtrar por ubicación y preferencias
   - Ver detalles y propietarios

3. **Solicitar Intercambio**:

   - Seleccionar producto deseado
   - Elegir producto propio para ofrecer
   - Enviar solicitud con mensaje opcional

4. **Gestionar Solicitudes**:

   - Revisar solicitudes recibidas
   - Aceptar o rechazar según criterios
   - Coordinar detalles del intercambio

5. **Completar Intercambio**:
   - Realizar el intercambio físico
   - Marcar como completado en la app
   - Ganar puntos y actualizar estadísticas

### Para Desarrolladores

1. **Backend**: Los endpoints están documentados y siguen REST conventions
2. **Frontend**: Componentes modulares y reutilizables con TypeScript
3. **Estado**: Gestión centralizada con hooks personalizados
4. **Estilos**: Tailwind CSS para diseño consistente

## 🔮 Futuras Mejoras

- [ ] Sistema de notificaciones push
- [ ] Chat integrado entre participantes
- [ ] Sistema de calificaciones y reseñas
- [ ] Intercambios grupales
- [ ] Geolocalización y mapas
- [ ] Integración con redes sociales
- [ ] Sistema de garantías y seguros
- [ ] Marketplace especializado por categorías
- [ ] Inteligencia artificial para recomendaciones
- [ ] Sistema de devoluciones

## 🛠 Tecnologías Utilizadas

### Backend

- Spring Boot 3.x
- Spring Data JPA
- Spring Security
- PostgreSQL/MySQL
- Lombok

### Frontend

- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Hooks

### Herramientas de Desarrollo

- Maven
- Vite
- ESLint
- Prettier

---

¡El sistema de intercambios está listo para fomentar una economía circular sostenible en GreenLoop! 🌱♻️
