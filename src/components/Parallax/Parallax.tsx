import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import styles from './Parallax.module.css';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger, useGSAP);

export default function Layers() {
  const main = useRef<HTMLDivElement>(null);
  const scrollTween = useRef<gsap.core.Tween | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const panelsRef = useRef<HTMLElement[]>([]);

  const goToSection = (index: number) => {
    if (scrollTween.current) return;

    setCurrentIndex(index);

    scrollTween.current = gsap.to(window, {
      ease: 'power2.inOut',
      scrollTo: {
        y: index * window.innerHeight,
        autoKill: false,
      },
      duration: 1.2,
      overwrite: true,
      onComplete: () => {
        scrollTween.current = null;
      },
    });
  };

  const goThroughAllSections = () => {
    let i = 0;
    const total = panelsRef.current.length;

    const next = () => {
      if (i < total) {
        goToSection(i);
        i++;
        setTimeout(next, 1500); // пауза между прокрутками
      }
    };

    next();
  };

  useGSAP(
    () => {
      panelsRef.current = gsap.utils.toArray<HTMLElement>(`.${styles.section}`);

      // Создаем ScrollTrigger для каждой секции
      panelsRef.current.forEach((panel, i) => {
        ScrollTrigger.create({
          trigger: panel,
          start: 'top bottom',
          end: '+=200%',
        });
      });

      // Добавляем кнопку для автопрокрутки
      const button = document.createElement('button');
      button.textContent = 'Смотреть все фото';
      button.className = styles.autoPlayButton;
      button.onclick = goThroughAllSections;
      document.body.appendChild(button);

      return () => {
        button.remove();
      };
    },
    { scope: main }
  );

  return (
    <main className={`${styles.mainWrapper} ${styles.layers}`} ref={main}>
      <section className={`${styles.section} ${styles.description} ${styles.light}`}>
        <div>
          <h1 className={styles.textCenter}>Layered pinning</h1>
          <p>Use pinning to layer panels on top of each other as you scroll.</p>
          <div className={styles.scrollDown}>
            Scroll down<div className={styles.arrow}></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.blue}`}>
        <img
          src="https://assets.codepen.io/16327/portrait-number-1.png"
          alt="One"
        />
      </section>

      <section className={`${styles.section} ${styles.orange}`}>
        <img
          src="https://assets.codepen.io/16327/portrait-number-2.png"
          alt="Two"
        />
      </section>

      <section className={`${styles.section} ${styles.purple}`}>
        <img
          src="https://assets.codepen.io/16327/portrait-number-3.png"
          alt="Three"
        />
      </section>

      <section className={`${styles.section} ${styles.green}`}>
        <img
          src="https://assets.codepen.io/16327/portrait-number-4.png"
          alt="Four"
        />
      </section>
    </main>
  );
}