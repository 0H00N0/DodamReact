import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './ProductCard.module.css';

/**
 * 재사용 가능한 상품 카드 컴포넌트
 * @param {Object} props - 상품 정보 props
 * @param {string} props.id - 상품 ID
 * @param {string} props.name - 상품명
 * @param {number} props.price - 원가
 * @param {number} props.discountPrice - 할인가 (선택사항)
 * @param {number} props.discountRate - 할인율 (선택사항)
 * @param {string} props.image - 상품 이미지 URL
 * @param {number} props.rating - 평점 (1-5)
 * @param {number} props.reviewCount - 리뷰 개수
 * @param {Function} props.onAddToCart - 장바구니 추가 함수
 * @param {Function} props.onWishlist - 위시리스트 추가 함수
 * @param {boolean} props.isWishlisted - 위시리스트 상태
 */
const ProductCard = React.memo(({
  id,
  name,
  price,
  discountPrice,
  discountRate,
  image,
  rating = 0,
  reviewCount = 0,
  onAddToCart,
  onWishlist,
  isWishlisted = false,
  onClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 별점 렌더링 - 성능 최적화를 위해 useMemo 사용
  const stars = useMemo(() => {
    const starsArray = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsArray.push(<span key={i} className={styles.starFull}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        starsArray.push(<span key={i} className={styles.starHalf}>☆</span>);
      } else {
        starsArray.push(<span key={i} className={styles.starEmpty}>☆</span>);
      }
    }
    return starsArray;
  }, [rating]);

  // 가격 계산 - useMemo로 최적화
  const priceInfo = useMemo(() => ({
    finalPrice: discountPrice || price,
    hasDiscount: discountPrice && discountPrice < price
  }), [price, discountPrice]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleWishlistClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlist) {
      onWishlist(id);
    }
  }, [onWishlist, id]);

  const handleAddToCartClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(id);
    }
  }, [onAddToCart, id]);

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick(id);
    }
  }, [onClick, id]);

  return (
    <div className={styles.productCard} onClick={handleCardClick}>
      {/* 상품 이미지 영역 */}
      <div className={styles.imageContainer}>
        {!imageLoaded && !imageError && (
          <div className={styles.imagePlaceholder}>
            <div className={styles.loadingSpinner}></div>
          </div>
        )}
        
        {imageError ? (
          <div className={styles.imageError}>
            <span>이미지를 불러올 수 없습니다</span>
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            className={`${styles.productImage} ${imageLoaded ? styles.loaded : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* 할인율 배지 */}
        {priceInfo.hasDiscount && discountRate && (
          <div className={styles.discountBadge}>
            -{discountRate}%
          </div>
        )}

        {/* 위시리스트 버튼 */}
        <button
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlistClick}
          aria-label="위시리스트에 추가"
        >
          <span className={styles.heartIcon}>
            {isWishlisted ? '♥' : '♡'}
          </span>
        </button>

        {/* 호버 시 장바구니 버튼 */}
        <div className={styles.hoverActions}>
          <button
            className={styles.addToCartBtn}
            onClick={handleAddToCartClick}
            aria-label="장바구니에 추가"
          >
            장바구니 담기
          </button>
        </div>
      </div>

      {/* 상품 정보 영역 */}
      <div className={styles.productInfo}>
        <h3 className={styles.productName} title={name}>
          {name}
        </h3>

        {/* 평점 */}
        <div className={styles.ratingContainer}>
          <div className={styles.stars}>
            {stars}
          </div>
          <span className={styles.ratingText}>
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* 가격 */}
        <div className={styles.priceContainer}>
          {priceInfo.hasDiscount ? (
            <>
              <span className={styles.originalPrice}>
                ₩{price.toLocaleString()}
              </span>
              <span className={styles.discountPrice}>
                ₩{priceInfo.finalPrice.toLocaleString()}
              </span>
            </>
          ) : (
            <span className={styles.price}>
              ₩{priceInfo.finalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  discountPrice: PropTypes.number,
  discountRate: PropTypes.number,
  image: PropTypes.string.isRequired,
  rating: PropTypes.number,
  reviewCount: PropTypes.number,
  onAddToCart: PropTypes.func,
  onWishlist: PropTypes.func,
  isWishlisted: PropTypes.bool,
  onClick: PropTypes.func
};

ProductCard.defaultProps = {
  rating: 0,
  reviewCount: 0,
  isWishlisted: false
};

export default ProductCard;