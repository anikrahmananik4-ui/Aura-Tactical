export interface WalkieUser {
  id: string;
  codename: string;
  isSpeaking: boolean;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  type: "system" | "status" | "info" | "error" | "chat";
  codename?: string;
  message: string;
  timestamp: Date;
  file?: {
    name: string;
    type: string;
    size: number;
    data: string;
  };
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
