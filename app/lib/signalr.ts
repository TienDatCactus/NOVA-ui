import * as signalR from "@microsoft/signalr";
import { getStorage } from "~/lib/storage";
import STORAGE from "~/lib/storage";

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: "Guest" | "Staff" | "System";
  message: string;
  staffUserId: string | null;
  staffName: string | null;
  createdAt: string;
  // Read status fields
  isRead?: boolean;
  readAt?: string | null;
  readBy?: string | null;
  // Translation fields
  translatedText?: string;
  detectedLanguage?: string;
  showTranslation?: boolean;
  isTranslating?: boolean;
  isDetecting?: boolean;
}

export interface SendMessageCommand {
  sessionId: string;
  message: string;
  sender: "Guest" | "Staff" | "System";
  staffUserId?: string;
}

class SignalRChatService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(chatUrl: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log("[SignalR] Already connected");
      return;
    }

    const token = getStorage(STORAGE.TOKEN);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${chatUrl}`, {
        accessTokenFactory: () => token || "",
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
            return null; // Stop reconnecting
          }
          return Math.min(
            1000 * Math.pow(2, retryContext.previousRetryCount),
            30000
          );
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Connection lifecycle events
    this.connection.onclose((error) => {
      console.error("[SignalR] Connection closed", error);
    });

    this.connection.onreconnecting((error) => {
      console.warn("[SignalR] Reconnecting...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("[SignalR] Reconnected successfully", connectionId);
      this.reconnectAttempts = 0;
    });

    try {
      await this.connection.start();
      console.log("[SignalR] Connected successfully");
    } catch (error) {
      console.error("[SignalR] Connection failed", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log("[SignalR] Disconnected");
    }
  }

  // Hub method: Join a chat session
  async joinSession(sessionId: string): Promise<void> {
    if (!this.connection) throw new Error("Not connected to SignalR");
    await this.connection.invoke("JoinSession", sessionId);
    console.log(`[SignalR] Joined session: ${sessionId}`);
  }

  // Hub method: Leave a chat session
  async leaveSession(sessionId: string): Promise<void> {
    if (!this.connection) throw new Error("Not connected to SignalR");
    await this.connection.invoke("LeaveSession", sessionId);
    console.log(`[SignalR] Left session: ${sessionId}`);
  }

  // Hub method: Send message
  async sendMessage(command: SendMessageCommand): Promise<void> {
    if (!this.connection) throw new Error("Not connected to SignalR");
    await this.connection.invoke("SendMessage", command);
  }

  // Hub method: Send typing indicator
  async sendTyping(sessionId: string, sender: string): Promise<void> {
    if (!this.connection) throw new Error("Not connected to SignalR");
    await this.connection.invoke("SendTyping", sessionId, sender);
  }

  // Hub method: Stop typing indicator
  async stopTyping(sessionId: string, sender: string): Promise<void> {
    if (!this.connection) throw new Error("Not connected to SignalR");
    await this.connection.invoke("StopTyping", sessionId, sender);
  }

  // Event listeners
  onReceiveMessage(handler: (message: ChatMessage) => void): void {
    this.connection?.on("ReceiveMessage", handler);
  }

  onUserTyping(
    handler: (data: { sender: string; timestamp: string }) => void
  ): void {
    this.connection?.on("UserTyping", handler);
  }

  onUserStoppedTyping(
    handler: (data: { sender: string; timestamp: string }) => void
  ): void {
    this.connection?.on("UserStoppedTyping", handler);
  }

  // Cleanup listeners
  off(eventName: string, handler: (...args: any[]) => void): void {
    this.connection?.off(eventName, handler);
  }

  offAll(eventName: string): void {
    this.connection?.off(eventName);
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  getState(): signalR.HubConnectionState {
    return this.connection?.state || signalR.HubConnectionState.Disconnected;
  }
}

export const signalRChatService = new SignalRChatService();
