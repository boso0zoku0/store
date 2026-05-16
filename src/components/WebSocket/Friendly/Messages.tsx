import styles from "./WebSocketFriendly.module.css";
import type {Message} from "../../../contexts/SocketFriendlyManager.tsx"
import {useCallback, useEffect, useRef} from "react";

interface MessagesProps {
  to_user?: string;
  messages: Message[];
}

export default function Messages({to_user, messages}: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    console.log(`mess: ${messages}`)
  }, []);

  useEffect(() => {
    scrollToBottom();
    console.log(`to_user: ${to_user}`)
  }, [messages, scrollToBottom]);

  if (!to_user) {
    return null
  }
  useEffect(() => {
    console.log(`messages: ${messages}`)
  }, []);
  return (
    <div className={styles.messages}>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${styles.message} ${msg.is_own ? styles.ownMessage : styles.otherMessage}`}
        >
          <span className={styles.messageUsername}>{msg.is_own ? 'Вы:' : msg.sender}</span>
          <span className={styles.messageText}>{msg.message}</span>
        </div>
      ))}
      <div ref={messagesEndRef}/>
    </div>
  )
}