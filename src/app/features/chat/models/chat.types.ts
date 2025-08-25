export interface AIChatMessage {
  id: string;
  message: string;
  hallIds: number[];
  timestamp: Date;
  type: 'user' | 'assistant';
}

export interface AIChatRequest {
  message: string;
  hallIds: number[];
}

export interface AIChatResponse {
  explanation: string;
  url: string;
}

export interface Hall {
  id: number;
  name: string;
}
