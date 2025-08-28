
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
  conversationId?: number;
}

export interface AIChatResponse {
  explanation: string;
  url: string;
}

export interface EnhancedAIChatResponse extends AIChatResponse {
  conversationId?: number;
  streamUrl?: string;
  messageId?: string;
}

export interface Hall {
  id: number;
  name: string;
  description?: string;
}

export interface ChatDisplayMessage extends AIChatMessage {
  isLoading?: boolean;
  chartUrl?: any;
  error?: string;
  isStreaming?: boolean;
  streamingContent?: string;
  status?: MessageStatus;
}

export interface Conversation {
  id: number;
  created_at: string;
  topic: string;
  lastMessageAt: string;
  hall?: Hall;
  created_by: {
    id: number;
    name: string;
  };
  updated_by: {
    id: number;
    name: string;
  };
  updated_at: string;
}

export interface ApiMessage {
  id: number;
  created_at: string;
  updated_at: string;
  user: string;
  assistant: string;
}

export interface ConversationResponse {
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
}

export interface MessagesResponse {
  data: ApiMessage[];
  total: number;
  page: number;
  limit: number;
}

export interface StreamingEventData {
  type: 'content' | 'delta' | 'done' | 'complete' | 'error';
  content?: string;
  delta?: string;
  error?: string;
  messageId?: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: number | null;
  messages: ChatDisplayMessage[];
  isLoading: boolean;
  error: string | null;
}
