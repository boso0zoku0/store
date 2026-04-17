import styles from "./About.module.css"

export default function About() {

  return (
    <div className={styles.page}>
      <header className={styles.header}>Шапка</header>
      <aside className={styles.sidebar}>Боковая панель</aside>
      <main className={styles.main}>Основной контент</main>
      <aside className={styles.rightbar}>Правая панель</aside>
      <footer className={styles.footer}>Подвал</footer>
    </div>
  )
}