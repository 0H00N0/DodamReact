import React, { useState, useEffect } from 'react';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 슬라이드 데이터
  const slides = [
    {
      id: 1,
      theme: 'astronaut',
      title: '우주 비행사의 꿈',
      subtitle: '광활한 우주를 탐험하며 새로운 별을 발견하는 꿈',
      description: '로켓을 타고 우주를 여행하며 별들과 친구가 되어보세요',
      icons: ['🚀', '⭐', '🌙', '🛸'],
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      theme: 'princess',
      title: '공주님의 꿈',
      subtitle: '마법의 성에서 모든 이들을 행복하게 만드는 꿈',
      description: '아름다운 성에서 마법봉을 휘두르며 모두를 웃게 만들어요',
      icons: ['🏰', '👑', '🪄', '✨'],
      bgGradient: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)'
    },
    {
      id: 3,
      theme: 'explorer',
      title: '탐험가의 꿈',
      subtitle: '미지의 땅을 탐험하며 숨겨진 보물을 찾는 꿈',
      description: '나침반과 지도를 들고 신비로운 모험을 떠나보세요',
      icons: ['🗺️', '🧭', '💎', '⛰️'],
      bgGradient: 'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)'
    },
    {
      id: 4,
      theme: 'artist',
      title: '예술가의 꿈',
      subtitle: '아름다운 그림과 음악으로 세상을 물들이는 꿈',
      description: '색색깔 물감과 아름다운 선율로 마음을 표현해보세요',
      icons: ['🎨', '🖌️', '🎵', '🎭'],
      bgGradient: 'linear-gradient(135deg, #fd79a8 0%, #a29bfe 100%)'
    }
  ];

  // 자동 슬라이드 전환 (4초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // 이전 슬라이드로 이동
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // 다음 슬라이드로 이동
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // 특정 슬라이드로 이동
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className={styles.hero}>
      <div 
        className={styles.slideBackground}
        style={{ background: currentSlideData.bgGradient }}
      />
      
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <div className={styles.slideIndicator}>
              <span className={styles.dreamLabel}>Dream {currentSlide + 1}</span>
            </div>
            
            <h1 className={styles.title}>
              {currentSlideData.title}
            </h1>
            
            <p className={styles.subtitle}>
              {currentSlideData.subtitle}
            </p>
            
            <p className={styles.description}>
              {currentSlideData.description}
            </p>
            
            <div className={styles.buttonGroup}>
              <button className={styles.primaryButton}>
                꿈 실현하기
              </button>
              <button className={styles.secondaryButton}>
                더 많은 꿈 보기
              </button>
            </div>
          </div>
          
          <div className={styles.imageContent}>
            <div className={styles.dreamCard}>
              <div className={styles.iconGrid}>
                {currentSlideData.icons.map((icon, index) => (
                  <div 
                    key={index} 
                    className={`${styles.iconBlock} ${styles[`icon${index + 1}`]}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
              
              <div className={styles.dreamGlow} />
            </div>
          </div>
        </div>
      </div>
      
      {/* 슬라이드 네비게이션 - container 밖으로 이동 */}
      <div className={styles.slideNavigation}>
        <button 
          className={styles.navButton}
          onClick={prevSlide}
          aria-label="이전 슬라이드"
        >
          ←
        </button>
        
        <div className={styles.dotNavigation}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
        
        <button 
          className={styles.navButton}
          onClick={nextSlide}
          aria-label="다음 슬라이드"
        >
          →
        </button>
      </div>
    </section>
  );
};

export default HeroSection;