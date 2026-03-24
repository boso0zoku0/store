import { useState, useEffect } from 'react';
import styles from './Login.module.css';

export default function Stars() {
const [stars, setStars] = useState<Array<{id: number; top: number; left: number; size: number; delay: number}>>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5
    }));
    setStars(generatedStars);
  }, []);

  return (
    <>
      {stars.map(star => (
        <div
          key={star.id}
          className={styles.star}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
    </>
  );
}