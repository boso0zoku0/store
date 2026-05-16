import {useEffect, useState, useRef, useCallback} from 'react';
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import styles from "./WebSocketFriendly.module.css"
import api from "../../../utils/auth.tsx";
import {useWsFriendly} from "../../../contexts/SocketFriendlyManager.tsx";
import {data, useNavigate} from "react-router-dom";
import type {Dialog} from '../../../contexts/SocketFriendlyManager'
import Messages from "./Messages.tsx";
import {ImArrowLeft2} from "react-icons/im";

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
  const {wsRef, sendMessage, messages, dialogs, setDialogs, getDialog, isConnected} = useWsFriendly()
  const [toUserData, setToUserData] = useState<ToUserData | null>(null);
  const navigate = useNavigate()
  const [activeDialog, setActiveDialog] = useState('')

  const to_user_url_id = to_user ? to_user : activeDialog


  useEffect(() => {
    if (!to_user) return;

    const waitForConnection = async () => {
      // Ждём, пока WebSocket не откроется
      while (wsRef.current?.readyState !== WebSocket.OPEN) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      setActiveDialog(to_user);
      getDialog(user?.url_id, to_user);
    };

    waitForConnection();
  }, [to_user]);

  useEffect(() => {
    const targetId = to_user || activeDialog;
    if (!targetId) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const fetchRecipientInfo = async () => {
      try {
        const resp = await api.get(`/user/by?url_id=${targetId}`);
        setToUserData(resp.data);
      } catch (error) {
        console.error('Ошибка получения пользователя:', error);
      }
    };

    fetchRecipientInfo();
  }, [activeDialog, to_user]);  // ← оба источника

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
      setInputMessage('')
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
    const interlocutorId = dialog.from_url_id === user?.url_id
      ? dialog.to_url_id
      : dialog.from_url_id;

    getDialog(
      user?.url_id,
      interlocutorId
    );
    setActiveDialog(interlocutorId)
  };

  if (!isOpen) {
    return null;
  }


  return (
    <div className={styles.container}>
      <div className={styles.headerLayout}>
        {activeDialog && (
          <button className={styles.back} onClick={() => setActiveDialog('')}><ImArrowLeft2/></button>
        )}
        <span className={styles.header}>
          Chat Message {toUserData && activeDialog && `with ${toUserData.username}`}
        </span>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
      {(activeDialog || to_user) ? (
        <div className={styles.chatContainer}>
          <Messages to_user={to_user_url_id} messages={messages}/>
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
        </div>
      ) : (
        dialogs.map((dialog) => (
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
                {!dialog.is_own ? dialog.recipient : dialog.sender}
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
        ))
      )}
    </div>
  );


}