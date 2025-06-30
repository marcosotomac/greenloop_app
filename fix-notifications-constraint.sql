-- Script para corregir el constraint de tipos de notificación
-- Esto permite los nuevos tipos de notificación que se han añadido al enum

-- Primero, eliminar el constraint existente
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recrear el constraint con todos los tipos válidos
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'SYSTEM',
    'DONATION',
    'EXCHANGE',
    'EXCHANGE_REQUEST',
    'EXCHANGE_ACCEPTED',
    'EXCHANGE_REJECTED',
    'PRODUCT',
    'PRODUCT_CREATED',
    'PRODUCT_LIKED',
    'PRODUCT_COMMENTED',
    'COMMUNITY',
    'COMMUNITY_REQUEST',
    'COMMUNITY_CREATED',
    'COMMUNITY_JOINED',
    'COMMUNITY_POST',
    'MESSAGE',
    'WISHLIST',
    'WISHLIST_ITEM_AVAILABLE',
    'ACHIEVEMENT',
    'FOLLOW',
    'RATING',
    'GENERAL'
));

-- Verificar que el constraint se aplicó correctamente
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'notifications_type_check';
