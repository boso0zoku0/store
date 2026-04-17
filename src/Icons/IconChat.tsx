import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Envelope3DIconProps {
  size?: number;
  color?: string;
  className?: string;
  hasNotification?: boolean;  // true = есть новое сообщение
}

export const Envelope3DIcon: React.FC<Envelope3DIconProps> = ({
  size = 32,
  color = "#c67c4e",
  className = "",
  hasNotification = false
}) => {
  const [showDot, setShowDot] = useState(hasNotification);

  // Эффект пульсации при появлении уведомления
  useEffect(() => {
    if (hasNotification) {
      setShowDot(true);
      // Можно добавить звук или вибрацию
      console.log('🔔 Новое сообщение!');
    }
  }, [hasNotification]);

  return (
    <div
      className={className}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          {/* Градиенты для 3D-эффекта */}
          <linearGradient id="envelopeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
          </linearGradient>

          <linearGradient id="envelopeBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
          </linearGradient>

          <linearGradient id="envelopeShadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.15"/>
            <stop offset="50%" stopColor="#000" stopOpacity="0"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.15"/>
          </linearGradient>

          {/* Тень для 3D-эффекта */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
          </filter>
        </defs>

        <g filter="url(#dropShadow)">
          {/* Тело конверта (нижняя часть) */}
          <rect
            x="4"
            y="10"
            width="24"
            height="16"
            rx="2"
            fill="url(#envelopeBody)"
            stroke={color}
            strokeWidth="1.2"
          />

          {/* 3D-тень на нижней части */}
          <rect
            x="4"
            y="22"
            width="24"
            height="4"
            rx="1"
            fill="url(#envelopeShadow)"
          />

          {/* Крышка конверта (левая половинка) */}
          <path
            d="M4 10L16 19L28 10"
            fill="url(#envelopeTop)"
            stroke={color}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Правая половинка крышки (световой блик) */}
          <path
            d="M16 19L28 10"
            fill="none"
            stroke="#fff"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />

          {/* Линия сгиба (эффект объёма) */}
          <line
            x1="16"
            y1="10"
            x2="16"
            y2="26"
            stroke={color}
            strokeWidth="0.5"
            strokeOpacity="0.4"
            strokeDasharray="2 3"
          />
        </g>
      </svg>

      {/* Анимированная точка уведомления */}
      <AnimatePresence>
        {showDot && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              duration: 0.2
            }}
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '0px',
              width: `${size * 0.25}px`,
              height: `${size * 0.25}px`,
              minWidth: '8px',
              minHeight: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: `2px solid white`,
              boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)',
            }}
          >
            {/* Внутренняя пульсация */}
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};