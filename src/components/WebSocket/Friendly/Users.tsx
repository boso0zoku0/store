import {useEffect, useState, useRef, useCallback} from 'react';
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import styles from "./WebSocketFriendly.module.css"
import axios from "axios";
import api from "../../../utils/auth.tsx";

interface Message {
  id: string;
  username: string;
  room_id: string;
  from_user: string;
  to_user: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
  isButton?: boolean;
  type?: string; // 'system', 'bot', 'OperatorHelper', 'client', 'media'
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string
}


interface ClientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  to_user?: string;
}

export default function WsFriendly({isOpen, onClose, to_user}: ClientPanelProps) {
  const {user} = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);  // ← храним ссылку на сокет
  const to_user_ref = useRef('')

  // Прокрутка к последнему сообщению
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Подключение к WebSocket — только когда модалка открыта и есть user
  useEffect(() => {
    if (!isOpen || !user?.url_id) {
      return;
    }

    // Создаем соединение
    const socket = new WebSocket(
      `wss://store-backend.cloudpub.ru/friendly/dialog?url_id=${user.url_id}`
    );

    socket.onopen = () => {
      console.log('✓ WebSocket подключен');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Получено сообщение:', data);

        if (data.type === "friendly_message") {
          const newMessage: Message = {
            id: Date.now().toString() + Math.random(),
            message: data.message,
            username: data.from || 'Собеседник',
            room_id: data["room_id"],
            from_user: data["from_user"],
            to_user: data["to_user"],
            timestamp: data.timestamp || Date.now(),
            isOwn: false,
            type: data.type
          };
          setMessages(prev => [...prev, newMessage]);
        }
      } catch (e) {
        console.error('Ошибка парсинга сообщения:', e);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      setIsConnected(false);
    };

    socket.onclose = () => {
      console.log('WebSocket отключен');
      setIsConnected(false);
    };

    wsRef.current = socket;

    // Cleanup: закрываем соединение при закрытии модалки или размонтировании
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [isOpen, user?.url_id]);


  // Отправка сообщения
  const sendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket не подключен');
      return;
    }
    const messageToSend = {
      message: inputMessage,
      from_user: user?.name,
      to_user: to_user,
      url_id: user?.url_id
    };

    wsRef.current.send(JSON.stringify(messageToSend));

    // Добавляем свое сообщение в список
    const ownMessage: Message = {
      id: Date.now().toString() + Math.random(),
      message: inputMessage,
      username: 'Вы',
      timestamp: Date.now(),
      isOwn: true,
      type: 'user_message'
    };
    setMessages(prev => [...prev, ownMessage]);
    setInputMessage('');
  }, [inputMessage]);

  // Обработка Enter в поле ввода
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>
          Chat Message with {to_user_ref.current}
          {isConnected && <span className={styles.statusOnline}> ● Онлайн</span>}
        </span>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.emptyChat}>
            Нет сообщений. Напишите что-нибудь...
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.isOwn ? styles.ownMessage : styles.otherMessage}`}
          >
            <span className={styles.messageUsername}>{msg.username}</span>
            <span className={styles.messageText}>{msg.message}</span>
            <span className={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef}/>
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Введите сообщение..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
        />
        <button onClick={sendMessage} disabled={!isConnected}>
          Отправить
        </button>
      </div>
    </div>
  );
}