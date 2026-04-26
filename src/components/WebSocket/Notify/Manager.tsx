// FloatingNotification.tsx
import {motion, AnimatePresence} from 'motion/react';
import {useState, useEffect, useRef} from 'react';
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import {useWebSocket} from "../../../contexts/SocketContext.tsx";

interface FloatingNotificationProps {
  username: string;
  product_name: string;
  url_id: string;
  onClose?: () => void;
}

// Плавающая нотификация
const FloatingNotification = ({username, url_id, product_name, onClose}: FloatingNotificationProps) => {
  // Случайное смещение по X (влево/вправо)
  const randomX = (Math.random() - 0.5) * 100; // -50px до 50px
  const randomRotate = (Math.random() - 0.5) * 30; // -15deg до 15deg
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        scale: 0.2,
        y: 0,
        x: 0,
        rotate: 0
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.2, 1, 1, 0.5],
        y: [0, -80, -150, -250],
        x: [0, randomX, randomX * 0.8, randomX * 0.5],
        rotate: [0, randomRotate, randomRotate * 0.5, randomRotate * 0.2]
      }}
      exit={{opacity: 0, scale: 0}}
      transition={{
        duration: 2.5,
        times: [0, 0.1, 0.6, 1],
        ease: "easeOut"
      }}
      onClick={onClose}
      style={{
        position: 'fixed',
        bottom: 100,
        right: 20,
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #2b241b, #4a3a2e)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        fontSize: '14px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        fontFamily: 'system-ui, sans-serif',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,215,140,0.3)',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
    >
      <span style={{marginRight: '8px', fontSize: '16px'}}>🎈</span>
      {username} купил(а) {product_name} с адресом {url_id}!
    </motion.div>
  );
};
// Плавающий менеджер уведомлений
export const FloatingNotificationManager = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Array<Record<string, string>>>([]);
  const {user, isAuthenticated} = useAuth();
  const {message, sendMessage} = useWebSocket()
  useEffect(() => {
    if (message) {
      addNotification(message)
    }
  }, [message]);


  const addNotification = (notification: Record<string, string>) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, {id, ...notification}]);
    // Удаляем через 3 секунды (анимация длится 2.5с)
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2800);
  };

  return (
    <div style={{position: 'fixed', bottom: 0, right: 0, left: 0, pointerEvents: 'none', zIndex: 1000}}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notif, idx) => (
          <FloatingNotification
            username={notif.username}
            url_id={notif.url_id}
            product_name={notif.product_name}
            onClose={() => navigate(`/profile/${notif.url_id}`)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};