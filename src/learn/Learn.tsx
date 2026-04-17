import styles from "./learn.module.css"

export const LeftSidebar = () => {
  return (
    <div className={styles.grid}>
      {/* Левый сайдбар с каналами */}
      <div className={styles.leftSidebar}>
        <h2 className={styles.header}>Отслеживаемое</h2>
        <div className={styles.containerContent}>
          <button className={styles.button}>
            <a className={styles.a} href="https://ya.ru/search/?text=%D1%84%D0%BE%D1%82%D0%BE+4r&lr=11164"/>
          </button>
        </div>
        <div className={styles.containerContent}>
          dw
        </div>
      </div>

      {/* Центр - видео/фото */}
      <img className={styles.contentImg} alt="stream"
           src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmEjwexSHmpeSqPqxoXn6ERXnCu12Bm2cmIw&s"/>

      {/* Правый сайдбар - чат */}
      <div className={styles.rightSidebar}>
        Чат
      </div>
    </div>
  )
}