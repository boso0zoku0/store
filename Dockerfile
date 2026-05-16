# Этап 1: Сборка приложения
FROM node:22-alpine AS builder

WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci && npm cache clean --force

# Копируем исходный код
COPY . .

RUN npm run build

# Этап 2: HTTP сервер для раздачи статики
FROM node:22-alpine

WORKDIR /app

# Копируем собранные файлы из первого этапа
COPY --from=builder /app/dist /app

# Устанавливаем простой HTTP сервер
RUN npm install -g serve

# Открываем порт
EXPOSE 80

# Запускаем сервер на порту 80
CMD ["serve", "-s", ".", "-l", "80"]