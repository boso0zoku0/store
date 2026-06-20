import {useEffect, useState, useRef, useCallback} from 'react';
import {useAuth} from "../../../contexts/Auth.tsx";
import styles from "./WebSocketFriendly.module.css"
import api from "../../../utils/auth.tsx";
import {useWsFriendly} from "../../../contexts/SocketFriendly.tsx";
import {useNavigate} from "react-router-dom";
import type {Dialog} from '../../../contexts/SocketFriendly.tsx'
import Messages from "./Messages.tsx";
import {ImArrowLeft2} from "react-icons/im";

interface ClientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  to_user?: string;
  isMainEntrance?: boolean;
}

interface ToUserData {
  id: number;
  username: string | null;
  url_id: string;
}

export default function WsFriendly({isOpen, onClose, to_user, isMainEntrance}: ClientPanelProps) {
  const {user} = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const {
    wsRef,
    sendMessage,
    messages,
    dialogs,
    setDialogs,
    getDialog,
    isConnected,
    isNewMessage,
    setIsNewMessage,
    endDialog,
  } = useWsFriendly()
  const [toUserData, setToUserData] = useState<ToUserData | null>(null);
  const navigate = useNavigate()
  const [activeDialog, setActiveDialog] = useState('')
  const [toUserUrlId, setToUserUrlId] = useState('')

  useEffect(() => {
    if (endDialog === toUserUrlId) {
      setToUserUrlId('')
    }
    if (to_user) {
      setToUserUrlId(to_user)
    } else {
      setToUserUrlId(activeDialog)
    }

  }, [to_user, activeDialog]);


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
  }, [activeDialog, to_user, messages]);  // ← оба источника

  function handleBeforeClose() {
    handleCloseDialog(user?.url_id)
    onClose()
  }

  const sendMsg = async () => {
    try {
      if (!inputMessage.trim()) {
        return
      }
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
  const markDialogRead = async (dialog: Dialog) => {
    if (!dialog.is_read_message) {
      const updatedDialogs = dialogs.map(d =>
        d.id === dialog.id ? {...d, is_read_message: true} : d
      );
      setDialogs(updatedDialogs);
      await api.get(`/mark-dialog-as-read?current_url_id=${user?.url_id}&interlocutor_url_id=${dialog.from_url_id}`);
      if (isNewMessage) {
        setIsNewMessage(false)
      }
      wsRef.current?.send(JSON.stringify({
        type: 'request_is_new_message',
        url_id_curr: user?.url_id,
      }));
    }
  };
  const handleCloseDialog = (url_id: string) => {
    setActiveDialog('')
    wsRef.current?.send(JSON.stringify({
      type: 'close_dialog',
      url_id: url_id,
      to_url_id: toUserUrlId
    }))

  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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


  // getDialog вызвали - значит с этого момента все сообщения между текущим юзером и его собеседником(от лица
  // текущего юзера - считаются прочитанными, если нажали x(closeBtn) или на ImArrowLeft2 то мы не в диалоге)
  // 2 вариант. переменная in_dialog в бд, перечисляем кто из юзеров в диалоге, при вставке сообщения в бд,
  // проверять, если юзер1 в диалоге, а сообщение поступило от юзера2, то is_read=True, и аналогично
  // if юзер2 in_dialog , а сообщениие поступило от юзер1, то is_read=True принудительно
  return (
    <div className={styles.container}>
      <div className={styles.headerLayout}>
        {activeDialog && isMainEntrance && (
          <button className={styles.back} onClick={() => handleCloseDialog(user?.url_id)}><ImArrowLeft2 size={22}/>
          </button>
        )}
        <span className={styles.header}>
          Chat Message {toUserData && activeDialog && `with ${toUserData.username}`}
        </span>
        <button className={styles.closeBtn} onClick={() => handleBeforeClose()}>✕</button>
      </div>
      {(activeDialog || to_user) ? (
        <div className={styles.chatContainer}>
          <Messages to_user={toUserUrlId} messages={messages}/>
          <div className={styles.inputArea}>
            <input
              type="text"
              placeholder="Введите сообщение..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
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
                   await markDialogRead(dialog)
                 )
               }}>
            <div
              className={styles.dialog}
              onClick={() => openDialog(dialog)}>
              <div className={styles.user} onClick={() => navigate(`/profile/${dialog?.from_url_id}`)}>
                {!dialog.is_own ? dialog.sender : dialog.recipient}
              </div>
              <div className={styles.msg}>
                {dialog.message}
              </div>
              {!dialog.is_read_message && !dialog.is_own && (
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