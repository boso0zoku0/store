import React from "react";
import './clientMsgBubble.css';
import { UserCircle2, Bot, Shield, Clock, User } from 'lucide-react';

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

export const ClientMessageBubble = ({ message, onBotMessageClick, username, ws }: ClientMessageBubbleProps) => {

  // Определяем тип отправителя
  const getSenderType = (): string => {
    if (message.isOwn && !message.fileUrl) return 'client';
    if (message.username === 'Система' || message.type === 'greeting' || message.type === 'advertising') return 'system';
    if (message.username === 'Bot' || message.type === 'bot_message') return 'bot';
    if (message.type === 'media' || message.fileUrl) return message.isOwn ? 'media-outgoing' : 'media-incoming';
    return 'operator';
  };

  const senderType = getSenderType();
  const isSystem = senderType === 'system';
  const isBot = senderType === 'bot';
  const isClient = senderType === 'client';
  const isOperator = senderType === 'operator';
  const isMediaOutgoing = senderType === 'media-outgoing';
  const isMediaIncoming = senderType === 'media-incoming';
  const isIncoming = !message.isOwn && (isOperator || isBot);
  const isOutgoing = message.isOwn || isClient || isMediaOutgoing;

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBotClick = (): void => {
    if (isBot && onBotMessageClick) {
      onBotMessageClick(message.message);
    }
  };

  const handleButtonClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (ws && username) {
      ws.send(JSON.stringify({
        message: message.message,
        from: username,
      }));
    }
  };

  const renderIconLeft = () => {
    if (isOperator) {
      return <UserCircle2 className="icon-size-md icon-purple" />;
    }
    if (isBot) {
      return <Bot className="icon-size-md icon-emerald" />;
    }
    if (isSystem) {
      return <Shield className="icon-size-sm icon-gray" />;
    }
    return null;
  };

  const renderMediaContent = () => {
    if (!message.fileUrl) return null;

    const mediaUrl = `http://localhost:8000${message.fileUrl}`;

    if (message.mimeType?.startsWith('image')) {
      return (
        <div className="media-content">
          <img src={mediaUrl} alt="изображение" className="media-image" />
        </div>
      );
    }

    if (message.mimeType?.startsWith('video')) {
      return (
        <div className="media-content">
          <video src={mediaUrl} controls className="media-video" />
        </div>
      );
    }

    return (
      <div className="media-content">
        <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="media-link">
          📎 Скачать файл
        </a>
      </div>
    );
  };

  // Системное сообщение
  if (isSystem) {
    return (
      <div className="system-message-container">
        <div className="system-message-bubble">
          <Shield className="icon-size-lg icon-gray" />
          <div className="system-message-content">
            <div className="message-text white">{message.message}</div>
            <div className="system-message-time">
              <Clock className="icon-size-sm" />
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Обычное сообщение
  return (
    <div className={`message-wrapper ${senderType}`}>
      <div className="message-inner">

        {/* Иконка слева (входящие) */}
        {isIncoming && renderIconLeft() && (
          <div className={`icon-left ${senderType}`}>
            {renderIconLeft()}
          </div>
        )}
        {/* Контент сообщения */}
        <div>
          {/* Имя отправителя */}
          {isIncoming && (
            <div className="sender-name">
              {message.username}
            </div>
          )}

          {/* Пузырь сообщения */}
          <div className={`message-bubble ${senderType}`} onClick={handleBotClick}>

            {/* Медиа контент */}
            {renderMediaContent()}

            {/* Текст или кнопка */}
            {message.isButton ? (
              <button className="message-button" onClick={handleButtonClick}>
                {message.message}
              </button>
            ) : (
              <div className="message-text white">
                {message.message}
              </div>
            )}

            {/* Время */}
            <div className={`message-time ${senderType}`}>
              <Clock className="icon-size-sm" />
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>

        {/* Иконка справа (исходящие) */}
        {isOutgoing && (
          <div className="icon-right">
            <User className="icon-size-md icon-blue" />
          </div>
        )}

      </div>
    </div>
  );
};