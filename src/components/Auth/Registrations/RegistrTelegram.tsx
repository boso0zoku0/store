import React, {useEffect} from 'react';
import api, {setTokens} from "../../../utils/auth.tsx";
import login from "../Modal/Login.tsx";
import {useNavigate} from "react-router-dom";

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}


export const TelegramLogin = () => {
  const navigate = useNavigate()
  useEffect(() => {
    // Удаляем старый скрипт, если есть
    const oldScript = document.querySelector('script[data-telegram-login="authbot"]');
    if (oldScript) oldScript.remove();

    // Создаём скрипт
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?23';
    script.async = true;
    script.setAttribute('data-telegram-login', 'authbot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth');
    script.setAttribute('data-request-access', 'write');

    // Добавляем скрипт в body, а не в контейнер
    document.body.appendChild(script);

    // Обработчик успешного входа
    window.onTelegramAuth = async (user) => {
      console.log('Пользователь авторизован:', user);

      try {
        const response = await api.post('/auth/telegram', {
          id: user.id,
          first_name: user.first_name,
          username: user.username,
          auth_date: user.auth_date,
          hash: user.hash
        });

        setTokens(response.data.access_token, response.data.refresh_token);
        login(response.data.user);
        navigate('/products');
      } catch (error) {
        console.error('Telegram auth error:', error);
      }
    };

    // Очистка при размонтировании
    return () => {
      const scriptToRemove = document.querySelector('script[data-telegram-login="authbot"]');
      if (scriptToRemove) scriptToRemove.remove();
      delete window.onTelegramAuth;
    };
  }, []);

  // Виджет сам найдёт этот контейнер и вставит в него кнопку
  return <div id="telegram-login-container"></div>;
};