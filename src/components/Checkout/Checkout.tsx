import {useState} from "react";

import styles from './Checkout.module.css';

interface Payload {
  firstName: string,
  lastName: string,
  email: string,
  city: string,
  street: string,
  postalCode: string,
}

export default function Checkout() {
  const [formData, setFormData] = useState<Payload>({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    street: '',
    postalCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Данные:', formData);
    // здесь отправка на сервер
  };

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.title}>Оформление заказа</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Имя</label>
            <input
              className={styles.input}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Иван"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Фамилия</label>
            <input
              className={styles.input}
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Иванов"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ivan@example.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Город</label>
          <input
            className={styles.input}
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Москва"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Улица, дом, квартира</label>
          <input
            className={styles.input}
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="ул. Тверская, д. 1, кв. 10"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Почтовый индекс</label>
          <input
            className={styles.input}
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="123456"
          />
        </div>

        <button type="submit" className={styles.submitBtn}>
          Подтвердить заказ
        </button>
      </form>
    </div>
  );
}