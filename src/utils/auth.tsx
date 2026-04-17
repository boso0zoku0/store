import axios from 'axios';
import type {User} from "../interfaces/user.tsx"

// ✅ Функция для проверки наличия токена
export function isAuthenticated() {
  const token = getAccessToken();
  return token !== null && token !== undefined && token !== '';
}


// ✅ Функция для установки токенов
export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  console.log('Saving tokens:', {accessToken, refreshToken});
}

// ✅ Функция для удаления токенов
export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

// Получение данных пользователя
export const fetchUserData = async (): Promise<User | null> => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки пользователя:', error);
    return null;
  }
};
// export const fetchLocationUser = async (ip:string) => {
//   try {
//     await api.post('/weather', {ip}).then((res) => {
//       return res.data.data
//     })
//   }
//   catch (err) {
//     return err.status
//   }
// }

export const logout = async () => {
  try {
    await api.post('/auth/logout', {});
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  } finally {
    clearTokens();
  }
};


const api = axios.create({
  baseURL: '/api',  // или полный URL
  withCredentials: true,
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('❌ NO TOKEN!');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Если это запрос на обновление - просто ошибка
      if (originalRequest.url === '/auth/refresh') {
        // Refresh token истек - очищаем и редирект
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // window.location.href = '/login';
        return Promise.reject(error);
      }

      // Если уже идет обновление - добавляем в очередь
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Запрос на обновление токена
        const response = await axios.post('/api/auth/refresh', refreshToken,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          });

        const {access_token, refresh_token} = response.data;

        // Сохраняем новые токены
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Обновляем заголовок
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Обрабатываем очередь запросов
        processQueue(null, access_token);

        // Повторяем оригинальный запрос
        return api(originalRequest);

      } catch (refreshError) {
        // Обновить не удалось - очищаем токены и редирект
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
)

export default api;