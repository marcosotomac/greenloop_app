import React from "react";
import type { ExchangeStatistics } from "../types/exchange";

interface ExchangeStatsProps {
  statistics: ExchangeStatistics;
}

const ExchangeStats: React.FC<ExchangeStatsProps> = ({ statistics }) => {
  const stats = [
    {
      name: "Total Intercambios",
      value: statistics.totalExchanges,
      icon: "📦",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Pendientes",
      value: statistics.pendingExchanges,
      icon: "⏳",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      name: "Completados",
      value: statistics.completedExchanges,
      icon: "✅",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Puntos Ganados",
      value: statistics.pointsEarnedFromExchanges,
      icon: "⭐",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className={`${stat.bgColor} rounded-lg p-6 border border-opacity-20`}
        >
          <div className="flex items-center">
            <div className="text-2xl mr-3">{stat.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExchangeStats;
