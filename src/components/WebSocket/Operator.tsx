import {useState, useEffect, useRef} from 'react';
import {Users, Wifi, WifiOff, Send, X, UserCircle2, User, Clock, Video, Paperclip} from 'lucide-react';
import axios from 'axios';
import {OperatorMessageBubble} from "./utils/operatorMessageBubble.tsx";
import api from "../../utils/auth.tsx";
import type {OperatorMessage, Client, OperatorPanelProps} from "./interfaces.tsx";
import {loadClients} from "./utils/OperatorHelper/loadClients.tsx";


export function OperatorWS({isOpen, onClose}: OperatorPanelProps) {
  const [operatorName, setOperatorName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, OperatorMessage[]>>({});
  const [inputValue, setInputValue] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };
  useEffect(() => {
    console.log('🔄 Ререндер оператор!');
  });
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedClient]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedClient) return;

      try {
        console.log(`Выбран новый клиент: ${selectedClient}`)
        const response = await api.get(
          `/get-user-dialog?operator=${operatorName}&client=${selectedClient}`
        );
        console.log(`История сообщений с ${selectedClient} : ${response.data}`)

        const messageTransform = response.data.map((data: any) => ({
          id: data.id,
          message: data.message,
          username: data.username,
          timestamp: new Date(data.created_at),
          isOwn: data.type_message === 'operator',
          type: data.type_message
        }));

        setMessages(prev => ({
          ...prev,
          [selectedClient]: messageTransform  // TypeScript понимает, что selectedClient - string
        }));
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);
      }
    };

    loadHistory().catch((err) => console.error(`err: ${err}`))
  }, [selectedClient]);

  useEffect(() => {
    if (!isOpen && ws) {
      ws.close();
      setWs(null);
      setIsConnected(false);
    }
  }, [isOpen, ws]);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Подключение к WebSocket
  const connectToChat = async () => {
    if (!operatorName.trim()) {
      alert('Введите имя оператора');
      return;
    }

    const websocket = new WebSocket(`wss://localhost:8000/operator/${operatorName}`);

    websocket.onopen = () => {
      console.log('✓ Оператор подключен');
      setIsConnected(true);
      setIsLoggedIn(true);
      setClients([])
    };

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
            isOwn: false,
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
            isOwn: false,
            type: "notify_connect"
          };

          setMessages((prev) => ({
            ...prev,
            [data.from]: [...(prev[data.from] || []), newMessage],
          }));
          loadClients({setClients});
        } else if (data.type == "media") {
          console.log(data.type)
          const newMessage: OperatorMessage = {
            id: Date.now().toString() + Math.random(),
            message: data.message || '',
            username: data.from,
            timestamp: new Date(),
            isOwn: false,
            type: "media",
            mimeType: data.mime_type,
            fileUrl: data.file_url,
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
          loadClients()
        }


      } catch (error) {
        console.error('Ошибка парсинга сообщения:', error);
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


  // Отправка сообщения
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ws || !isConnected || !selectedClient) return;

    let mediaUrl: string | undefined;
    let mediaType: string | undefined;

    if (selectedFile) {
      const uploadResult = await uploadFile(selectedFile);
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
      isOwn: true,
      fileUrl: mediaUrl,
      mimeType: mediaType,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedClient]: [...(prev[selectedClient] || []), newMessage],
    }));

    setInputValue('');
    handleCancelFile();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    connectToChat();
  };

  if (!isOpen) return null;

  if (isLoggedIn) {
    // Панель оператора
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex">
          {/* Список клиентов */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6"/>
                <h3 className="font-semibold">Клиенты</h3>
              </div>
              <p className="text-sm text-purple-100">{operatorName}</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {clients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Нет активных клиентов</div>
              ) : (
                clients.map((client) => (
                  <button
                    key={client.username}
                    onClick={() => selectClient(client.username)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-purple-50 transition-colors ${
                      selectedClient === client.username ? 'bg-purple-100' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-700"/>
                          </div>
                          {client.isActive && (
                            <div
                              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"/>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{client.username}</p>
                          <p className="text-xs text-gray-500">
                            {client.isActive ? 'В сети' : 'Не в сети'}
                          </p>
                        </div>
                      </div>
                      {client.unreadCount > 0 && (
                        <div
                          className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {client.unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Область чата */}
          <div className="flex-1 flex flex-col">
            {/* Шапка */}
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
              <div>
                {selectedClient ? (
                  <>
                    <h3 className="font-semibold">{selectedClient}</h3>
                    <p className="text-sm text-purple-100">
                      {isConnected ? '✓ Подключен' : '✗ Не подключен'}
                    </p>
                  </>
                ) : (
                  <p className="text-purple-100">Выберите клиента из списка</p>
                )}
              </div>
              <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="w-6 h-6"/>
              </button>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-purple-50 to-white">
              {selectedClient ? (
                <>
                  {messages[selectedClient]?.map((msg) => (
                    <OperatorMessageBubble key={msg.id} message={msg}/>
                  ))}
                  <div ref={messagesEndRef}/>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Выберите клиента для начала общения
                </div>
              )}
            </div>

            {/* Превью файла */}
            {selectedFile && filePreview && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg">
                  <div className="relative">
                    {selectedFile.type.startsWith('image/') ? (
                      <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded"/>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-600"/>
                      </div>
                    )}
                    <button
                      onClick={handleCancelFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3"/>
                    </button>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
                    <p className="text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Форма ввода */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="operator-file-input"
                />
                <label
                  htmlFor="operator-file-input"
                  className={`bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-center ${
                    !selectedClient ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Paperclip className="w-5 h-5"/>
                </label>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={selectedClient ? 'Введите сообщение...' : 'Выберите клиента'}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  disabled={!selectedClient}
                />

                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !selectedFile) || !isConnected || !selectedClient || isUploading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5"/>
                      Отправить
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }}