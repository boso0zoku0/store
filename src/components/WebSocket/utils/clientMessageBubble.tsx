import {Bot, Clock, Shield, User, UserCircle2} from "lucide-react";
import React from "react";
import styles from './clientMsgBubble.module.css';

interface Message {
  message: string;
  username?: string;
  timestamp: Date;
  isOwn?: boolean;
  type?: string;
  fileUrl?: string;
  mimeType?: string;
  isButton?: boolean;
}

interface ClientMessageBubbleProps {
  message: Message;
  onBotMessageClick?: (text: string) => void;
  username?: string;
  ws?: WebSocket;
}

export const ClientMessageBubble = ({message, onBotMessageClick, username, ws}: ClientMessageBubbleProps) => {
  // Определяем тип отправителя
  const getSenderType = () => {
    if (message.isOwn && !message.fileUrl) return 'client_message';
    if (message.username === 'Система' || message.type === 'greeting' || message.type === 'advertising') return 'system_message';
    if (message.username === 'Bot' || message.type === 'bot_message') return 'bot_message';
    if (message.type === 'media' || message.fileUrl) return 'media';
    return 'operator_message';
  };

  const senderType = getSenderType();

  // Получаем CSS классы в зависимости от типа
  const getContainerClass = () => {
    const base = 'message-container';
    switch (senderType) {
      case 'client_message':
        return `${base} justify-end`;
      case 'operator_message':
      case 'bot_message':
        return `${base} justify-start`;
      case 'system_message':
        return `${base} justify-center`;
      case 'media':
        return `${base} ${message.isOwn ? 'justify-end' : 'justify-start'}`;
      default:
        return `${base} justify-start`;
    }
  };

  const getBubbleClass = () => {
    switch (senderType) {
      case 'client_message':
        return 'message-bubble bubble-client';
      case 'operator_message':
        return 'message-bubble bubble-operator';
      case 'bot_message':
        return 'message-bubble bubble-bot';
      case 'system_message':
        return 'message-bubble bubble-system';
      case 'media':
        return message.isOwn ? 'message-bubble bubble-media-outgoing' : 'message-bubble bubble-media-incoming';
      default:
        return 'message-bubble bubble-operator';
    }
  };

  const getIconLeft = () => {
    if (senderType === 'operator_message') {
      return <UserCircle2 className="w-5 h-5 icon-purple"/>;
    }
    if (senderType === 'bot_message') {
      return <Bot className="w-5 h-5 icon-emerald"/>;
    }
    if (senderType === 'system_message') {
      return <Shield className="w-4 h-4 icon-gray"/>;
    }
    return null;
  };

  const getIconLeftBgClass = () => {
    if (senderType === 'operator_message') return 'icon-left bg-purple-100';
    if (senderType === 'bot_message') return 'icon-left bg-emerald-100';
    if (senderType === 'system_message') return 'icon-left bg-gray-50';
    return 'icon-left';
  };

  const getTimeColorClass = () => {
    switch (senderType) {
      case 'client_message':
        return 'message-time-blue';
      case 'operator_message':
        return 'message-time-purple';
      case 'bot_message':
        return 'message-time-emerald';
      case 'system_message':
        return 'message-time-gray';
      case 'media':
        return message.isOwn ? 'message-time-blue' : 'message-time-purple';
      default:
        return 'message-time-gray';
    }
  };

  const handleBotClick = () => {
    if (senderType === 'bot_message' && onBotMessageClick) {
      onBotMessageClick(message.message);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Системные сообщения в центре
  if (senderType === 'system_message') {
    return (
      <div className="message-container justify-center" style={{margin: '8px 0'}}>
        <div className="system-message">
          <Shield className="w-6 h-6 icon-gray"/>
          <div>
            <div className="message-text-white">{message.message}</div>
            <div className="system-message-time">
              <Clock className="w-3 h-3"/>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerClass()}>
      <div className="message-inner">
        {/* Иконка слева для входящих сообщений */}
        {!message.isOwn && getIconLeft() && (
          <div className={getIconLeftBgClass()}>
            {getIconLeft()}
          </div>
        )}

        {/* Сообщение */}
        <div>
          {/* Имя отправителя (для входящих) */}
          {!message.isOwn && (
            <div className="sender-name">
              {message.username}
            </div>
          )}

          {/* Пузырь сообщения */}
          <div
            className={getBubbleClass()}
            onClick={handleBotClick}
          >
            {/* Медиафайлы */}
            {message.fileUrl && (
              <div className="media-content">
                {message.mimeType?.startsWith('image') ? (
                  <img
                    src={`http://localhost:8000${message.fileUrl}`}
                    alt="изображение"
                    className="media-image"
                  />
                ) : message.mimeType?.startsWith('video') ? (
                  <video
                    src={`http://localhost:8000${message.fileUrl}`}
                    controls
                    className="media-video"
                  />
                ) : (
                  <a
                    href={`http://localhost:8000${message.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="media-link"
                  >
                    📎 Скачать файл
                  </a>
                )}
              </div>
            )}

            {/* Текст или кнопка */}
            {message.isButton ? (
              <button
                className="message-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (ws && username) {
                    ws.send(JSON.stringify({
                      message: message.message,
                      from: username,
                    }));
                  }
                }}
              >
                {message.message}
              </button>
            ) : (
              <div className="message-text message-text-white">
                {message.message}
              </div>
            )}

            {/* Время */}
            <div className={`message-time ${getTimeColorClass()}`}>
              <Clock className="w-3 h-3"/>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>

        {/* Иконка справа для исходящих сообщений */}
        {message.isOwn && (
          <div className="icon-right">
            <User className="w-5 h-5"/>
          </div>
        )}
      </div>
    </div>
  );
};