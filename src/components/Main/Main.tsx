// components/Hero.tsx
import React, { useEffect, useRef } from 'react';
import styles from './Main.module.css';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { width, height, left, top } = heroRef.current.getBoundingClientRect();
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;

      heroRef.current.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div className={styles.heroWrapper} ref={containerRef}>
      <div className={styles.hero} ref={heroRef}>
        <div className={styles.backgroundGlow} />
        <div className={styles.grainOverlay} />

        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.badgeText}>Handmade Ceramics</span>
            <div className={styles.badgeGlow} />
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleLine}>Глина,</span>
            <span className={styles.titleLine}>ожившая</span>
            <span className={styles.titleLine}>в руках</span>
          </h1>

          <div className={styles.subtitleWrapper}>
            <p className={styles.subtitle}>
              Каждое изделие — уникальная история,<br />
              рассказанная природой и мастером
            </p>
            <div className={styles.subtitleLine} />
          </div>

          <div className={styles.buttons}>
            <button className={styles.primaryBtn} onClick={() => window.open('/products')}>
              <span>Исследовать коллекцию</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={styles.secondaryBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
              </svg>
              Смотреть видео
            </button>
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollWheel} />
        </div>

        <div className={styles.floatingElements}>
          <div className={styles.floatingItem} style={{ top: '20%', left: '5%', animationDelay: '0s' }}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <path d="M30 50 L70 50 M50 30 L50 70" stroke="currentColor" strokeWidth="2"/>
              <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className={styles.floatingItem} style={{ top: '70%', right: '8%', animationDelay: '1s' }}>
            <svg width="35" height="35" viewBox="0 0 100 100" fill="none">
              <path d="M50 20 L65 50 L50 80 L35 50 Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className={styles.floatingItem} style={{ bottom: '15%', left: '12%', animationDelay: '2s' }}>
            <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="2"/>
              <path d="M50 25 L50 75 M25 50 L75 50" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        <div className={styles.particleSystem}>
          {[...Array(50)].map((_, i) => (
            <div key={i} className={styles.particle} style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: `rgba(255,215,140,${Math.random() * 0.5 + 0.2})`
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}