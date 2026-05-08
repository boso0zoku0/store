import {useEffect, useState, useRef, useCallback} from 'react';
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import styles from "./WebSocketFriendly.module.css"
import api from "../../../utils/auth.tsx";
import {useWsFriendly} from "../../../contexts/SocketFriendlyManager.tsx";
import {data, useNavigate} from "react-router-dom";
import type {Dialogs} from '../../../contexts/SocketFriendlyManager'

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

export default function WsFriendly({isOpen, onClose, to_user}: ClientPanelProps) {
  const {user} = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {wsRef, sendMessage, messages, dialogs, setDialogs, isConnected} = useWsFriendly()
  const [toUserData, setToUserData] = useState<ToUserData | null>(null);
  const navigate = useNavigate()
  const [isOpenDialog, setIsOpenDialog] = useState(false)

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
  const markMessage = async (dialog: Dialogs) => {
    if (!dialog.is_read_message) {
      const updatedDialogs = dialogs.map(d =>
        d.id === dialog.id ? {...d, is_read_message: true} : d
      );
      setDialogs(updatedDialogs);
      await api.get(`/mark-message?current_url_id=${user?.url_id}&interlocutor_url_id=${dialog.from_user_url_id}`);
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
      {isOpenDialog &&
        <div className={styles.messages}>
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
      }

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
      {/*интерфейс для списка диалогов*/}
      {!to_user && (
        <>
          {dialogs.map((dialog) => (
            <div key={dialog.id} className={styles.containerGroupDialogs}
              //*По клику вызываю компонент отображения сообщений диалога, и сообщение помечаю прочитанным уже в нем*/
                 onClick={async () => {
                   if (!dialog.is_own && !dialog.is_read_message) (
                     await markMessage(dialog)
                   )
                 }}>
              <div className={styles.dialog}>
                <div className={styles.user} onClick={() => navigate(`/profile/${dialog?.from_user_url_id}`)}>
                  {!dialog.is_own ? dialog.sender : 'Вы'}
                </div>
                <div className={styles.msg}>
                  {dialog.message}
                </div>
                {!dialog.is_own && !dialog.is_read_message && (
                  <div className={styles.checkDialog}>
                    🔔
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}