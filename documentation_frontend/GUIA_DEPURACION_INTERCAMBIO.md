# 🐛 Guía de Depuración: Productos No Aparecen en Intercambio

## 🎯 **Problema Actual**

Los productos no aparecen en el modal "Solicitar Intercambio" a pesar de tener productos marcados como disponibles para intercambio.

## 🔍 **Pasos de Depuración**

### **1. Verificar Logs de Debug en Consola**

1. Abre la consola del navegador (F12 → Console)
2. Busca los logs que empiecen con `"Product debug:"`
3. Verifica que para TUS productos:
   ```
   belongsToCurrentUser: true
   availableForExchange: true/false
   ```

### **2. Verificar Estado Visual de Toggle**

Para cada producto tuyo, busca:

- ✅ **Botón verde**: "Desactivar intercambio" (está activo)
- ❌ **Botón gris**: "Activar intercambio" (está inactivo)
- 🔄 **Badge verde**: "🔄 Disponible para intercambio"

### **3. Verificar Llamada API**

1. Abre DevTools (F12) → Network tab
2. Haz clic en "Intercambiar" en cualquier producto
3. Busca la llamada a `/api/exchanges/my-products`
4. Verifica la respuesta:
   ```json
   [
     {
       "productId": X,
       "productName": "...",
       "availableForExchange": true,
       "belongsToCurrentUser": true
     }
   ]
   ```

### **4. Verificar Token de Autenticación**

1. Verifica que estés autenticado correctamente
2. El token debe estar en localStorage como `"token"`
3. Refrescar la página si hay dudas

## 🛠️ **Posibles Soluciones**

### **Solución 1: Activar Intercambio Manualmente**

1. Ve a la página de Productos
2. Para CADA producto tuyo que quieras intercambiar:
   - Busca el botón de toggle (abajo del producto)
   - Si dice "Activar intercambio" → haz clic
   - Debe cambiar a "Desactivar intercambio" y volverse verde
   - Debe aparecer el badge "🔄 Disponible para intercambio"

### **Solución 2: Verificar Base de Datos**

Si tienes acceso a la base de datos:

```sql
SELECT productId, productName, availableForExchange, status
FROM Product
WHERE user_id = TU_USER_ID;
```

### **Solución 3: Reiniciar Backend**

1. Para el servidor backend
2. Reinicia el servidor
3. Vuelve a cargar la página

### **Solución 4: Limpiar Estado del Frontend**

1. Refrescar página (F5)
2. Limpiar localStorage: `localStorage.clear()`
3. Volver a hacer login

## 🔧 **Pruebas con Script**

Ejecuta el script de verificación:

```bash
./test-exchange-status.sh
```

Esto te mostrará:

1. Todos tus productos y su estado
2. Qué productos están disponibles para intercambio
3. Si el backend está devolviendo datos correctos

## 📋 **Checklist de Verificación**

### ✅ **Frontend**

- [ ] Los logs de debug muestran `belongsToCurrentUser: true` para mis productos
- [ ] El botón de toggle cambia de gris a verde al hacer clic
- [ ] Aparece el badge "🔄 Disponible para intercambio"
- [ ] La llamada a `/api/exchanges/my-products` devuelve productos

### ✅ **Backend**

- [ ] El endpoint `/api/exchanges/my-products` está funcionando
- [ ] Los productos tienen `availableForExchange = true` en BD
- [ ] Los productos tienen `status = ACTIVE`
- [ ] El usuario está autenticado correctamente

### ✅ **Base de Datos**

- [ ] Los productos existen en la tabla `Product`
- [ ] El campo `availableForExchange` está en `true`
- [ ] El `user_id` corresponde al usuario autenticado

## 🚨 **Si Nada Funciona**

### **Opción 1: Crear Nuevo Producto**

1. Crea un producto nuevo
2. Activa el intercambio inmediatamente
3. Verifica que aparezca en el modal

### **Opción 2: Verificar Logs del Backend**

Busca en los logs del servidor:

```
INFO: Getting my products for exchange for user: X
INFO: Found X products available for exchange
```

### **Opción 3: Debugging con Postman/curl**

#### Obtener mis productos para intercambio:

```bash
curl -X GET "http://localhost:8081/api/exchanges/my-products" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json"
```

#### Activar intercambio en un producto:

```bash
curl -X PUT "http://localhost:8081/product/PRODUCT_ID/exchange-status" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"availableForExchange": true}'
```

## 🎯 **Resultado Esperado**

Después de seguir estos pasos:

1. ✅ Los productos aparecerán en el modal de intercambio
2. ✅ Podrás seleccionar qué producto ofrecer
3. ✅ El intercambio se completará sin errores

**¡Siguiendo esta guía sistemáticamente deberías poder identificar y resolver el problema! 🔍✨**
