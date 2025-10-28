/**
 * Client HTTP générique pour communiquer avec les APIs
 */

interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
}

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  constructor(baseUrl: string = import.meta.env.VITE_PRIVATE_API_URL || "http://localhost:3001") {
    this.baseUrl = baseUrl;
  }

  /**
   * Effectue une requête HTTP
   */
  private async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl).toString();
    const {
      method = "GET",
      headers = {},
      body = undefined,
      credentials = "include",
    } = config;

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        credentials,
      };

      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      const data = await response.json();

      return {
        data: data as T,
        status: response.status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      return {
        error: errorMessage,
        status: 0,
      };
    }
  }

  /**
   * Requête GET
   */
  async get<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  /**
   * Requête POST
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, headers });
  }

  /**
   * Requête PUT
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, headers });
  }

  /**
   * Requête DELETE
   */
  async delete<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }

  /**
   * Requête PATCH
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PATCH", body, headers });
  }
}

// Instance partagée
export const apiClient = new ApiClient();

/**
 * Client WebSocket pour les mises à jour en temps réel
 */
export class RealtimeClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(url: string = (import.meta.env.VITE_PRIVATE_API_WS || "ws://localhost:3001").replace(/^http/, "ws")) {
    this.url = url;
  }

  /**
   * Se connecte au serveur WebSocket
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("✅ WebSocket connected");
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const { type, data } = message;

            if (type && this.listeners.has(type)) {
              const typeListeners = this.listeners.get(type);
              if (typeListeners) {
                for (const callback of typeListeners) {
                  callback(data);
                }
              }
            }
          } catch (err) {
            console.error("Erreur en parsant le message WebSocket:", err);
          }
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("🔌 WebSocket disconnected");
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Tente de se reconnecter automatiquement
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * (2 ** (this.reconnectAttempts - 1));
      console.log(`🔄 Tentative de reconnexion dans ${delay}ms...`);

      setTimeout(() => {
        this.connect().catch((err) => {
          console.error("Erreur lors de la reconnexion:", err);
        });
      }, delay);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  /**
   * S'abonne aux mises à jour d'un type
   */
  subscribe(type: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)?.add(callback);

    // Retourner une fonction de désinscription
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  /**
   * Envoie un message au serveur
   */
  send(type: string, data?: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn("❌ WebSocket not connected");
    }
  }

  /**
   * Se déconnecte
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Vérifie si connecté
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Instance partagée
export const realtimeClient = new RealtimeClient();
