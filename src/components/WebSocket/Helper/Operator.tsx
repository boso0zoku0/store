// Понадобится для события клика по клиенту
import styles from "./ChatWindowOperator.module.css"
import {handleCancelFile, handleFileSelect, uploadFile} from "../utils/OperatorHelper/fileUploadHandler.tsx";

import {useEffect, useRef, useState} from "react";
import type {OperatorMessage, Client, OperatorPanelProps} from "../interfaces.tsx";
import {loadClients} from "../utils/OperatorHelper/loadClients.tsx";
import {OperatorMessageBubble} from "../utils/operatorMessageBubble.tsx";


export default function ChatOperator({isOpen, operatorName}: OperatorPanelProps) {
  const [messages, setMessages] = useState<Record<string, OperatorMessage[]>>({});
  const [inputValue, setInputValue] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [load, setLoad] = useState(true)
  const [isConnect, setIsConnect] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) {
    return null
  }
  if (!isOpen && ws) {
    setIsConnect(false);
    setWs(null)
  }


  useEffect(() => {
    const websocket = new WebSocket(`wss://bosozoku-shop.cloudpub.ru/operator/${operatorName}`)
    websocket.onopen = () => {
      console.log(`соединение открыто`)
      setLoad(false)
      setIsConnect(true)

    }
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Получено сообщение:', data);

        if (data.type === 'client_message' && !data.file_url && !data.media_url) {
          const newMessage: OperatorMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message || '',
            username: data.from,
            timestamp: new Date(),
            is_own: false,
          };

          setMessages((prev) => ({
            ...prev,
            [data.from]: [...(prev[data.from] || []), newMessage],
          }));

          // Обновляем счетчик непрочитанных, если это не активный чат
          if (selectedClient !== data.from) {
            setClients((prev) =>
              prev.map((c) =>
                c.username === data.from ? {...c, unreadCount: c.unreadCount + 1} : c
              )
            );
          }
        }
        if (data.type == "notify_connect") {
          console.log('🔔 Новый клиент:', data.from);
          const newClient = data.from

          setClients(prev => {
            const exists = prev.some(c => c.username === data.from);
            if (exists) {
              console.log('Клиент уже есть в списке');
              return prev;
            }
            console.log('➕ Добавляем нового клиента:', data.from);
            return [...prev, {
              username: newClient,
              isActive: true,
              unreadCount: 1
            }];
          });
          const newMessage: OperatorMessage = {
            id: Date.now().toString() + Math.random(),
            message: 'Новый клиент нуждается в помощи',
            username: newClient,
            timestamp: new Date(),
            is_own: false,
            type: "notify_connect"
          };

          setMessages((prev) => ({
            ...prev,
            [data.from]: [...(prev[data.from] || []), newMessage],
          }));
          loadClients({setClients}).catch(err => console.error('Ошибка загрузки клиентов:', err));
        } else if (data.type == "media") {
          console.log(data.type)
          const newMessage: OperatorMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message || '',
            username: data.from,
            timestamp: new Date(),
            is_own: false,
            type: "media",
            mime_type: data.mime_type,
            file_url: data.file_url,
          };

          setMessages((prev) => ({
            ...prev,
            [data.from]: [...(prev[data.from] || []), newMessage],
          }));
        } else if (data.type == 'notify_disconnect') {
          setClients(prev => prev.filter(c => c.username !== data.from));
          setMessages(prev => {
            const newMessages = {...prev};
            delete newMessages[data.from];
            return newMessages;
          });
          if (selectedClient == data.from) {
            setSelectedClient(null)
          }
          loadClients({setClients}).catch((err) => console.error(err))
        }
      } catch (err) {
        ws?.close();
        setIsConnect(false);
      }
    };
    websocket.onerror = () => {
      setClients([])
      setIsConnect(false)
      setWs(null)
    }
    websocket.onclose = () => {
      setIsConnect(false)
    }
    setWs(websocket)

  }, [selectedClient])

  // Отправка сообщения
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ws || !isConnect || !selectedClient) return;

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
      from: operatorName,
      to: selectedClient,
    };

    if (mediaUrl && mediaType) {
      messageData.file_url = mediaUrl;
      messageData.mime_type = mediaType;
    }

    ws.send(JSON.stringify(messageData));

    const newMessage: OperatorMessage = {
      id: Date.now().toString() + Math.random(),
      message: inputValue,
      username: operatorName,
      timestamp: new Date(),
      is_own: true,
      file_url: mediaUrl,
      mime_type: mediaType,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedClient]: [...(prev[selectedClient] || []), newMessage],
    }));

    setInputValue('');
    handleCancelFile({
      setSelectedFile: setSelectedFile,
      filePreview: filePreview,
      setFilePreview: setFilePreview,
      fileInputRef: fileInputRef
    });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3>Чат оператора</h3>
          <p>{operatorName} • {isConnect ? 'Подключен' : 'Не подключен'}</p>
        </div>
        <button onClick={onclose} className={styles.closeBtn}>
          ✕
        </button>
      </div>

      <div className={styles.clientsList}>
        {clients.length === 0 ? (
          <div style={{padding: '20px', textAlign: 'center', color: '#9ca3af'}}>
            Нет активных клиентов
          </div>
        ) : (
          clients.map((client) => (
            <button
              key={client.username}
              onClick={() => setSelectedClient(client.username)}
              className={`${styles.clientItem} ${selectedClient === client.username ? styles.clientItemActive : ''}`}
            >
              <div className={styles.clientInfo}>
                <div className={styles.clientAvatar}>
                  <span>👤</span>
                  {client.isActive && <div className={styles.onlineDot}/>}
                </div>
                <div>
                  <div className={styles.clientName}>{client.username}</div>
                  <div className={styles.clientStatus}>
                    {client.isActive ? 'В сети' : 'Не в сети'}
                  </div>
                </div>
              </div>
              {client.unreadCount > 0 && (
                <div className={styles.unreadBadge}>{client.unreadCount}</div>
              )}
            </button>
          ))
        )}
      </div>

      <div className={styles.chatArea}>
        {!selectedClient ? (

          <div className={styles.noClientMessage}>Выберите клиента для начала общения</div>
        ) : (
          <>
            <div className={styles.messagesArea}>
              <div className={styles.messageList}>
                {messages[selectedClient]?.map((msg) => (
                  <OperatorMessageBubble key={msg.id} message={msg}/>
                ))}
                <div ref={messagesEndRef}/>
              </div>
            </div>

            {selectedFile && filePreview && (
              <div className={styles.filePreview}>
                <div className={styles.previewContainer}>
                  {selectedFile.type.startsWith('image/') ? (
                    <img src={filePreview} alt="Preview" className={styles.previewImage}/>
                  ) : (
                    <div className={styles.previewVideo}>🎬</div>
                  )}
                  <div className={styles.previewInfo}>
                    <div className={styles.previewName}>{selectedFile.name}</div>
                    <div className={styles.previewSize}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelFile({
                      setSelectedFile,
                      filePreview,
                      setFilePreview,
                      fileInputRef
                    })}
                    className={styles.cancelPreviewBtn}
                  >
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
                  onChange={() => handleFileSelect}
                  className="hidden"
                  id="operator-file-input"
                  style={{display: 'none'}}
                />
                <label
                  htmlFor="operator-file-input"
                  className={`${styles.fileLabel} ${!selectedClient ? styles.fileLabelDisabled : ''}`}
                >
                  📎
                </label>

                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={selectedClient ? 'Введите сообщение...' : 'Выберите клиента'}
                  className={styles.messageInput}
                  disabled={!selectedClient}
                  rows={1}
                />

                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !selectedFile) || !isConnect || !selectedClient || isUploading}
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
          </>
        )}
      </div>
    </div>
  );
}