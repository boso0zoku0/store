import {useRef, useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import api, {setTokens} from "../../../utils/auth.tsx";
import styles from './Registrations.module.css';
import Stars from "../Login/Stars.tsx";
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import {TelegramLogin} from "./RegistrTelegram.tsx";


interface RegisterFormData {
  username: string;
  password: string;
  email: string;
  phone: string;
}

export default function Register() {
  const {login} = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    email: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('username', formData.username);
      form.append('password', formData.password);
      form.append('email', formData.email);
      form.append('phone', formData.phone);

      const response = await api.post('/auth/registration', form);
      if (response.status === 201) {
        setTokens(response.data.access_token, response.data.refresh_token);
        login(response.data.user)

        console.log(`положил `)
        navigate('/products');
      }
    } catch (error: any) {
      const detail = error.response?.data?.detail
      if (detail?.type == 'user exists') {
        setError("This user is already registered")
      }
      if (detail?.type == 'invalid username') {
        setError("Invalid username or password")
      }
      if (detail?.type == 'invalid email') {
        setError("It looks like your email address is incorrect.")
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    setError('');
  };


  return (
    <div className={styles.container}>
      <Stars/>
      <div className={`${styles.cloud} ${styles.cloud1}`}/>
      <div className={`${styles.cloud} ${styles.cloud2}`}/>
      <div className={styles.mountains}/>

      <div className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт, чтобы начать покупки</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Имя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              placeholder="Как к вам обращаться?"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
              placeholder="+7 999 123-45-67"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Минимум 6 символов"
              required
            />
          </div>

          <button
            type="submit"
            className="button"
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
          <div>
            <TelegramLogin/>
          </div>
        </form>

        <p className={styles.loginLink}>
          Уже есть аккаунт?{' '}
          <Link to="/login" className={styles.link}>Войти</Link>
        </p>
      </div>
    </div>
  );
}