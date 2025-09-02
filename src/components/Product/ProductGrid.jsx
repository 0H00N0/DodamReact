import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

/**
 * 상품 그리드 레이아웃 컴포넌트
 * @param {Object} props - 그리드 props
 * @param {Array} props.products - 상품 배열
 * @param {Function} props.onAddToCart - 장바구니 추가 함수
 * @param {Function} props.onWishlist - 위시리스트 토글 함수
 * @param {Array} props.wishlistedItems - 위시리스트에 담긴 상품 ID 배열
 * @param {number} props.columns - 컬럼 수 (기본값: 자동)
 * @param {string} props.gap - 그리드 간격 (기본값: 'normal')
 * @param {boolean} props.loading - 로딩 상태
 * @param {string} props.className - 추가 CSS 클래스
 */
const ProductGrid = React.memo(({
  products = [],
  onAddToCart,
  onWishlist,
  wishlistedItems = [],
  columns,
  gap = 'normal',
  loading = false,
  className = ''
}) => {
  // 로딩 스켈레톤 생성 - useMemo로 최적화
  const loadingSkeleton = useMemo(() => {
    const skeletonCount = 8; // 기본 8개 스켈레톤
    return Array.from({ length: skeletonCount }, (_, index) => (
      <div key={`skeleton-${index}`} className={styles.skeletonCard}>
        <div className={styles.skeletonImage}></div>
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonRating}></div>
          <div className={styles.skeletonPrice}></div>
        </div>
      </div>
    ));
  }, []);

  // 빈 상태 렌더링 - useMemo로 최적화
  const emptyState = useMemo(() => (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>📦</div>
      <h3 className={styles.emptyTitle}>상품이 없습니다</h3>
      <p className={styles.emptyDescription}>
        조건에 맞는 상품을 찾을 수 없습니다.
      </p>
    </div>
  ), []);

  // 그리드 스타일 계산 - useMemo로 최적화
  const gridStyle = useMemo(() => {
    const style = {};
    
    if (columns) {
      style['--grid-columns'] = columns;
    }
    
    if (gap) {
      const gapValues = {
        'tight': '12px',
        'normal': '20px',
        'wide': '32px'
      };
      style['--grid-gap'] = gapValues[gap] || gap;
    }
    
    return style;
  }, [columns, gap]);

  const gridClasses = useMemo(() => [
    styles.productGrid,
    gap && styles[`gap${gap.charAt(0).toUpperCase() + gap.slice(1)}`],
    className
  ].filter(Boolean).join(' '), [gap, className]);

  return (
    <div className={styles.gridContainer}>
      {loading ? (
        <div 
          className={gridClasses}
          style={gridStyle}
        >
          {loadingSkeleton}
        </div>
      ) : products.length === 0 ? (
        emptyState
      ) : (
        <div 
          className={gridClasses}
          style={gridStyle}
        >
          {products.map((product) => (
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
              onAddToCart={onAddToCart}
              onWishlist={onWishlist}
              isWishlisted={wishlistedItems.includes(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    discountPrice: PropTypes.number,
    discountRate: PropTypes.number,
    image: PropTypes.string.isRequired,
    rating: PropTypes.number,
    reviewCount: PropTypes.number
  })),
  onAddToCart: PropTypes.func,
  onWishlist: PropTypes.func,
  wishlistedItems: PropTypes.arrayOf(PropTypes.string),
  columns: PropTypes.number,
  gap: PropTypes.oneOf(['tight', 'normal', 'wide']),
  loading: PropTypes.bool,
  className: PropTypes.string
};

ProductGrid.defaultProps = {
  products: [],
  wishlistedItems: [],
  gap: 'normal',
  loading: false,
  className: ''
};

export default ProductGrid;