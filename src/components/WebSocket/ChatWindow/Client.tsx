// components/ChatButton/Client.tsx
import React, {useState, useRef, useEffect} from 'react';
import styles from './ChatWindow.module.css';
import type {ClientMessage, ClientPanelProps} from "../interfaces"
import api from "../../../utils/auth.tsx";


interface ChatWindowProps {
  onClose: () => void;
  userRole: string;
}

export default function Client({onClose, userRole}: ChatWindowProps) {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const operator = useRef('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);


  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  useEffect(() => {
    api.get(`/get-user-dialog?username=${operator}`, {withCredentials: true})
      .then((response) => {
        const messageTransform = response.data.map((data) => ({
          id: data.id,
          message: data.message,
          username: data.username,
          timestamp: new Date(data.created_at),
          isOwn: data.type_message == 'client',
          type: data.type_message
        }))
        setMessages(messageTransform)
      })

      .catch(error => {
        console.error('Ошибка загрузки истории:', error);
      });
  }, []);

  // Очистка превью при размонтировании
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  useEffect(() => {
    if (!isOpen && ws) {
      ws.close();
      setWs(null);
      setIsConnected(false);
      setMessages([]);
      setIsLoggedIn(false);
      setUsername('');
      setHasJoined(false);
    }
  }, [isOpen, ws]);



  const websocket = new WebSocket(`wss://bosozoku-shop.cloudpub.ru/clients/${client}`);

    websocket.onopen = () => {
      console.log('✓ WebSocket подключен');
      setIsConnected(true);
      setHasJoined(true);
      setIsLoggedIn(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Получено сообщение:', data);

        if (data.type === "operator_message") {
          const newMessage: ClientMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message,
            username: data.from || 'Оператор',
            timestamp: new Date(),
            isOwn: false,
            type: 'operator_message'
          };
          operator.current = data.from;
          setMessages(prev => [...prev, newMessage]);
        } else if (data.type === "media") {
          console.log(data.type)
          const newMessage: ClientMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message,
            username: data.from || 'Оператор',
            timestamp: new Date(),
            isOwn: false,
            type: 'media',
            mimeType: data.mime_type,
            fileUrl: data.file_url
          }
          operator.current = data.from;
          setMessages(prev => [...prev, newMessage])

        } else if (data.type === "greeting") {
          if (Array.isArray(data.message)) {
            data.message.forEach((msg: string, index: number) => {
              setTimeout(() => {
                const newMessage: ClientMessage = {
                  id: (Date.now() + index).toString() + Math.random(),
                  message: msg,
                  username: 'Bot',
                  timestamp: new Date(),
                  isOwn: false,
                  isButton: true,
                  type: 'bot_message'
                };
                setMessages(prev => [...prev, newMessage]);
              }, index * 1000);
            });
          } else {
            const newMessage: ClientMessage = {
              id: Date.now().toString() + Math.random(),
              message: data.message,
              username: 'Система',
              timestamp: new Date(),
              isOwn: false,
              type: 'system_message',
              isButton: false
            };
            setMessages(prev => [...prev, newMessage]);
          }

        } else if (data.type === "bot_message") {
          const newMessage: ClientMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message,
            username: 'Bot',
            timestamp: new Date(),
            isOwn: false,
            type: 'bot_message',
            isButton: false
          };
          setMessages(prev => [...prev, newMessage]);

        } else if (data.type === "advertising" || data.type === "notify") {
          const newMessage: ClientMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message,
            username: 'Система',
            timestamp: new Date(),
            isOwn: false,
            type: 'system',
            isButton: false
          };
          setMessages(prev => [...prev, newMessage]);

        } else if (data.type == "notify_connect_to_client") {
          const newMessage: ClientMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message,
            username: 'Система',
            timestamp: new Date(),
            isOwn: false,
            type: 'system',
            isButton: false
          };
          setMessages(prev => [...prev, newMessage]);

        }
        else {
          const newMessage: ClientMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message || JSON.stringify(data),
            username: data.from || 'Система',
            timestamp: new Date(),
            isOwn: false,
            type: 'system',
            isButton: false
          };
          setMessages(prev => [...prev, newMessage]);
        }
      } catch (error) {
        console.error('Ошибка парсинга сообщения:', error);
        const newMessage: ClientMessage = {
          id: Date.now().toString() + Math.random(),
          message: event.data,
          username: 'Система',
          timestamp: new Date(),
          isOwn: false,
          type: 'system',
          isButton: false
        };
        setMessages(prev => [...prev, newMessage]);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      setIsConnected(false);
    };

    websocket.onclose = () => {
      console.log('WebSocket отключен');
      setIsConnected(false);
    };

    setWs(websocket);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ws || !isConnected) return;

    let mediaUrl: string | undefined;
    let mediaType: string | undefined;

    if (selectedFile) {
      const uploadResult = await uploadFile(selectedFile);
      if (uploadResult) {
        mediaUrl = uploadResult.url;
        mediaType = uploadResult.type;
      } else {
        // Если загрузка не удалась, не отправляем сообщение
        return;
      }
    }

    // Проверяем, есть ли текст или медиа
    if (!inputValue.trim() && !mediaUrl) {
      return;
    }

    const messageData: any = {
      message: inputValue || '',
      from: username,
      to: operator.current,
    };

    // Добавляем информацию о медиа, если есть
    if (mediaUrl && mediaType) {
      messageData.file_url = mediaUrl;
      messageData.mime_type = mediaType;
    }

    ws.send(JSON.stringify(messageData));

    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      message: inputValue,
      username: username,
      timestamp: new Date(),
      isOwn: true,
      type: 'client',
      fileUrl: mediaUrl,
      mimeType: mediaType,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setMsgReply('');
    handleCancelFile()
    };


  return (
    <div className={styles.chatWindow}>
      {/* Шапка чата */}
      <div className={styles.chatHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.avatar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                    fill="currentColor"/>
            </svg>
          </div>
          <div>
            <span className={styles.headerTitle}>Поддержка</span>
            <span className={styles.headerStatus}>онлайн</span>
          </div>
        </div>
        <button onClick={onClose} className={styles.closeBtn}>×</button>
      </div>
      {/* Область сообщений */}
      <div className={styles.chatMessages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.isOwn ? styles.ownMessage : styles.otherMessage}`}
          >
            <div className={styles.messageBubble} key={msg.id}>
              <p>{msg.username}</p>
              <p>{msg.message}</p>
              <span>{msg.timestamp.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</span>
            </div>
          </div>
        ))}
        <div className={styles.typingIndicator}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div ref={messagesEndRef}/>
      </div>

      {/* Поле ввода */}
      <div className={styles.chatInput}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Введите сообщение..."
          rows={1}
        />
        <button className={styles.sendBtn}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}