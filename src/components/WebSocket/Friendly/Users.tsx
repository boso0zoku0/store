import {useEffect, useState, useRef, useCallback} from 'react';
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import styles from "./WebSocketFriendly.module.css"

interface Message {
  id: string;
  message: string;
  username: string;
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
  onClose: () => void
}

export default function WsFriendly({isOpen, onClose}: ClientPanelProps) {
  const {user} = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);  // ← храним ссылку на сокет

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
      `wss://bosozoku-shop.cloudpub.ru/users/dialog/${user.url_id}`
    );

    socket.onopen = () => {
      console.log('✓ WebSocket подключен');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Получено сообщение:', data);

        if (data.type === "user_message") {
          const newMessage: Message = {
            id: Date.now().toString() + Math.random(),
            message: data.message,
            username: data.from || 'Собеседник',
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
  }, [isOpen, user?.url_id]);  // ← зависимости: открыта модалка и id пользователя

  // Отправка сообщения
  const sendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket не подключен');
      return;
    }

    const messageToSend = {
      type: 'user_message',
      message: inputMessage,
      timestamp: Date.now(),
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
          Chat Message
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