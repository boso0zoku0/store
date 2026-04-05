// components/ChatButton/ChatButton.tsx
import {useState} from 'react';

import styles from './ButtonChat.module.css';
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import ChatOperator from "../ChatWindow/Operator.tsx"; // создадим отдельный компонент

export default function ChatButton() {
  const {user, isLoading} = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (isLoading) return null;
  if (!user?.user_role) return null;
  const isOperator = user.user_role === 'assistant'

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
        isOperator
          ? <ChatOperator operatorName={user.name} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}/>
          : <ChatClient onClose={() => setIsChatOpen(false)}/>
      )}

    </>
  );
}