package com.greenloop.greenloop.config;

import java.sql.Connection;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Configuración para aplicar parches de base de datos necesarios
 * que no pueden ser manejados automáticamente por Hibernate
 */
@Component
public class DatabasePatchConfig {

    @Autowired
    private DataSource dataSource;

    /**
     * Aplica parches necesarios a la base de datos después de que la aplicación
     * esté lista
     */
    @EventListener
    @Order(1000) // Ejecutar después de que Hibernate haya terminado
    @Transactional
    public void applyDatabasePatches(ApplicationReadyEvent event) {
        try {
            updateNotificationTypeConstraint();
            System.out.println("✅ Database patches applied successfully");
        } catch (Exception e) {
            System.err.println("⚠️ Error applying database patches: " + e.getMessage());
            // No fallar la aplicación por esto, solo logear el error
        }
    }

    /**
     * Actualiza el constraint de notifications.type para incluir todos los tipos
     * válidos
     */
    private void updateNotificationTypeConstraint() throws Exception {
        try (Connection connection = dataSource.getConnection();
                Statement statement = connection.createStatement()) {

            // Verificar si el constraint ya permite PRODUCT_CREATED
            // En PostgreSQL moderno, usamos pg_get_constraintdef para obtener la definición
            String checkSql = """
                    SELECT pg_get_constraintdef(oid) as constraint_def
                    FROM pg_constraint
                    WHERE conname = 'notifications_type_check'
                    """;
            var resultSet = statement.executeQuery(checkSql);

            boolean needsUpdate = true;
            if (resultSet.next()) {
                String constraintDef = resultSet.getString("constraint_def");
                if (constraintDef != null && constraintDef.contains("PRODUCT_CREATED")) {
                    needsUpdate = false;
                    System.out.println("ℹ️ Notification type constraint is already up to date");
                }
            }

            if (needsUpdate) {
                System.out.println("🔧 Updating notifications type constraint...");

                // Eliminar constraint existente
                statement.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");

                // Recrear constraint con todos los tipos válidos
                String newConstraintSql = """
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
                        ))
                        """;

                statement.execute(newConstraintSql);
                System.out.println("✅ Notifications type constraint updated successfully");
            }
        }
    }
}
