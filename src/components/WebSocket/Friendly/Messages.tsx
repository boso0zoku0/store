import styles from "./WebSocketFriendly.module.css";
import type {Message} from "../../../contexts/SocketFriendlyManager.tsx"
import {useEffect} from "react";

interface MessagesProps {
  to_user?: string;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function Messages({to_user, messages, messagesEndRef}: MessagesProps) {
  if (!to_user) {
    return null
  }
  useEffect(() => {
    console.log(`messages: ${to_user}`)
  }, []);
  return (
    <div className={styles.messages}>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${styles.message} ${msg.is_own ? styles.ownMessage : styles.otherMessage}`}
        >
          <span className={styles.messageUsername}>{msg.sender}: </span>
          <span className={styles.messageText}>{msg.message}</span>
        </div>
      ))}
      <div ref={messagesEndRef}/>
    </div>
  )
}