import React from 'react';
import styles from './Requisites.module.css';

export default function Requisites() {
  const requisites = {
    inn: '661218709602',
    ogrnip: '326965800059168'
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Здесь можно добавить уведомление, если хочешь
    console.log(`Скопировано: ${label}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Реквизиты</h1>

        <div className={styles.card}>
          {/* ИНН */}
          <div className={styles.row}>
            <span className={styles.label}>ИНН</span>
            <span className={styles.value}>{requisites.inn}</span>
            <button
              className={styles.copyButton}
              onClick={() => copyToClipboard(requisites.inn, 'ИНН')}
              aria-label="Копировать ИНН"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 12.9V17.4C16 20.4 14.4 22 11.4 22H6.6C3.6 22 2 20.4 2 17.4V12.6C2 9.6 3.6 8 6.6 8H11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 12.9H12.5C10 12.9 9 11.9 9 9.4V5.9C9 5.1 9.9 4.7 10.5 5.2L16.8 10.5C17.3 11 16.9 12.9 16 12.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Разделитель */}
          <div className={styles.divider}></div>

          {/* ОГРНИП */}
          <div className={styles.row}>
            <span className={styles.label}>ОГРНИП</span>
            <span className={styles.value}>{requisites.ogrnip}</span>
            <button
              className={styles.copyButton}
              onClick={() => copyToClipboard(requisites.ogrnip, 'ОГРНИП')}
              aria-label="Копировать ОГРНИП"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 12.9V17.4C16 20.4 14.4 22 11.4 22H6.6C3.6 22 2 20.4 2 17.4V12.6C2 9.6 3.6 8 6.6 8H11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 12.9H12.5C10 12.9 9 11.9 9 9.4V5.9C9 5.1 9.9 4.7 10.5 5.2L16.8 10.5C17.3 11 16.9 12.9 16 12.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}