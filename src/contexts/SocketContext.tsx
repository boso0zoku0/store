import {createContext, useContext, useEffect, useRef, ReactNode, useState, MutableRefObject} from 'react';
import { useAuth } from './AuthContexts.tsx';

interface WebSocketContextType {
  wsRef: React.MutableRefObject<WebSocket | null>;
  sendMessage: (data: any) => void;
  isConnected: boolean;
  message: Message
}
interface Message {
  username: string;
  url_id: string;
  product_name: string;
  type?: string;
}
const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const hasSentRef = useRef(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.url_id) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    const wsUrl = `wss://store-backend.cloudpub.ru/notify?url_id=${user.url_id}`;

    const websocket = new WebSocket(wsUrl);
    wsRef.current = websocket;

    websocket.onopen = () => {
      setIsConnected(true);
      if (user.product_name && !hasSentRef.current) {
        const message = {
          type: "notify_manager",
          username: user.name,
          url_id: user.url_id,
          product_name: user.product_name,
        };
        websocket.send(JSON.stringify(message));
        hasSentRef.current = true;
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 Получено уведомление:', data);
      setMessage(data)
    };

    websocket.onclose = () => {
      console.log('🔒 WebSocket закрыт');
      setIsConnected(false);
      wsRef.current = null;
    };

    websocket.onerror = (error) => {
      console.error('❌ WebSocket ошибка:', error);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [isAuthenticated, user?.url_id]); // ← только эти зависимости

  const sendMessage = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      console.log('📤 Отправлено:', data);
    } else {
      console.warn('⚠️ WebSocket не открыт');
    }
  };

  return (
    <WebSocketContext.Provider value={{ wsRef, sendMessage, message, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};