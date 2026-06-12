// В некоторых ?: полях, такой знак потому что не все типы ответов с бэка по websocket возвращают этот набор данных
export interface ClientMessage {
  id: string;
  message: string;
  operator: string;
  client?: string;
  from_user_id?: string;
  to_user_id?: string;
  is_resolved?: string;
  created_at: Date;
  isOwn: boolean;
  isButton?: boolean;
  type: string;
  file_url?: string;
  file_name?: string;
  file_size?: string;
  mime_type?: string
}

export interface ClientPanelProps {
  isOpen: boolean;
  clientName: string;
  onClose: () => void;
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