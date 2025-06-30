import React from "react";
import type { Exchange } from "../types/exchange";

interface ExchangeCardProps {
  exchange: Exchange;
  isProvider: boolean;
  onAction: (
    exchangeId: number,
    action: "accept" | "reject" | "complete" | "cancel"
  ) => void;
}

const ExchangeCard: React.FC<ExchangeCardProps> = ({
  exchange,
  isProvider,
  onAction,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "ACCEPTED":
        return "Aceptado";
      case "COMPLETED":
        return "Completado";
      case "REJECTED":
        return "Rechazado";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  const canAccept = isProvider && exchange.status === "PENDING";
  const canReject = isProvider && exchange.status === "PENDING";
  const canComplete =
    (isProvider || !isProvider) && exchange.status === "ACCEPTED";
  const canCancel =
    !isProvider &&
    (exchange.status === "PENDING" || exchange.status === "ACCEPTED");

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            exchange.status
          )}`}
        >
          {getStatusText(exchange.status)}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(exchange.requestedAt).toLocaleDateString("es-ES")}
        </span>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">
          {isProvider ? "Solicitado por:" : "Solicitado a:"}
        </div>
        <div className="font-medium text-gray-900">
          {isProvider ? exchange.requesterName : exchange.providerName}
        </div>
      </div>

      {/* Products Exchange */}
      <div className="space-y-4 mb-6">
        {/* Requested Product */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <img
              src={exchange.requestedProductImage}
              alt={exchange.requestedProductName}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {exchange.requestedProductName}
              </div>
              <div className="text-xs text-gray-500">
                {isProvider ? "Tu producto" : "Producto solicitado"}
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Arrow */}
        <div className="flex justify-center">
          <div className="text-gray-400">↕️</div>
        </div>

        {/* Offered Product */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <img
              src={exchange.offeredProductImage}
              alt={exchange.offeredProductName}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {exchange.offeredProductName}
              </div>
              <div className="text-xs text-gray-500">
                {isProvider ? "Producto ofrecido" : "Tu producto"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {canAccept && (
          <button
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            onClick={() => onAction(exchange.exchangeId, "accept")}
          >
            Aceptar
          </button>
        )}
        {canReject && (
          <button
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            onClick={() => onAction(exchange.exchangeId, "reject")}
          >
            Rechazar
          </button>
        )}
        {canComplete && (
          <button
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => onAction(exchange.exchangeId, "complete")}
          >
            Completar
          </button>
        )}
        {canCancel && (
          <button
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            onClick={() => onAction(exchange.exchangeId, "cancel")}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default ExchangeCard;
