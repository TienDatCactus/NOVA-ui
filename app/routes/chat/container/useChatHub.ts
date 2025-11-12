import { useEffect, useRef, useState, useCallback } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import {
  ChatHubConnection,
  type ChatHubEventHandlers,
} from "~/lib/signalr-chat";
import type {
  SignalRMessageEventDto,
  SignalRTypingEventDto,
  SendMessageRequestDto,
} from "~/services/api/chat/dto";

export interface UseChatHubOptions {
  sessionId?: string;
  autoConnect?: boolean;
  onReceiveMessage?: (message: SignalRMessageEventDto) => void;
  onUserTyping?: (event: SignalRTypingEventDto) => void;
  onError?: (error: Error) => void;
}

export function useChatHub({
  sessionId,
  autoConnect = true,
  onReceiveMessage,
  onUserTyping,
  onError,
}: UseChatHubOptions = {}) {
  const hubRef = useRef<ChatHubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize hub connection
  useEffect(() => {
    if (!hubRef.current) {
      hubRef.current = new ChatHubConnection();
    }

    return () => {
      // Cleanup on unmount
      hubRef.current?.stop();
      hubRef.current = null;
    };
  }, []);

  // Connect to hub
  const connect = useCallback(async () => {
    if (!hubRef.current) return;

    if (
      hubRef.current.getState() === HubConnectionState.Connected ||
      isConnecting
    ) {
      console.warn("Already connected or connecting");
      return;
    }

    setIsConnecting(true);
    setError(null);

    const eventHandlers: ChatHubEventHandlers = {
      onReceiveMessage: (message) => {
        console.log("Message received in hook:", message);
        onReceiveMessage?.(message);
      },
      onUserTyping: (event) => {
        console.log("User typing in hook:", event);
        onUserTyping?.(event);
      },
      onConnectionStateChanged: (state) => {
        console.log("Connection state changed:", state);
        setConnectionState(state);
      },
      onError: (err) => {
        console.error("Hub error:", err);
        setError(err);
        onError?.(err);
      },
    };

    try {
      await hubRef.current.start(eventHandlers);
      setConnectionState(HubConnectionState.Connected);
    } catch (err) {
      console.error("Failed to connect:", err);
      setError(err as Error);
      setConnectionState(HubConnectionState.Disconnected);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, onReceiveMessage, onUserTyping, onError]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, connect]);

  // Join session when sessionId changes
  useEffect(() => {
    if (
      sessionId &&
      hubRef.current?.getState() === HubConnectionState.Connected
    ) {
      hubRef.current
        .joinSession(sessionId)
        .catch((err) => console.error("Error joining session:", err));
    }
  }, [sessionId]);

  // Send message
  const sendMessage = useCallback(async (data: SendMessageRequestDto) => {
    if (!hubRef.current) {
      throw new Error("Hub not initialized");
    }

    if (hubRef.current.getState() !== HubConnectionState.Connected) {
      throw new Error("Hub not connected");
    }

    try {
      await hubRef.current.sendMessage(data);
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback(
    async (sessionId: string, sender: "Guest" | "Staff") => {
      if (!hubRef.current) return;

      try {
        await hubRef.current.sendTyping(sessionId, sender);
      } catch (err) {
        console.error("Error sending typing:", err);
        // Don't throw - typing is non-critical
      }
    },
    []
  );

  // Disconnect
  const disconnect = useCallback(async () => {
    if (!hubRef.current) return;

    try {
      await hubRef.current.stop();
      setConnectionState(HubConnectionState.Disconnected);
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  }, []);

  return {
    connectionState,
    isConnected: connectionState === HubConnectionState.Connected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
  };
}
