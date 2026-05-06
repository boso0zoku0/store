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

interface ToUserData {
  id: number;
  username: string | null;
  url_id: string;
}

// если вызвали компонент без to_user, значит хотят просто посмотреть историю диалогов,
// но в дальнейшем могут кликнуть по определенному юзеру

export default function WsFriendly({isOpen, onClose, to_user}: ClientPanelProps) {
  const {user} = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {wsRef, sendMessage, messages, isConnected} = useWsFriendly()
  const [toUserData, setToUserData] = useState<ToUserData | null>(null);

  // Прокрутка к последнему сообщению
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, []);


  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Подключение к WebSocket — только когда модалка открыта и есть user
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || to_user === undefined) {
      return;
    }
    const fetchRecipientInfo = async () => {
      try {
        const resp = await api.get(`/user/by?url_id=${to_user}`);
        setToUserData(resp.data)
      } catch (error) {
        console.error('Ошибка получения пользователя:', error);
      }
    };
    fetchRecipientInfo();
  }, [isOpen, user?.url_id, to_user]);

  const sendMsg = async () => {
    try {
      sendMessage({
        from_user_url_id: user?.url_id,
        to_user_url_id: toUserData?.url_id,
        sender: user?.name,
        recipient: toUserData?.username,
        message: inputMessage,
      })
    } catch (err) {
      console.log(`error friendly ws: ${err}`)
    }
  };


  // Обработка Enter в поле ввода
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await sendMsg();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>
          Chat Message {toUserData && `with ${toUserData.username}`}
        </span>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.emptyChat}>
            Нет сообщений. Напишите что-нибудь...
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.isOwn ? styles.ownMessage : styles.otherMessage}`}
          >
            <span className={styles.messageUsername}>{msg.sender}</span>
            <span className={styles.messageText}>{msg.message}</span>
            <span className={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef}/>
      </div>
      {/*toUserData нет, означает что открыли чат(без указания конкретного юзера)*/}
      {/*доработать логику, когда toUserData нет - показываем всех юзеров с кем диалог*/}
      {toUserData && (
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
      )}
    </div>
  );
}