import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { createRent } from '../../Product/api/rentApi'; // ✅ 추가
import styles from './CartDropdown.module.css';

const CartDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { items, totalItems, totalAmount, removeFromCart, clearCart } = useCart(); // ✅ clearCart 추가
  const dropdownRef = useRef(null);
  const goDetail = (id) => {
        navigate(`/products/${id}`);   // ✅ 복수형 라우트로 통일
        onClose();
   };

  // 장바구니 페이지로 이동
  const handleGoToCart = () => {
    navigate('/cart');
    onClose();
  };

  // 상품 삭제
  const handleRemoveItem = (item) => {
    // removeFromCart는 pronum만 필요
    removeFromCart(item.id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ✅ 주문하기: 실제 주문 API 호출 + 장바구니 비우기 + /orders 이동
  const handleCheckout = async () => {
    if (!items.length) return;
    if (!window.confirm('장바구니의 상품을 주문하시겠습니까?')) return;

    try {
      // 드롭다운에는 수량 표시가 있으므로 수량만큼 생성
      const tasks = [];
      for (const it of items) {
        const qty = Number(it.quantity) || 1;
        for (let i = 0; i < qty; i++) tasks.push(createRent(it.id)); // id = pronum
      }
      await Promise.all(tasks);

      await clearCart();   // CartContext의 clearCart(아래 수정) 사용
      onClose();
      navigate('/orders');
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || '주문에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        ref={dropdownRef} 
        className={styles.dropdown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>장바구니</h3>
          <span className={styles.itemCount}>{totalItems}개 상품</span>
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyCart}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 22a1 1 0 100-2 1 1 0 000 2z"/>
              <path d="M20 22a1 1 0 100-2 1 1 0 000 2z"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            <p className={styles.emptyText}>장바구니가 비어있습니다</p>
            <button className={styles.shopButton} onClick={onClose}>
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <>
            <div className={styles.itemList}>
              {items.slice(0, 3).map((item, index) => (
                <div key={`${item.id}-${index}`} className={styles.cartItem}>
                  <div className={styles.itemImage} onClick={() => goDetail(item.id)} style={{cursor:'pointer'}}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }}
                      />
                    ) : <div className={styles.imagePlaceholder} /> }
                  </div>
                  
                  <div className={styles.itemInfo}>
                    <h4
                      className={styles.itemName}
                      onClick={() => goDetail(item.id)}
                      style={{cursor:'pointer'}}
                    >
                      {item.name}
                    </h4>
                    <p className={styles.itemPrice}>
                      ₩{item.price.toLocaleString()}
                    </p>
                    <p className={styles.itemQuantity}>수량: {item.quantity}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleRemoveItem(item)}
                    className={styles.removeButton}
                    aria-label="상품 제거"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6l-12 12M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
              {items.length > 3 && (
                <div className={styles.moreItems}>
                  +{items.length - 3}개의 상품이 더 있습니다
                </div>
              )}
            </div>

            <div className={styles.summary}>
              <div className={styles.totalPrice}>
                <span className={styles.totalLabel}>총 금액</span>
                <span className={styles.totalAmount}>
                  ₩{totalAmount.toLocaleString()}
                </span>
              </div>
              
              <div className={styles.actions}>
                <button 
                  onClick={handleGoToCart}
                  className={styles.cartButton}
                >
                  장바구니 보기
                </button>
                <button 
                  onClick={handleCheckout}
                  className={styles.checkoutButton}
                >
                  주문하기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDropdown;
