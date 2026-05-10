import {useEffect, useState, useRef, useCallback} from 'react';
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import styles from "./WebSocketFriendly.module.css"
import api from "../../../utils/auth.tsx";
import {useWsFriendly} from "../../../contexts/SocketFriendlyManager.tsx";
import {data, useNavigate} from "react-router-dom";
import type {Dialog} from '../../../contexts/SocketFriendlyManager'
import Messages from "./Messages.tsx";

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
  const {wsRef, sendMessage, messages, dialogs, setDialogs, getDialog, isConnected} = useWsFriendly()
  const [toUserData, setToUserData] = useState<ToUserData | null>(null);
  const navigate = useNavigate()
  const [activeDialog, setActiveDialog] = useState('')


  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    console.log(`mess: ${messages}`)
  }, []);
  useEffect(() => {
    if (to_user) {
      setActiveDialog(to_user);
      getDialog(user?.url_id, to_user);
    }
  }, [to_user]);

  useEffect(() => {
    scrollToBottom();
    console.log(`to_user: ${to_user}`)
  }, [messages, scrollToBottom]);

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
  }, [isOpen, to_user]);

  const sendMsg = async () => {
    try {
      sendMessage({
        from_url_id: user?.url_id,
        to_url_id: toUserData?.url_id,
        type: 'client_msg',
        sender: user?.name,
        recipient: toUserData?.username,
        message: inputMessage,
      })
    } catch (err) {
      console.log(`error friendly ws: ${err}`)
    }
  };
  const markMessage = async (dialog: Dialog) => {
    if (!dialog.is_read_message) {
      const updatedDialogs = dialogs.map(d =>
        d.id === dialog.id ? {...d, is_read_message: true} : d
      );
      setDialogs(updatedDialogs);
      await api.get(`/mark-message?current_url_id=${user?.url_id}&interlocutor_url_id=${dialog.from_url_id}`);
    }
  };


  // Обработка Enter в поле ввода
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await sendMsg();
    }
  };
  const openDialog = (dialog: Dialog) => {
    setActiveDialog(dialog.from_url_id === user?.url_id
      ? dialog.to_url_id
      : dialog.from_url_id
    )
    getDialog(
      user?.url_id,
      activeDialog
    );
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

      {activeDialog && <Messages to_user={activeDialog} messages={messages} messagesEndRef={messagesEndRef}/>}

      {toUserData && (
        <div className={styles.inputArea}>
          <input
            type="text"
            placeholder="Введите сообщение..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
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
                 onClick={async () => {
                   if (!dialog.is_own && !dialog.is_read_message) (
                     await markMessage(dialog)
                   )
                 }}>
              <div
                className={styles.dialog}
                onClick={() => openDialog(dialog)}>
                <div className={styles.user} onClick={() => navigate(`/profile/${dialog?.from_url_id}`)}>
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