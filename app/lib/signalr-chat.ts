import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import type {
  SignalRMessageEventDto,
  SignalRTypingEventDto,
  SendMessageRequestDto,
} from "~/services/api/chat/dto";

const CHAT_HUB_URL = "/hubs/chat";

export type ChatHubEventHandlers = {
  onReceiveMessage?: (message: SignalRMessageEventDto) => void;
  onUserTyping?: (event: SignalRTypingEventDto) => void;
  onConnectionStateChanged?: (state: HubConnectionState) => void;
  onError?: (error: Error) => void;
};

export class ChatHubConnection {
  private connection: HubConnection | null = null;
  private eventHandlers: ChatHubEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private baseUrl: string = "") {
    this.baseUrl = baseUrl || import.meta.env.VITE_API_BASE_URL || "";
  }

  /**
   * Initialize and start the SignalR connection
   */
  async start(eventHandlers: ChatHubEventHandlers): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      console.warn("ChatHub already connected");
      return;
    }

    this.eventHandlers = eventHandlers;

    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}${CHAT_HUB_URL}`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s
          const delay = Math.min(
            2000 * Math.pow(2, retryContext.previousRetryCount),
            32000
          );
          return delay;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Register event handlers
    this.registerEventHandlers();

    // Connection state management
    this.connection.onreconnecting(() => {
      console.log("ChatHub reconnecting...");
      this.eventHandlers.onConnectionStateChanged?.(
        HubConnectionState.Reconnecting
      );
    });

    this.connection.onreconnected(() => {
      console.log("ChatHub reconnected");
      this.reconnectAttempts = 0;
      this.eventHandlers.onConnectionStateChanged?.(
        HubConnectionState.Connected
      );
    });

    this.connection.onclose((error) => {
      console.error("ChatHub connection closed:", error);
      this.eventHandlers.onConnectionStateChanged?.(
        HubConnectionState.Disconnected
      );
      if (error) {
        this.eventHandlers.onError?.(error);
      }
      // Attempt manual reconnect if auto-reconnect fails
      this.attemptManualReconnect();
    });

    try {
      await this.connection.start();
      console.log("ChatHub connected successfully");
      this.eventHandlers.onConnectionStateChanged?.(
        HubConnectionState.Connected
      );
    } catch (error) {
      console.error("Error starting ChatHub:", error);
      this.eventHandlers.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Register SignalR event handlers
   */
  private registerEventHandlers(): void {
    if (!this.connection) return;

    // ReceiveMessage event
    this.connection.on("ReceiveMessage", (message: SignalRMessageEventDto) => {
      console.log("Received message:", message);
      this.eventHandlers.onReceiveMessage?.(message);
    });

    // UserTyping event
    this.connection.on("UserTyping", (event: SignalRTypingEventDto) => {
      console.log("User typing:", event);
      this.eventHandlers.onUserTyping?.(event);
    });
  }

  /**
   * Join a chat session
   */
  async joinSession(sessionId: string): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== HubConnectionState.Connected
    ) {
      throw new Error("ChatHub not connected");
    }

    try {
      await this.connection.invoke("JoinSession", sessionId);
      console.log(`Joined session: ${sessionId}`);
    } catch (error) {
      console.error("Error joining session:", error);
      throw error;
    }
  }

  /**
   * Send a message via SignalR
   */
  async sendMessage(data: SendMessageRequestDto): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== HubConnectionState.Connected
    ) {
      throw new Error("ChatHub not connected");
    }

    try {
      await this.connection.invoke("SendMessage", {
        sessionId: data.sessionId,
        message: data.message,
        sender: data.sender,
      });
      console.log("Message sent via SignalR:", data);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTyping(
    sessionId: string,
    sender: "Guest" | "Staff"
  ): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== HubConnectionState.Connected
    ) {
      console.warn("ChatHub not connected, skipping typing indicator");
      return;
    }

    try {
      await this.connection.invoke("SendTyping", sessionId, sender);
    } catch (error) {
      console.error("Error sending typing indicator:", error);
      // Don't throw - typing is non-critical
    }
  }

  /**
   * Stop the connection
   */
  async stop(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
      console.log("ChatHub stopped");
    } catch (error) {
      console.error("Error stopping ChatHub:", error);
    } finally {
      this.connection = null;
    }
  }

  /**
   * Get current connection state
   */
  getState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }

  /**
   * Attempt manual reconnection with exponential backoff
   */
  private async attemptManualReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      2000 * Math.pow(2, this.reconnectAttempts - 1),
      32000
    );
    console.log(
      `Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(async () => {
      try {
        await this.connection?.start();
        console.log("Manual reconnect successful");
        this.reconnectAttempts = 0;
        this.eventHandlers.onConnectionStateChanged?.(
          HubConnectionState.Connected
        );
      } catch (error) {
        console.error("Manual reconnect failed:", error);
        this.attemptManualReconnect();
      }
    }, delay);
  }
}
