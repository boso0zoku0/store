import {useEffect, useState} from 'react';
import {ClientsWS} from './Client.tsx';
import {OperatorWS} from './Operator.tsx';
import api from "../../utils/auth.tsx";
import Chat from "./ButtonChat/ButtonChat.tsx";
import ChatIcon from "./ButtonChat/ButtonChat.tsx";

export default function ChatWebsocket() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOperatorOpen, setIsOperatorOpen] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false)
  useEffect(() => {
    api.get("/auth/is-super-user", {withCredentials: true}).then((resp) => {
      setIsSuperUser(resp.data)
    })
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            WebSocket Чат
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Подключитесь к чату и начните общение в реальном времени
          </p>
        </div>
        <ChatIcon/>

        <div className="flex gap-4 justify-center mb-8">
          {isSuperUser ? (
            <button
              onClick={() => setIsOperatorOpen(true)}
              className="bg-gradient-to-r from-red-400 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg font-semibold"
            >
              👨‍💼 Войти как оператор
            </button>
          ) : (
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-red-400 hover:from-blue-700 hover:to-red-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg font-semibold"
            >
              👤 Войти как клиент
            </button>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-800 mb-2">Быстро</h3>
            <p className="text-sm text-gray-600">Мгновенная доставка сообщений</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-800 mb-2">Надежно</h3>
            <p className="text-sm text-gray-600">Защищенное соединение</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-800 mb-2">Удобно</h3>
            <p className="text-sm text-gray-600">Простой интерфейс</p>
          </div>
        </div>
      </div>

      <ClientsWS
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <OperatorWS
        isOpen={isOperatorOpen}
        onClose={() => setIsOperatorOpen(false)}
      />
    </div>
  );
}