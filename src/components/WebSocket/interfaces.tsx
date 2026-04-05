export interface ClientMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  username: string;
  timestamp: Date;
  isOwn: boolean;
  isButton?: boolean;
  type?: string; // 'system', 'bot', 'OperatorHelper', 'client', 'media'
  file_url?: string;
  file_name?: string;
  file_size?: string;
  mime_type?: string
}

export interface ClientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ws: WebSocket

}








export interface OperatorMessage {
  id: string;
  message: string;
  username: string;
  timestamp: Date;
  is_own: boolean;
  type?: string,
  file_url?: string,
  mime_type?: string,
}

export interface Client {
  username: string;
  isActive: boolean;
  unreadCount: number;
}

export interface OperatorPanelProps {
  operatorName: string;
  isOpen: boolean;
  onClose: () => void;
}