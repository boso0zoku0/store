// components/ChatButton/Client.tsx
import React, {useState, useRef, useEffect} from 'react';
import styles from './ChatWindowClient.module.css';
import type {ClientMessage, ClientPanelProps} from "../interfaces.tsx"
import api from "../../../utils/auth.tsx";
import {uploadFile, handleCancelFile, handleFileSelect} from "../utils/OperatorHelper/fileUploadHandler.tsx";
import {ClientMessageBubble} from "../utils/clientMessageBubble.tsx";

export default function ChatClient({isOpen, clientName, onClose}: ClientPanelProps) {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const operator = useRef('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [inputValue, setInputValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  useEffect(() => {
    api.get(`/get-user-dialog?username=${operator}`)
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
    }
  }, [isOpen, ws]);


  useEffect(() => {
    if (!isOpen) return;
    const websocket = new WebSocket(`wss://store-backend.cloudpub.ru/clients/${clientName}`);

    websocket.onopen = () => {
      console.log('✓ WebSocket подключен');
      setIsConnected(true);
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
          const newMessage: ClientMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message,
            username: data.from || 'Оператор',
            timestamp: new Date(),
            isOwn: false,
            type: 'media',
            mime_type: data.mime_type,
            file_url: data.file_url
          };
          operator.current = data.from;
          setMessages(prev => [...prev, newMessage]);
        } else if (data.type === "greeting") {
          if (Array.isArray(data.message)) {
            data.message.forEach((msg: string, index: number) => {
              setTimeout(() => {
                const newMessage: ClientMessage = {
                  id: Date.now().toString() + Math.random(),
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
        } else if (data.type === "notify_connect_to_client") {
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
        } else {
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

    // ✅ Cleanup функция - закрываем соединение при размонтировании
    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
      setWs(null);
      setIsConnected(false);
    };
  }, [isOpen, clientName]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ws || !isConnected) return;

    let mediaUrl: string | undefined;
    let mediaType: string | undefined;

    if (selectedFile) {
      const uploadResult = await uploadFile({file: selectedFile, setIsUploading});
      if (uploadResult) {
        mediaUrl = uploadResult.url;
        mediaType = uploadResult.type;
      } else {
        return;
      }
    }
    if (!inputValue.trim() && !mediaUrl) {
      return;
    }

    const messageData: any = {
      message: inputValue || '',
      from: clientName,
      to: operator.current,
    };

    if (mediaUrl && mediaType) {
      messageData.file_url = mediaUrl;
      messageData.mime_type = mediaType;
    }

    ws.send(JSON.stringify(messageData));

    const newMessage: ClientMessage = {
      id: Date.now().toString() + Math.random(),
      message: inputValue,
      username: clientName,
      timestamp: new Date(),
      isOwn: true,
      type: 'client',
      file_url: mediaUrl,
      mime_type: mediaType,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    handleCancelFile({
      setSelectedFile: setSelectedFile,
      filePreview: filePreview,
      setFilePreview: setFilePreview,
      fileInputRef: fileInputRef
    })
  };


  return (
    <div className={styles.chatContainer}>
      {/* Шапка с именем оператора */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3>Чат с поддержкой</h3>
          <p>
            <span className={`${styles.operatorStatus} ${!isConnected ? styles.operatorOffline : ''}`}/>
            {isConnected ? 'В сети' : 'Нет соединения'}
          </p>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>
      {/* Область сообщений */}
      <div className={styles.messagesArea}>
        {messages.length === 0 && isConnected ? (
          <div className={styles.noConnection}>
            Напишите свой вопрос, и оператор скоро ответит
          </div>
        ) : (
          <div className={styles.messageList}>
            {messages.map((msg) => (
              <ClientMessageBubble
                key={msg.id}
                message={msg}
                onBotMessageClick={(text) => {
                  if (ws && isConnected) {
                    ws.send(JSON.stringify({message: text, from: clientName, to: 'operator'}));
                  }
                }}
              />
            ))}
            <div ref={messagesEndRef}/>
          </div>
        )}
        {!isConnected && (
          <div className={styles.noConnection}>
            <span>🔌 Соединение потеряно</span>
            <button className={styles.reconnectBtn}>
              Переподключиться
            </button>
          </div>
        )}
      </div>
      {selectedFile && filePreview && (
        <div className={styles.filePreview}>
          <div className={styles.previewContainer}>
            {selectedFile.type.startsWith('image/') ? (
              <img src={filePreview} alt="Preview" className={styles.previewImage}/>
            ) : selectedFile.type.startsWith('video/') ? (
              <div className={styles.previewVideo}>🎬</div>
            ) : (
              <div className={styles.previewVideo}>📄</div>
            )}
            <div className={styles.previewInfo}>
              <div className={styles.previewName}>{selectedFile.name}</div>
              <div className={styles.previewSize}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button
              onClick={() => handleCancelFile({
                setSelectedFile: setSelectedFile,
                filePreview: filePreview,
                setFilePreview: setFilePreview,
                fileInputRef: fileInputRef
              })}
              className={styles.cancelPreviewBtn}>
              ✕
            </button>
          </div>
        </div>
      )}
      <form onSubmit={sendMessage} className={styles.inputForm}>
        <div className={styles.inputContainer}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => handleFileSelect({e, setSelectedFile, setFilePreview})}
            style={{display: 'none'}}
            id="client-file-input"
          />
          <label
            htmlFor="client-file-input"
            className={`${styles.fileLabel} ${!isConnected ? styles.fileLabelDisabled : ''}`}
          >
            📎
          </label>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isConnected ? 'Введите сообщение...' : 'Ожидание подключения...'}
            className={styles.messageInput}
            disabled={!isConnected}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={(!inputValue.trim() && !selectedFile) || !isConnected || isUploading}
            className={styles.sendBtn}
          >
            {isUploading ? (
              <div className={styles.spinner}/>
            ) : (
              <span>✈️</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}