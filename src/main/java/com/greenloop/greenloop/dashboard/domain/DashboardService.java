package com.greenloop.greenloop.dashboard.domain;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.community.infrastructure.CommunityRepository;
import com.greenloop.greenloop.dashboard.dto.CategoryStatsDto;
import com.greenloop.greenloop.dashboard.dto.DashboardStatsDto;
import com.greenloop.greenloop.dashboard.dto.MonthlyActivityDto;
import com.greenloop.greenloop.dashboard.dto.RecentActivityDto;
import com.greenloop.greenloop.donation.domain.Donation;
import com.greenloop.greenloop.donation.infrastucture.DonationRepository;
import com.greenloop.greenloop.exchange.domain.Exchange;
import com.greenloop.greenloop.exchange.infraestructure.ExchangeRepository;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ExchangeRepository exchangeRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private CommunityRepository communityRepository;

    public DashboardStatsDto getGlobalStats() {
        Long totalUsers = userRepository.count();
        Long totalProducts = productRepository.count();
        Long totalExchanges = exchangeRepository.count();
        Long totalDonations = donationRepository.count();
        Long totalCommunities = communityRepository.count();

        // Calcular residuos evitados basado en intercambios y donaciones completados
        Double wasteAvoided = calculateWasteAvoided();

        // Calcular usuarios activos (que han hecho alguna actividad en los últimos 30
        // días)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        Long activeUsers = userRepository.countActiveUsersSince(thirtyDaysAgo);

        // Calcular porcentaje de crecimiento (comparar con mes anterior)
        Double growthPercentage = calculateGrowthPercentage();

        return DashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalExchanges(totalExchanges)
                .totalDonations(totalDonations)
                .totalCommunities(totalCommunities)
                .wasteAvoided(wasteAvoided)
                .activeUsers(activeUsers)
                .growthPercentage(growthPercentage)
                .build();
    }

    public List<MonthlyActivityDto> getMonthlyActivity(int months) {
        List<MonthlyActivityDto> activities = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusDays(1).withHour(23).withMinute(59).withSecond(59);

            // Convertir LocalDateTime a ZonedDateTime para user repository
            ZonedDateTime monthStartZoned = monthStart.atZone(ZoneId.systemDefault());
            ZonedDateTime monthEndZoned = monthEnd.atZone(ZoneId.systemDefault());

            // Contar actividades del mes (intercambios + donaciones + nuevos usuarios)
            Long exchangesCount = exchangeRepository.countByCreatedAtBetween(monthStart, monthEnd);
            Long donationsCount = donationRepository.countByCreatedAtBetween(monthStart, monthEnd);
            Long newUsersCount = userRepository.countByCreatedAtBetween(monthStartZoned, monthEndZoned);

            Long totalActivity = exchangesCount + donationsCount + newUsersCount;

            String monthName = monthStart.format(DateTimeFormatter.ofPattern("MMM"));
            String displayMonth = monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy"));

            activities.add(MonthlyActivityDto.builder()
                    .month(monthName)
                    .displayMonth(displayMonth)
                    .value(totalActivity)
                    .build());
        }

        return activities;
    }

    public List<CategoryStatsDto> getCategoryStats() {
        List<CategoryStatsDto> categories = new ArrayList<>();

        // Obtener estadísticas por categoría de productos
        Map<String, Long> categoryCount = productRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        product -> product.getCategory() != null ? product.getCategory().toString() : "Otros",
                        Collectors.counting()));

        // Colores predefinidos para las categorías
        String[] colors = { "#22c55e", "#0ea5e9", "#f59e0b", "#8b5cf6", "#64748b", "#ef4444", "#06b6d4" };
        int colorIndex = 0;

        for (Map.Entry<String, Long> entry : categoryCount.entrySet()) {
            categories.add(CategoryStatsDto.builder()
                    .name(entry.getKey())
                    .value(entry.getValue())
                    .color(colors[colorIndex % colors.length])
                    .build());
            colorIndex++;
        }

        return categories;
    }

    public List<RecentActivityDto> getRecentActivity(int limit) {
        List<RecentActivityDto> activities = new ArrayList<>();

        // Obtener donaciones recientes
        Pageable pageable = PageRequest.of(0, limit / 3);
        List<Donation> recentDonations = donationRepository.findRecentDonations(pageable);

        for (Donation donation : recentDonations) {
            User donor = donation.getDonor();
            if (donor != null && donor.getFirstName() != null && donor.getLastName() != null
                    && donation.getTitle() != null && donation.getDonationDate() != null) {
                activities.add(RecentActivityDto.builder()
                        .type("donation")
                        .userInitial(donor.getFirstName().substring(0, 1).toUpperCase())
                        .userName(donor.getFirstName() + " " + donor.getLastName())
                        .action("donó")
                        .itemName(donation.getTitle())
                        .createdAt(donation.getDonationDate())
                        .timeAgo(calculateTimeAgo(donation.getDonationDate()))
                        .build());
            }
        }

        // Obtener intercambios recientes
        List<Exchange> recentExchanges = exchangeRepository.findRecentExchanges(pageable);

        for (Exchange exchange : recentExchanges) {
            User requester = exchange.getRequester();
            if (requester != null && requester.getFirstName() != null && requester.getLastName() != null
                    && exchange.getRequestedProduct() != null && exchange.getRequestedProduct().getProductName() != null
                    && exchange.getRequestedAt() != null) {
                activities.add(RecentActivityDto.builder()
                        .type("exchange")
                        .userInitial(requester.getFirstName().substring(0, 1).toUpperCase())
                        .userName(requester.getFirstName() + " " + requester.getLastName())
                        .action("intercambió")
                        .itemName(exchange.getRequestedProduct().getProductName())
                        .createdAt(exchange.getRequestedAt())
                        .timeAgo(calculateTimeAgo(exchange.getRequestedAt()))
                        .build());
            }
        }

        // Obtener nuevos usuarios
        List<User> newUsers = userRepository.findRecentUsers(pageable);

        for (User user : newUsers) {
            if (user.getJoinedAt() != null && user.getFirstName() != null && user.getLastName() != null) {
                activities.add(RecentActivityDto.builder()
                        .type("user_joined")
                        .userInitial(user.getFirstName().substring(0, 1).toUpperCase())
                        .userName(user.getFirstName() + " " + user.getLastName())
                        .action("se unió a")
                        .itemName("Greenloop")
                        .createdAt(user.getJoinedAt().toLocalDateTime())
                        .timeAgo(calculateTimeAgo(user.getJoinedAt().toLocalDateTime()))
                        .build());
            }
        }

        // Ordenar por fecha y limitar
        return activities.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getWasteImpact() {
        Map<String, Object> impact = new HashMap<>();

        Double totalWasteAvoided = calculateWasteAvoided();
        Long totalItemsCirculated = exchangeRepository.count() + donationRepository.count();

        // Estimaciones de impacto ambiental
        Double co2Saved = totalWasteAvoided * 0.5; // Aproximadamente 0.5kg CO2 por kg de residuo evitado
        Double waterSaved = totalWasteAvoided * 2.5; // Aproximadamente 2.5L agua por kg

        impact.put("wasteAvoided", totalWasteAvoided);
        impact.put("itemsCirculated", totalItemsCirculated);
        impact.put("co2Saved", co2Saved);
        impact.put("waterSaved", waterSaved);
        impact.put("treesEquivalent", Math.round(co2Saved / 21)); // 1 árbol absorbe ~21kg CO2/año

        return impact;
    }

    public Map<String, Object> getGrowthTrends() {
        Map<String, Object> trends = new HashMap<>();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastMonth = now.minus(1, ChronoUnit.MONTHS);
        LocalDateTime twoMonthsAgo = now.minus(2, ChronoUnit.MONTHS);

        // Convertir a ZonedDateTime para user repository
        ZonedDateTime nowZoned = now.atZone(ZoneId.systemDefault());
        ZonedDateTime lastMonthZoned = lastMonth.atZone(ZoneId.systemDefault());
        ZonedDateTime twoMonthsAgoZoned = twoMonthsAgo.atZone(ZoneId.systemDefault());

        // Usuarios
        Long usersThisMonth = userRepository.countByCreatedAtBetween(lastMonthZoned, nowZoned);
        Long usersLastMonth = userRepository.countByCreatedAtBetween(twoMonthsAgoZoned, lastMonthZoned);
        Double userGrowth = calculatePercentageChange(usersLastMonth, usersThisMonth);

        // Intercambios
        Long exchangesThisMonth = exchangeRepository.countByCreatedAtBetween(lastMonth, now);
        Long exchangesLastMonth = exchangeRepository.countByCreatedAtBetween(twoMonthsAgo, lastMonth);
        Double exchangeGrowth = calculatePercentageChange(exchangesLastMonth, exchangesThisMonth);

        // Donaciones
        Long donationsThisMonth = donationRepository.countByCreatedAtBetween(lastMonth, now);
        Long donationsLastMonth = donationRepository.countByCreatedAtBetween(twoMonthsAgo, lastMonth);
        Double donationGrowth = calculatePercentageChange(donationsLastMonth, donationsThisMonth);

        trends.put("userGrowth", userGrowth);
        trends.put("exchangeGrowth", exchangeGrowth);
        trends.put("donationGrowth", donationGrowth);
        trends.put("overallGrowth", (userGrowth + exchangeGrowth + donationGrowth) / 3);

        return trends;
    }

    private Double calculateWasteAvoided() {
        // Estimar peso promedio por categoría (en kg)
        Map<String, Double> categoryWeights = Map.of(
                "Muebles", 15.0,
                "Electrodomésticos", 8.0,
                "Ropa", 0.5,
                "Libros", 0.3,
                "Juguetes", 0.8,
                "Electrónica", 2.0);

        Double totalWeight = 0.0;
        List<Product> allProducts = productRepository.findAll();

        for (Product product : allProducts) {
            String category = product.getCategory() != null ? product.getCategory().toString() : "Otros";
            Double weight = categoryWeights.getOrDefault(category, 1.0);
            totalWeight += weight;
        }

        return totalWeight;
    }

    private Double calculateGrowthPercentage() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastMonth = now.minus(1, ChronoUnit.MONTHS);
        LocalDateTime twoMonthsAgo = now.minus(2, ChronoUnit.MONTHS);

        Long activitiesThisMonth = exchangeRepository.countByCreatedAtBetween(lastMonth, now) +
                donationRepository.countByCreatedAtBetween(lastMonth, now);

        Long activitiesLastMonth = exchangeRepository.countByCreatedAtBetween(twoMonthsAgo, lastMonth) +
                donationRepository.countByCreatedAtBetween(twoMonthsAgo, lastMonth);

        return calculatePercentageChange(activitiesLastMonth, activitiesThisMonth);
    }

    private Double calculatePercentageChange(Long oldValue, Long newValue) {
        if (oldValue == 0) {
            return newValue > 0 ? 100.0 : 0.0;
        }
        return ((double) (newValue - oldValue) / oldValue) * 100;
    }

    private String calculateTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long hours = ChronoUnit.HOURS.between(dateTime, now);

        if (hours < 1) {
            return "hace menos de 1 hora";
        } else if (hours < 24) {
            return "hace " + hours + " hora" + (hours > 1 ? "s" : "");
        } else {
            long days = ChronoUnit.DAYS.between(dateTime, now);
            return "hace " + days + " día" + (days > 1 ? "s" : "");
        }
    }
}
