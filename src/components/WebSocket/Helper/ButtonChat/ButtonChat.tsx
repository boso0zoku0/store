// components/ChatButton/ChatButton.tsx
import {useState} from 'react';
import styles from './ButtonChat.module.css';
import {useAuth} from "../../../../contexts/Auth.tsx";
import ChatClient from "../Client.tsx";
import ChatOperator from "../Operator.tsx";
import {useWsFriendly} from "../../../../contexts/SocketFriendly.tsx";

export default function ChatButton() {
  const {user, isLoading} = useAuth();
  const {} = useWsFriendly()
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (isLoading || onclose) return null;
  if (!user?.url_id) return null;

  const buttonStyle = user.user_role === 'assistant'
    ? styles.assistantChat
    : styles.clientChat;

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Кнопка чата */}
      <button
        onClick={toggleChat}
        className={`${styles.chatButton} ${buttonStyle}`}
        aria-label="Чат поддержки"
      >
        <svg
          className={styles.chatIcon}
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
            fill="currentColor"
          />
          <circle cx="8" cy="10" r="1.5" fill="white"/>
          <circle cx="12" cy="10" r="1.5" fill="white"/>
          <circle cx="16" cy="10" r="1.5" fill="white"/>
        </svg>
      </button>
      {isChatOpen && (
        user.user_role === 'assistant'
          ? <ChatOperator operatorName={user.name} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}/>
          : <ChatClient clientName={user.name} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}/>
      )}

    </>
  );
}