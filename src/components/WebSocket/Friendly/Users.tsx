import {useEffect, useState, useRef, useCallback} from 'react';
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import styles from "./WebSocketFriendly.module.css"
import axios from "axios";
import api from "../../../utils/auth.tsx";
import {useWsFriendly} from "../../../contexts/SocketFriendlyManager.tsx";

interface Message {
  id: string;
  username: string;
  from_user: number;
  to_user: number;
  message: string;
  timestamp: Date;
  isOwn: boolean;
  type?: string; // 'bot', 'client'
}


interface ClientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  to_user?: string;
}

export default function WsFriendly({isOpen, onClose, to_user}: ClientPanelProps) {
  const {user} = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {wsRef, sendMessage, messages, isConnected} = useWsFriendly()

  // Прокрутка к последнему сообщению
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Подключение к WebSocket — только когда модалка открыта и есть user
  useEffect(() => {
    if (wsRef.current?.OPEN) {return;
    }

  }, [isOpen, user?.url_id]);

  const sendMsg = async () => {
    try {
      sendMessage({
        from_user: user?.id,
        sender: user?.name,
        to_user: to_user,
        // recipient должен быть юзером которому отправляем сообщение
        recipient: to_user,
        message: inputMessage,
      })
    } catch (err) {
      console.log(`error friendly ws: ${err}`)
    }
  };


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
          Chat Message with {to_user}
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
        <button onClick={sendMsg} disabled={!isConnected}>
          Отправить
        </button>
      </div>
    </div>
  );
}