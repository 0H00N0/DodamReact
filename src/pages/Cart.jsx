import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import styles from './Cart.module.css';

/**
 * 장바구니 페이지
 */
const Cart = () => {
  const navigate = useNavigate();
  const { 
    items, 
    totalItems, 
    totalAmount, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();

  // 수량 변경 핸들러
  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item);
    } else {
      updateQuantity(item.id, item.selectedOptions, newQuantity);
    }
  };

  // 아이템 제거
  const handleRemoveItem = (item) => {
    removeFromCart(item.id, item.selectedOptions);
  };

  // 전체 장바구니 비우기
  const handleClearCart = () => {
    if (window.confirm('장바구니를 모두 비우시겠습니까?')) {
      clearCart();
    }
  };

  // 쇼핑 계속하기
  const handleContinueShopping = () => {
    navigate('/');
  };

  // 상품 상세 페이지로 이동
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // 주문하기 (임시)
  const handleCheckout = () => {
    alert('주문 기능은 준비 중입니다!');
  };

  // 옵션 텍스트 생성
  const getOptionsText = (selectedOptions) => {
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
      return '';
    }
    
    return Object.entries(selectedOptions)
      .map(([key, value]) => {
        const labelMap = {
          colors: '색상',
          sizes: '사이즈',
          types: '타입',
          sets: '세트',
          editions: '에디션',
          languages: '언어',
          levels: '난이도',
          models: '모델',
          materials: '재질'
        };
        return `${labelMap[key] || key}: ${value}`;
      })
      .join(', ');
  };

  return (
    <div className={styles.cartPage}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>장바구니</h1>
          <span className={styles.itemCount}>
            {totalItems}개의 상품
          </span>
        </div>
        
        {totalItems > 0 && (
          <button 
            onClick={handleClearCart}
            className={styles.clearBtn}
          >
            전체 삭제
          </button>
        )}
      </div>

      {/* 장바구니 내용 */}
      {totalItems > 0 ? (
        <div className={styles.cartContent}>
          {/* 상품 목록 */}
          <div className={styles.itemsList}>
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className={styles.cartItem}>
                {/* 상품 이미지 */}
                <div 
                  className={styles.itemImage}
                  onClick={() => handleProductClick(item.id)}
                >
                  <img src={item.image} alt={item.name} />
                </div>

                {/* 상품 정보 */}
                <div className={styles.itemInfo}>
                  <h3 
                    className={styles.itemName}
                    onClick={() => handleProductClick(item.id)}
                  >
                    {item.name}
                  </h3>
                  
                  {/* 선택된 옵션 */}
                  {getOptionsText(item.selectedOptions) && (
                    <p className={styles.itemOptions}>
                      {getOptionsText(item.selectedOptions)}
                    </p>
                  )}

                  {/* 가격 */}
                  <div className={styles.itemPrice}>
                    {item.originalPrice !== item.price ? (
                      <>
                        <span className={styles.originalPrice}>
                          ₩{item.originalPrice.toLocaleString()}
                        </span>
                        <span className={styles.discountPrice}>
                          ₩{item.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className={styles.price}>
                        ₩{item.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* 수량 조절 */}
                <div className={styles.quantitySection}>
                  <div className={styles.quantityControl}>
                    <button 
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      className={styles.quantityBtn}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      className={styles.quantityBtn}
                    >
                      +
                    </button>
                  </div>
                  
                  {/* 소계 */}
                  <div className={styles.subtotal}>
                    ₩{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <button 
                  onClick={() => handleRemoveItem(item)}
                  className={styles.removeBtn}
                  aria-label="상품 삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* 주문 요약 */}
          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>주문 요약</h3>
            
            <div className={styles.summaryRow}>
              <span>상품 금액</span>
              <span>₩{totalAmount.toLocaleString()}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>배송비</span>
              <span>무료</span>
            </div>
            
            <div className={styles.summaryDivider}></div>
            
            <div className={styles.summaryRow}>
              <span className={styles.totalLabel}>총 결제 금액</span>
              <span className={styles.totalAmount}>
                ₩{totalAmount.toLocaleString()}
              </span>
            </div>

            <button 
              onClick={handleCheckout}
              className={styles.checkoutBtn}
            >
              주문하기
            </button>

            <button 
              onClick={handleContinueShopping}
              className={styles.continueBtn}
            >
              쇼핑 계속하기
            </button>
          </div>
        </div>
      ) : (
        /* 빈 장바구니 */
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2 className={styles.emptyTitle}>장바구니가 비어있습니다</h2>
          <p className={styles.emptyDescription}>
            원하는 상품을 장바구니에 담아보세요!
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

export default Cart;