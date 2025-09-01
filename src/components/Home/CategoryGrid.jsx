import React, { useMemo } from 'react';
import styles from './CategoryGrid.module.css';

const CategoryGrid = React.memo(() => {
  const categories = useMemo(() => [
    {
      id: 1,
      name: '인형 & 피규어',
      icon: '🧸',
      description: '아이들의 상상력을 키우는 다양한 인형들',
      itemCount: '124+'
    },
    {
      id: 2,
      name: '블록 & 조립',
      icon: '🧩',
      description: '창의력과 사고력을 기르는 블록 장난감',
      itemCount: '89+'
    },
    {
      id: 3,
      name: '교육완구',
      icon: '📚',
      description: '학습과 놀이를 동시에 즐기는 교육 장난감',
      itemCount: '156+'
    },
    {
      id: 4,
      name: '액션피규어',
      icon: '🦸',
      description: '역동적인 놀이를 위한 액션 피규어',
      itemCount: '67+'
    },
    {
      id: 5,
      name: '미니카 & 탈것',
      icon: '🚗',
      description: '다양한 탈것 장난감으로 모험을 떠나요',
      itemCount: '92+'
    },
    {
      id: 6,
      name: '예술 & 공예',
      icon: '🎨',
      description: '창작 활동으로 예술적 감각을 키워요',
      itemCount: '78+'
    }
  ], []);

  return (
    <section className={styles.categorySection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>인기 카테고리</h2>
          <p className={styles.subtitle}>
            아이의 관심사와 연령에 맞는 완벽한 장난감을 찾아보세요
          </p>
        </div>
        
        <div className={styles.grid}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryCard}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{category.icon}</span>
              </div>
              <h3 className={styles.categoryName}>{category.name}</h3>
              <p className={styles.categoryDescription}>{category.description}</p>
              <div className={styles.itemCount}>{category.itemCount} 상품</div>
              <button className={styles.categoryButton}>
                둘러보기
                <span className={styles.arrow}>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

CategoryGrid.displayName = 'CategoryGrid';

export default CategoryGrid;