import { useState, useEffect } from "react";
import { exchangeService } from "../services/exchangeService";
import type { Exchange, ExchangeStatistics } from "../types/exchange";

export const useExchanges = () => {
  const [requestedExchanges, setRequestedExchanges] = useState<Exchange[]>([]);
  const [providedExchanges, setProvidedExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExchanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const [requested, provided] = await Promise.all([
        exchangeService.getRequestedExchanges(),
        exchangeService.getProvidedExchanges(),
      ]);
      setRequestedExchanges(requested);
      setProvidedExchanges(provided);
    } catch (err) {
      setError("Error loading exchanges");
      console.error("Error loading exchanges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExchanges();
  }, []);

  const performAction = async (
    exchangeId: number,
    action: "accept" | "reject" | "complete" | "cancel"
  ) => {
    try {
      setError(null);
      switch (action) {
        case "accept":
          await exchangeService.acceptExchange(exchangeId);
          break;
        case "reject":
          await exchangeService.rejectExchange(exchangeId);
          break;
        case "complete":
          await exchangeService.completeExchange(exchangeId);
          break;
        case "cancel":
          await exchangeService.cancelExchange(exchangeId);
          break;
      }
      await loadExchanges();
    } catch (err) {
      setError(`Error performing ${action}`);
      console.error(`Error performing ${action}:`, err);
    }
  };

  return {
    requestedExchanges,
    providedExchanges,
    loading,
    error,
    loadExchanges,
    performAction,
  };
};

export const useExchangeStatistics = () => {
  const [statistics, setStatistics] = useState<ExchangeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await exchangeService.getExchangeStatistics();
      setStatistics(stats);
    } catch (err) {
      setError("Error loading statistics");
      console.error("Error loading statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    loadStatistics,
  };
};
