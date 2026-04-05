// Понадобится для события клика по клиенту
import {chooseClient} from "../utils/OperatorHelper/ChooseClient.tsx";
import {handleCancelFile, handleFileSelect, uploadFile} from "../utils/OperatorHelper/fileUploadHandler.tsx";

import {useEffect, useRef, useState} from "react";
import type {OperatorMessage, Client, OperatorPanelProps, ClientMessage} from "../interfaces.tsx";
import {loadClients} from "../utils/OperatorHelper/loadClients.tsx";




export default function ChatOperator({ isOpen, operatorName }: OperatorPanelProps) {
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
    const websocket = new WebSocket(`wss://bosozoku-shop.cloudpub.ru/wss/operator/${operatorName}`)
    websocket.onopen = () => {
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

  })

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
    <div></div>
  )
}