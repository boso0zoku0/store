import {useState} from "react";
import styles from "./Login.module.css";
import api, {setTokens} from "../../../utils/auth.tsx";
import {useAuth} from "../../../contexts/AuthContexts.tsx";
import {useNavigate} from "react-router-dom";


interface LoginHelperProps {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  setError: (value: string) => void;
}

export default function LoginHelper({isLoading, setIsLoading, setError}:LoginHelperProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const { login } = useAuth();  // 👈 берем login из контекста
  const navigate = useNavigate();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('username', formData.username);
      form.append('password', formData.password);

      const response = await api.post('/auth/login', form, {
        withCredentials: true
      });
      if (response.status === 200) {
        setTokens(response.data.access_token, response.data.refresh_token);
        login(response.data.user)

        console.log(`положил `)
        navigate('/products');
      }
    } catch (err: any) {
      setError('Ошибка входа. Проверьте имя и пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="username" className={styles.label}>Имя пользователя</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={styles.input}
          placeholder="Введите имя"
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
          placeholder="Введите пароль"
          required
        />
      </div>

      <button
        type="submit"
        className="button"
        disabled={isLoading}
      >
        {isLoading ? 'Вход...' : 'Войти'}
      </button>
    </form>

  )

}