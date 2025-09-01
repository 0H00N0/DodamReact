import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/Product/ProductCard';
import styles from './Wishlist.module.css';

/**
 * 찜 목록 페이지
 */
const Wishlist = () => {
  const navigate = useNavigate();
  const { items, totalItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  // 상품 카드 클릭 핸들러
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // 장바구니 추가 핸들러
  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
  };

  // 찜 목록에서 제거
  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  // 전체 찜 목록 비우기
  const handleClearWishlist = () => {
    if (window.confirm('찜 목록을 모두 삭제하시겠습니까?')) {
      clearWishlist();
    }
  };

  // 쇼핑 계속하기
  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className={styles.wishlistPage}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>찜 목록</h1>
          <span className={styles.itemCount}>
            {totalItems}개의 상품
          </span>
        </div>
        
        {totalItems > 0 && (
          <button 
            onClick={handleClearWishlist}
            className={styles.clearBtn}
          >
            전체 삭제
          </button>
        )}
      </div>

      {/* 찜 목록 내용 */}
      {totalItems > 0 ? (
        <>
          {/* 상품 목록 */}
          <div className={styles.productGrid}>
            {items.map(item => (
              <div key={item.id} onClick={() => handleProductClick(item.id)}>
                <ProductCard
                  id={item.id}
                  name={item.name}
                  price={item.originalPrice}
                  discountPrice={item.price !== item.originalPrice ? item.price : null}
                  image={item.image}
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                  onAddToCart={handleAddToCart}
                  onWishlist={handleRemoveFromWishlist}
                  isWishlisted={true}
                />
              </div>
            ))}
          </div>

          {/* 액션 버튼들 */}
          <div className={styles.actions}>
            <button 
              onClick={handleContinueShopping}
              className={styles.continueBtn}
            >
              쇼핑 계속하기
            </button>
          </div>
        </>
      ) : (
        /* 빈 찜 목록 */
        <div className={styles.emptyWishlist}>
          <div className={styles.emptyIcon}>♡</div>
          <h2 className={styles.emptyTitle}>찜한 상품이 없습니다</h2>
          <p className={styles.emptyDescription}>
            마음에 드는 상품을 찜해보세요!<br />
            나중에 쉽게 찾아볼 수 있습니다.
          </p>
          <button 
            onClick={handleContinueShopping}
            className={styles.shopBtn}
          >
            상품 둘러보기
          </button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;