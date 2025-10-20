// src/pages/Cart.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { createRent } from '../Product/api/rentApi';
import styles from './Cart.module.css';

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

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item);
    } else {
      // ✅ pronum(id), 최종 수량만 전달
      updateQuantity(item.id, newQuantity);
    }
  };

  // ✅ pronum(id) 기준 삭제
  const handleRemoveItem = (item) => {
    removeFromCart(item.id);
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니를 모두 비우시겠습니까?')) {
      clearCart();
    }
  };

  const handleContinueShopping = () => navigate('/');
  const handleProductClick = (productId) => navigate(`/product/${productId}`);

  // ✅ 변경: 실제 주문 호출
  const handleCheckout = async () => {
    if (totalItems === 0) return;
    if (!window.confirm('장바구니의 상품을 주문하시겠습니까?')) return;

    // 장바구니의 각 아이템(id=pronum)을 수량만큼 주문 생성
    const tasks = [];
    for (const it of items) {
      const pronum = it.id;                 // CartContext에서 id=pronum
      const qty = Number(it.quantity) || 1; // 수량이 2면 2번 생성
      for (let i = 0; i < qty; i++) tasks.push(createRent(pronum));
    }

    try {
      await Promise.all(tasks);
      clearCart();
      navigate('/orders'); // 주문내역 페이지로 이동
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || '주문에 실패했습니다.';
      alert(msg);
    }
  };

  const getOptionsText = (selectedOptions) => {
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) return '';
    const labelMap = {
      colors: '색상', sizes: '사이즈', types: '타입', sets: '세트',
      editions: '에디션', languages: '언어', levels: '난이도',
      models: '모델', materials: '재질'
    };
    return Object.entries(selectedOptions)
      .map(([k, v]) => `${labelMap[k] || k}: ${v}`)
      .join(', ');
  };

  return (
    <div className={styles.cartPage}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>장바구니</h1>
          <span className={styles.itemCount}>{totalItems}개의 상품</span>
        </div>

        {totalItems > 0 && (
          <button onClick={handleClearCart} className={styles.clearBtn}>
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
              <div key={`${item.cartnum ?? item.id}-${index}`} className={styles.cartItem}>
                {/* 상품 이미지 */}
                <div className={styles.itemImage} onClick={() => handleProductClick(item.id)}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className={styles.imagePlaceholder} />
                  )}
                </div>

                {/* 상품 정보 */}
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName} onClick={() => handleProductClick(item.id)}>
                    {item.name}
                  </h3>

                  {getOptionsText(item.selectedOptions) && (
                    <p className={styles.itemOptions}>{getOptionsText(item.selectedOptions)}</p>
                  )}

                  <div className={styles.itemPrice}>
                    {item.originalPrice !== item.price ? (
                      <>
                        <span className={styles.originalPrice}>₩{item.originalPrice.toLocaleString()}</span>
                        <span className={styles.discountPrice}>₩{item.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className={styles.price}>₩{item.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* 수량 조절 */}
                <div className={styles.quantitySection}>
                  <div className={styles.quantityControl}>
                    <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className={styles.quantityBtn}>-</button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className={styles.quantityBtn}>+</button>
                  </div>

                  <div className={styles.subtotal}>₩{(item.price * item.quantity).toLocaleString()}</div>
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
              <span className={styles.totalAmount}>₩{totalAmount.toLocaleString()}</span>
            </div>

            <button onClick={handleCheckout} className={styles.checkoutBtn}>주문하기</button>
            <button onClick={handleContinueShopping} className={styles.continueBtn}>쇼핑 계속하기</button>
          </div>
        </div>
      ) : (
        /* 빈 장바구니 */
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2 className={styles.emptyTitle}>장바구니가 비어있습니다</h2>
          <p className={styles.emptyDescription}>원하는 상품을 장바구니에 담아보세요!</p>
          <button onClick={handleContinueShopping} className={styles.shopBtn}>상품 둘러보기</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
