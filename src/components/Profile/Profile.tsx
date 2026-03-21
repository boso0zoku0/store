import styles from './Profile.module.css'

export default function Profile() {


  return (
    <div className={styles.avatarWrapper}>
      <img
        src="https://png.pngtree.com/thumb_back/fh260/background/20230516/pngtree-avatar-of-a-man-wearing-sunglasses-image_2569096.jpg"
        alt="Профиль"
        className={styles.avatar}
      />
      <span className={styles.tooltip}>Профиль</span>
    </div>
  )
}