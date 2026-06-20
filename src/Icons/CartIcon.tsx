import {motion, AnimatePresence} from 'framer-motion';


interface CartIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({
                                                    size = 24,
                                                    color = "#d1c2ac",
                                                    className = "",
                                                  }) => {
  return (
    <div
      className={className}
      style={{cursor: 'pointer', position: 'relative'}}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{display: 'block'}}
      >
        <defs>
          {/* Градиенты для 3D-эффекта (полностью скопированы из Envelope3DIcon) */}
          <linearGradient id="cartTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
          </linearGradient>

          <linearGradient id="cartBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
          </linearGradient>

          <linearGradient id="cartShadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.15"/>
            <stop offset="50%" stopColor="#000" stopOpacity="0"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.15"/>
          </linearGradient>

          {/* Тень для 3D-эффекта */}
          <filter id="cartDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
          </filter>
        </defs>

        <g filter="url(#cartDropShadow)">
          {/* Тело корзины (нижняя часть) */}
          <rect
            x="6"
            y="12"
            width="20"
            height="14"
            rx="2"
            fill="url(#cartBody)"
            stroke={color}
            strokeWidth="1.2"
          />

          {/* 3D-тень на нижней части */}
          <rect
            x="6"
            y="22"
            width="20"
            height="4"
            rx="1"
            fill="url(#cartShadow)"
          />

          {/* Ручка корзины (как крышка конверта) */}
          <path
            d="M8 12L10 6C10 4.9 10.9 4 12 4H20C21.1 4 22 4.9 22 6L24 12"
            fill="url(#cartTop)"
            stroke={color}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Блик на ручке (как правая половинка крышки) */}
          <path
            d="M20 4L24 12"
            fill="none"
            stroke="#fff"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />

          {/* Линия сгиба ручки (эффект объёма) */}
          <line
            x1="16"
            y1="4"
            x2="16"
            y2="12"
            stroke={color}
            strokeWidth="0.5"
            strokeOpacity="0.4"
            strokeDasharray="2 3"
          />

          {/* Переднее колесо */}
          <circle
            cx="10"
            cy="27"
            r="2"
            fill="url(#cartBody)"
            stroke={color}
            strokeWidth="1"
          />
          <circle
            cx="10"
            cy="27"
            r="0.6"
            fill={color}
            fillOpacity="0.5"
          />

          {/* Заднее колесо */}
          <circle
            cx="22"
            cy="27"
            r="2"
            fill="url(#cartBody)"
            stroke={color}
            strokeWidth="1"
          />
          <circle
            cx="22"
            cy="27"
            r="0.6"
            fill={color}
            fillOpacity="0.5"
          />

          {/* Блик на корзине */}
          <path
            d="M8 14L9 24"
            fill="none"
            stroke="#fff"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
        </g>
      </svg>
    </div>
  );
};