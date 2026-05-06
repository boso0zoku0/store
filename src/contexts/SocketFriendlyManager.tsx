import {createContext, useContext, useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useAuth} from "./AuthContexts.tsx";

interface Message {
  id: string;
  from_user: string;
  sender: string;
  message: string;
  to_user: string;
  recipient: string;
  timestamp: Date;
  isOwn: boolean;
  type?: string; // 'bot', 'client'
}


interface TypeContext {
  wsRef: React.MutableRefObject<WebSocket | null>;
  sendMessage: (data: any) => void;
  messages: Message[];
  isConnected: boolean;
}

const WsFriendlyContext = createContext<TypeContext | null>(null)
export default function WSFriendlyProvider({children}) {
  const {user, isAuthenticated} = useAuth();
  const {url_id} = useParams()
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[] | null>([])
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.url_id) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {return;}
    const websocket = new WebSocket(`wss://store-backend.cloudpub.ru/friendly/dialog?url_id=${user.url_id}`)
    websocket.onopen = () => {
      setIsConnected(true)
    }
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const newMessage = {
        sender: data.sender,
        recipient: data.recipient,
        message: data.message,
        isOwn: false,
        timestamp: new Date(),

      }
      setMessages(prevState => [...prevState, newMessage])
    }
    websocket.onerror = (error) => {
      console.error('WebSocket Friendly ошибка:', error);
      setIsConnected(false);
    };

    websocket.onclose = () => {
      console.log('WebSocket Friendly отключен но продолжает жить');
    };
    wsRef.current = websocket

  }, [url_id, isAuthenticated]);
  const sendMessage = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      console.log('📤 Отправлено:', data);
    } else {
      console.warn('⚠️ WebSocket не открыт');
    }
  };

  return (
    <WsFriendlyContext.Provider value={{wsRef, sendMessage, messages, isConnected}}>
      {children}
    </WsFriendlyContext.Provider>
  );
}

export const useWsFriendly = () => {
  const context = useContext(WsFriendlyContext)
  if (!context) {
    throw ('useWebSocketFriendly must be used within WebSocketProvider')
  }
  return context
}