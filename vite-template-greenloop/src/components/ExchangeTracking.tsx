import React, { useState, useEffect } from "react";
import type { Exchange } from "../types/exchange";

interface ExchangeTrackingProps {
  exchange: Exchange;
  onUpdate?: () => void;
}

const ExchangeTracking: React.FC<ExchangeTrackingProps> = ({
  exchange,
  onUpdate,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    // Calculate time since request for pending exchanges
    if (exchange.status === "PENDING") {
      const interval = setInterval(() => {
        const requestedTime = new Date(exchange.requestedAt).getTime();
        const now = new Date().getTime();
        const diff = now - requestedTime;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeRemaining(`${hours}h ${minutes}m ago`);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [exchange]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "⏳";
      case "ACCEPTED":
        return "✅";
      case "COMPLETED":
        return "🎉";
      case "REJECTED":
        return "❌";
      case "CANCELLED":
        return "🚫";
      default:
        return "📦";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Esperando respuesta del propietario";
      case "ACCEPTED":
        return "¡Intercambio aceptado! Coordinen los detalles";
      case "COMPLETED":
        return "Intercambio completado exitosamente";
      case "REJECTED":
        return "Solicitud de intercambio rechazada";
      case "CANCELLED":
        return "Intercambio cancelado";
      default:
        return "Estado desconocido";
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "PENDING":
        return 25;
      case "ACCEPTED":
        return 75;
      case "COMPLETED":
        return 100;
      case "REJECTED":
      case "CANCELLED":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStatusIcon(exchange.status)}</span>
          <div>
            <h3 className="font-medium text-gray-900">
              Intercambio #{exchange.exchangeId}
            </h3>
            <p className="text-sm text-gray-500">
              {getStatusMessage(exchange.status)}
            </p>
          </div>
        </div>
        {exchange.status === "PENDING" && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Solicitado</p>
            <p className="text-sm font-medium text-gray-600">{timeRemaining}</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progreso</span>
          <span>{getProgressPercentage(exchange.status)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              exchange.status === "COMPLETED"
                ? "bg-green-500"
                : exchange.status === "REJECTED" ||
                    exchange.status === "CANCELLED"
                  ? "bg-red-500"
                  : "bg-blue-500"
            }`}
            style={{ width: `${getProgressPercentage(exchange.status)}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              Solicitud enviada
            </p>
            <p className="text-xs text-gray-500">
              {new Date(exchange.requestedAt).toLocaleString("es-ES")}
            </p>
          </div>
        </div>

        {exchange.status !== "PENDING" && (
          <div className="flex items-center space-x-3">
            <div
              className={`w-2 h-2 rounded-full ${
                exchange.status === "ACCEPTED" ||
                exchange.status === "COMPLETED"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {exchange.status === "ACCEPTED" ||
                exchange.status === "COMPLETED"
                  ? "Solicitud aceptada"
                  : exchange.status === "REJECTED"
                    ? "Solicitud rechazada"
                    : "Intercambio cancelado"}
              </p>
              <p className="text-xs text-gray-500">
                {/* Add timestamp when status changed */}
                Hace unos momentos
              </p>
            </div>
          </div>
        )}

        {exchange.status === "COMPLETED" && exchange.completedAt && (
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Intercambio completado
              </p>
              <p className="text-xs text-gray-500">
                {new Date(exchange.completedAt).toLocaleString("es-ES")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Participants Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">
              SOLICITANTE
            </p>
            <p className="text-sm font-medium text-gray-900">
              {exchange.requesterName}
            </p>
            <p className="text-xs text-gray-500">
              {exchange.offeredProductName}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">PROVEEDOR</p>
            <p className="text-sm font-medium text-gray-900">
              {exchange.providerName}
            </p>
            <p className="text-xs text-gray-500">
              {exchange.requestedProductName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeTracking;
