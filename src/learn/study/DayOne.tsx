import styles from "./DayOne.module.css"


export default function DayOne() {


  return (
    <div>
      <h3 className={styles.styleText}>Этот текст должен быть сверху слева</h3>
      <img src={"https://ichip.ru/blobimgs/uploads/2019/06/surf.jpg"} alt={"pictOne"} className={styles.styleImage}/>
      <img src={"https://ichip.ru/blobimgs/uploads/2019/06/surf.jpg"} alt={"pictOne"} className={styles.styleImage}/>
      <form className={styles.styleForm}>
        <input className={styles.styleInput}/>
        <button className={styles.styleBtn}>button</button>
      </form>

    </div>
  )
}