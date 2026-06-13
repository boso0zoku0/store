import React from "react";
import './clientMsgBubble.css';
import {UserCircle2, Bot, Shield, Clock, User} from 'lucide-react';
import type {ClientMessage} from "../interfaces.tsx"

interface ClientMessageBubbleProps {
  message: ClientMessage;
  clientName: string;
  onBotMessageClick?: (text: string) => void;
  ws?: WebSocket;
  username?: string;
}

export const ClientMessageBubble = ({message, onBotMessageClick, ws, clientName}: ClientMessageBubbleProps) => {

  const isBot = message.type === 'bot' || message.type === 'connect_confirm';
  const isClient = message.type === 'client';
  const isOperator = message.type === 'operator';
  const isMedia = message.type === 'media';
  // incoming - входящее(не мое), outgoing - исходящее(мое)
  // const isIncoming = !message.isOwn && isOperator;
  // const isOutgoing = message.isOwn || isClient || isMediaOutgoing;

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
    if (ws && clientName) {
      ws.send(JSON.stringify({
        message: message.message,
        from: clientName,
      }));
    }
  };

  const renderMediaContent = () => {
    if (!message.file_url) return null;
    console.log("🔍 renderMediaContent:", {
        file_url: message.file_url,
        mime_type: message.mime_type,
        startsWithImage: message.mime_type?.startsWith('images'),
        startsWithVideo: message.mime_type?.startsWith('video')
    });
    if (message.mime_type?.startsWith('image')) {
      return (
        <div className="media-content">
          <img src={message.file_url} alt={message.id} className="media-image"/>
        </div>
      );
    }

    if (message.mime_type?.startsWith('video')) {
      return (
        <div className="media-content">
          <video src={message.file_url} controls className="media-video"/>
        </div>
      );
    }

    return (
      <div className="media-content">
        <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="media-link">
          📎 Скачать файл
        </a>
      </div>
    );
  };

  // Сообщение бота
  if (isBot) {
    return (
      <div className="bot-message">
        <Bot className="icon-bot" size={24}/>
        <div className="bot-message-text">
          {message.message}
        </div>
      </div>
    );
  }

  // Обычное сообщение
  return (
    <div className={`message-wrapper ${message.isOwn ? 'outgoing' : 'incoming'}`}>
      {isOperator && (
        <div className="icon">
          <UserCircle2 className="icon-size-md icon-purple" size={24}/>
        </div>
      )}
      <div>
        <div className="sender-name">
          {!message.isOwn ? message.operator : clientName}
        </div>
        <div className="message-bubble" onClick={handleBotClick}>
          {isMedia && (
            renderMediaContent()
          )}
          {message.isButton ? (
            <button className="message-button" onClick={handleButtonClick}>
              {message.message}
            </button>
          ) : (
            <div className="message-text">
              {message.message}
            </div>
          )}
          {!message.isOwn && (
            <div className="message-time">
              <Clock className="icon-size-sm"/>
              {formatTime(message.created_at)}
            </div>
          )}
        </div>
      </div>
      {message.isOwn && (
        <div className="icon">
          <User className="icon-size-md icon-blue"/>
        </div>
      )}
    </div>
  );
};