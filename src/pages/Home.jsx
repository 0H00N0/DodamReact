import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import CategoryGrid from '../components/Home/CategoryGrid';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import ScrollNavigation from '../components/Home/ScrollNavigation';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homePage}>
      {/* 스크롤 네비게이션 */}
      <ScrollNavigation />
      
      {/* 메인 히어로 섹션 */}
      <section id="hero">
        <HeroSection />
      </section>
      
      {/* 카테고리 그리드 섹션 */}
      <section id="categories">
        <CategoryGrid />
      </section>
      
      {/* 추천 상품 섹션 */}
      <section id="featured">
        <FeaturedProducts />
      </section>
    </div>
  );
};

export default Home;