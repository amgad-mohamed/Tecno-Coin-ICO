import { useState, useEffect } from "react";

export interface Timer {
  _id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  type: "ICO" | "STAKING" | "GENERAL";
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimerData {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: "ICO" | "STAKING" | "GENERAL";
  metadata?: Record<string, any>;
}

export interface UpdateTimerData {
  id: string;
  name?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
  type?: "ICO" | "STAKING" | "GENERAL";
  metadata?: Record<string, any>;
}

export function useTimers() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimers = async (filters?: {
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.isActive !== undefined) params.append("isActive", filters.isActive.toString());
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/timers?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch timers");
      }
      const data = await response.json();
      setTimers(data.timers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch timers");
    } finally {
      setLoading(false);
    }
  };

  const createTimer = async (timerData: CreateTimerData): Promise<Timer | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/timers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create timer");
      }

      const newTimer = await response.json();
      setTimers(prev => [newTimer, ...prev]);
      return newTimer;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create timer");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTimer = async (timerData: UpdateTimerData): Promise<Timer | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/timers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update timer");
      }

      const updatedTimer = await response.json();
      setTimers(prev => prev.map(timer => 
        timer._id === updatedTimer._id ? updatedTimer : timer
      ));
      return updatedTimer;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update timer");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTimer = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/timers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete timer");
      }

      setTimers(prev => prev.filter(timer => timer._id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete timer");
      return false;
    } finally {
      setLoading(false);
    }
  };

    const toggleTimerStatus = async (id: string, isActive: boolean): Promise<boolean> => {
      const updated = await updateTimer({ id, isActive });
      return updated !== null;
    };

  return {
    timers,
    loading,
    error,
    fetchTimers,
    createTimer,
    updateTimer,
    deleteTimer,
    toggleTimerStatus,
  };
} 