package com.greenloop.greenloop.dashboard.application;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.greenloop.greenloop.dashboard.domain.DashboardService;
import com.greenloop.greenloop.dashboard.dto.CategoryStatsDto;
import com.greenloop.greenloop.dashboard.dto.DashboardStatsDto;
import com.greenloop.greenloop.dashboard.dto.MonthlyActivityDto;
import com.greenloop.greenloop.dashboard.dto.RecentActivityDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "API para estadísticas globales del dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas globales", description = "Obtiene las estadísticas principales del dashboard")
    public ResponseEntity<DashboardStatsDto> getGlobalStats() {
        DashboardStatsDto stats = dashboardService.getGlobalStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/activity/monthly")
    @Operation(summary = "Obtener actividad mensual", description = "Obtiene los datos de actividad mensual para el gráfico")
    public ResponseEntity<List<MonthlyActivityDto>> getMonthlyActivity(
            @Parameter(description = "Número de meses hacia atrás") @RequestParam(defaultValue = "7") int months) {
        List<MonthlyActivityDto> activity = dashboardService.getMonthlyActivity(months);
        return ResponseEntity.ok(activity);
    }

    @GetMapping("/categories")
    @Operation(summary = "Obtener estadísticas por categorías", description = "Obtiene la distribución de productos por categorías")
    public ResponseEntity<List<CategoryStatsDto>> getCategoryStats() {
        List<CategoryStatsDto> categories = dashboardService.getCategoryStats();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/activity/recent")
    @Operation(summary = "Obtener actividad reciente", description = "Obtiene la lista de actividades recientes del sistema")
    public ResponseEntity<List<RecentActivityDto>> getRecentActivity(
            @Parameter(description = "Número máximo de actividades") @RequestParam(defaultValue = "10") int limit) {
        List<RecentActivityDto> activities = dashboardService.getRecentActivity(limit);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/waste-impact")
    @Operation(summary = "Obtener impacto de residuos evitados", description = "Calcula el impacto ambiental basado en intercambios y donaciones")
    public ResponseEntity<Map<String, Object>> getWasteImpact() {
        Map<String, Object> impact = dashboardService.getWasteImpact();
        return ResponseEntity.ok(impact);
    }

    @GetMapping("/trends")
    @Operation(summary = "Obtener tendencias de crecimiento", description = "Obtiene las tendencias de crecimiento de la plataforma")
    public ResponseEntity<Map<String, Object>> getGrowthTrends() {
        Map<String, Object> trends = dashboardService.getGrowthTrends();
        return ResponseEntity.ok(trends);
    }
}
