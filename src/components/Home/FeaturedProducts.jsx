import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { products } from '../../utils/dummyData';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductCard from '../Product/ProductCard';
import styles from './FeaturedProducts.module.css';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // 인기 상품 선택 (평점과 리뷰 수 기준)
  const featuredProducts = useMemo(() => {
    return products
      .sort((a, b) => {
        const scoreA = a.rating * Math.log(a.reviewCount + 1);
        const scoreB = b.rating * Math.log(b.reviewCount + 1);
        return scoreB - scoreA;
      })
      .slice(0, 6);
  }, []);

  // 상품 카드 클릭 핸들러
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // 장바구니 추가 핸들러
  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
  };

  // 찜하기 핸들러
  const handleWishlist = (productId) => {
    toggleWishlist(productId);
  };

  // 모든 상품 보기
  const handleViewAll = () => {
    navigate('/');
  };

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>인기 추천 상품</h2>
          <p className={styles.subtitle}>
            많은 부모님들이 선택한 베스트 장난감을 만나보세요
          </p>
        </div>

        <div className={styles.productsGrid}>
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              discountPrice={product.discountPrice}
              discountRate={product.discountRate}
              image={product.image}
              rating={product.rating}
              reviewCount={product.reviewCount}
              onAddToCart={handleAddToCart}
              onWishlist={handleWishlist}
              isWishlisted={isInWishlist(product.id)}
              onClick={handleProductClick}
            />
          ))}
        </div>

        <div className={styles.viewAllWrapper}>
          <button className={styles.viewAllButton} onClick={handleViewAll}>
            모든 상품 보기
            <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;