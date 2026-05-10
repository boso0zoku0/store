import {createContext, useContext, useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useAuth} from "./AuthContexts.tsx";

export interface Message {
  from_user: string;
  sender: string;
  message: string;
  to_user: string;
  recipient: string;
  is_own?: boolean;
  type?: string; // 'bot', 'client'
}

export interface Dialog {
  id: string;
  sender: string;
  recipient: string;
  from_url_id: string;
  to_url_id: string;
  message: string;
  is_own: boolean;
  is_read_message: boolean
}

interface TypeContext {
  wsRef: React.MutableRefObject<WebSocket | null>;
  sendMessage: (data: any) => void;
  setDialogs: (data: any) => void;
  messages: Message[];
  dialogs: Dialog[];
  getDialog: (from_url_id: string, to_url_id: string) => void;
  isConnected: boolean;
}


const WsFriendlyContext = createContext<TypeContext | null>(null)

export default function WSFriendlyProvider({children}) {
  const {user, isAuthenticated} = useAuth();
  const {url_id} = useParams()
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[] | null>([])
  const [dialogs, setDialogs] = useState<Dialog[]>([])
  const wsRef = useRef<WebSocket | null>(null);


  useEffect(() => {
    if (!isAuthenticated || !user?.url_id) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const websocket = new WebSocket(`wss://store-backend.cloudpub.ru/friendly/dialog?url_id=${user.url_id}`)
    websocket.onopen = () => {
      wsRef.current?.send(JSON.stringify({'type': 'request_dialogs_history', 'url_id': user.url_id}))
      setIsConnected(true)
    }
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'client_msg') {
        const msg = {
          ...data,
          is_own: data.from_url_id === user?.url_id
        };
        setMessages(prev => [...prev, msg]);

      } else if (data.type === 'response_dialogs_history') {
        setDialogs(data.message)

      } else if (data.type === 'response_dialog_history') {
          const historyDialog = data.message.map((msg) => ({
            id: msg.id,
            from_url_id: msg.from_url_id,
            to_url_id: msg.to_url_id,
            recipient: msg.recipient,
            sender: msg.sender,
            message: msg.message,
            is_own: msg.is_own,
            is_read_message: msg.is_read_message,
          }))
          setMessages(historyDialog)
      }
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
  const getDialog = (from_url_id: string, to_url_id: string) => {
    console.log('📤 getDialog отправляет:', {from_url_id, to_url_id});  // ← добавить
    wsRef.current?.send(JSON.stringify({
      type: 'request_dialog_history',
      from_url_id: from_url_id,
      to_url_id: to_url_id
    }));
  };

  return (
    <WsFriendlyContext.Provider value={{wsRef, messages, sendMessage, dialogs, getDialog, setDialogs, isConnected}}>
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


// return (
//   <div className={styles.container}>
//     <div className={styles.header}>
//       <span>
//         Chat Message {toUserData && `with ${toUserData.username}`}
//       </span>
//       <button className={styles.closeBtn} onClick={onClose}>✕</button>
//     </div>
//     {to_user &&
//       <div className={styles.messages}>
//         {messages?.map((msg, index) => (
//           <div
//             key={index}
//             className={`${styles.message} ${msg.is_own ? styles.ownMessage : styles.otherMessage}`}
//           >
//             <span className={styles.messageUsername}>{msg.sender}</span>
//             <span className={styles.messageText}>{msg.message}</span>
//             <span className={styles.messageTime}>
//             {new Date(msg.timestamp).toLocaleTimeString()}
//           </span>
//           </div>
//         ))}
//         <div ref={messagesEndRef}/>
//       </div>
//     }
//     {toUserData && (
//       <div className={styles.inputArea}>
//         <input
//           type="text"
//           placeholder="Введите сообщение..."
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           onKeyPress={handleKeyPress}
//           disabled={!isConnected}
//         />
//         <button onClick={sendMsg} disabled={!isConnected}>
//           Отправить
//         </button>
//       </div>
//     )}
//     {/*интерфейс для списка диалогов*/}
//     {!to_user && (
//       <>
//         {dialogs.map((dialog) => (
//           <div key={dialog.id} className={styles.containerGroupDialogs}
//                onClick={async () => {
//                  if (!dialog.is_own && !dialog.is_read_message) (
//                    await markMessage(dialog)
//                  )
//                }}>
//             {/* по клику на диалог открывать чат с юзером */}
//             <div className={styles.dialog} onClick={()=> setIsOpenDialog(true)}>
//               <div className={styles.user} onClick={() => navigate(`/profile/${dialog?.from_url_id}`)}>
//                 {!dialog.is_own ? dialog.sender : 'Вы'}
//               </div>
//               <div className={styles.msg}>
//                 {dialog.message}
//               </div>
//               {!dialog.is_own && !dialog.is_read_message && (
//                 <div className={styles.checkDialog}>
//                   🔔
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </>
//     )}
//   </div>
// );