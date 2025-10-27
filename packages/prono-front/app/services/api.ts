/**
 * API Client pour communiquer avec prono-api
 * Gère les requêtes HTTP et la synchronisation temps réel
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001/ws";

// Types de réponse API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Client HTTP
export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }

    return data.data || ({} as T);
  },

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }

    return data.data || ({} as T);
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }

    return data.data || ({} as T);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }

    return data.data || ({} as T);
  },
};

// WebSocket pour les updates temps réel
export class RealtimeClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const message = JSON.parse(event.data);
            const { type, data } = message;

            if (type && this.listeners.has(type)) {
              const callbacks = this.listeners.get(type);
              if (callbacks) {
                for (const listener of callbacks) {
                  listener(data);
                }
              }
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts += 1;
      const delay = this.reconnectDelay * (2 ** (this.reconnectAttempts - 1));
      console.log(
        `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
      );
      setTimeout(() => this.connect().catch(console.error), delay);
    }
  }

  subscribe(eventType: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.add(callback);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  send(type: string, data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn("WebSocket not connected");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Instance singleton
export const realtimeClient = new RealtimeClient();

// API Endpoints
export const endpoints = {
  // Matches
  matches: "/matches",
  matchById: (id: string) => `/matches/${id}`,
  updateMatch: (id: string) => `/matches/${id}`,

  // Predictions
  predictions: "/predictions",
  predictionById: (id: string) => `/predictions/${id}`,
  createPrediction: "/predictions",
  updatePrediction: (id: string) => `/predictions/${id}`,

  // Groups
  groups: "/groups",
  groupById: (id: string) => `/groups/${id}`,
  groupLeaderboard: (id: string) => `/groups/${id}/leaderboard`,

  // Users
  users: "/users",
  userById: (id: string) => `/users/${id}`,
  currentUser: "/users/me",

  // Scores
  updateScore: (matchId: string) => `/matches/${matchId}/score`,
};
