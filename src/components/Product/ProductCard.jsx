import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './ProductCard.module.css';

/** 하트/장바구니/별점 제거 + 리뷰 개수만 표시 + 외부 className 병합 + 안전 가격 렌더링 */
const ProductCard = React.memo(({
  id,
  name,
  price,
  discountPrice,
  discountRate,
  image,
  reviewCount = 0,
  onClick,
  className
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ✅ 가격 안전 계산 (null/undefined도 처리)
  const priceInfo = useMemo(() => {
    const hasPrice = typeof price === 'number' && !Number.isNaN(price);
    const hasDisc  = typeof discountPrice === 'number' && !Number.isNaN(discountPrice);
    const final    = hasDisc ? discountPrice : (hasPrice ? price : null);
    const discounted = hasDisc && hasPrice && discountPrice < price;
    return { finalPrice: final, hasDiscount: discounted, hasPrice };
  }, [price, discountPrice]);

  const fmt = (n) => (typeof n === 'number' && Number.isFinite(n)) ? n.toLocaleString() : null;

  const handleCardClick = useCallback(() => {
    if (onClick) onClick(id);
  }, [onClick, id]);

  return (
    <div className={`${styles.productCard} ${className || ''}`} onClick={handleCardClick}>
      {/* 이미지 */}
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
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(true); }}
          />
        )}

        {/* 할인율 배지는 유지 */}
        {priceInfo.hasDiscount && discountRate ? (
          <div className={styles.discountBadge}>-{discountRate}%</div>
        ) : null}
      </div>

      {/* 정보 */}
      <div className={styles.productInfo}>
        <h3 className={styles.productName} title={name}>{name}</h3>

        {/* ✅ 리뷰 개수만 */}
        <div className={styles.reviewOnlyRow}>
          리뷰 {Number.isFinite(reviewCount) ? reviewCount : 0}개
        </div>

        {/* ✅ 가격 안전 렌더링 */}
        <div className={styles.priceContainer}>
          {priceInfo.hasDiscount ? (
            <>
              <span className={styles.originalPrice}>
                {fmt(price) ? `₩${fmt(price)}` : '가격 미정'}
              </span>
              <span className={styles.discountPrice}>
                {fmt(priceInfo.finalPrice) ? `₩${fmt(priceInfo.finalPrice)}` : '가격 미정'}
              </span>
            </>
          ) : (
            <span className={styles.price}>
              {fmt(priceInfo.finalPrice) ? `₩${fmt(priceInfo.finalPrice)}` : '가격 미정'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number,
  discountPrice: PropTypes.number,
  discountRate: PropTypes.number,
  image: PropTypes.string.isRequired,
  reviewCount: PropTypes.number,
  onClick: PropTypes.func,
  className: PropTypes.string
};

ProductCard.defaultProps = { reviewCount: 0 };

export default ProductCard;
