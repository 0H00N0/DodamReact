import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { createRent } from '../Product/api/rentApi';
import styles from './Cart.module.css';

export default function Cart() {
  const navigate = useNavigate();
  const {
    items, totalItems, totalAmount,
    removeFromCart, updateQuantity, clearCart
  } = useCart();

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) removeFromCart(item.id);
    else updateQuantity(item.id, newQuantity);
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니를 모두 비우시겠습니까?')) clearCart();
  };
  const handleContinueShopping = () => navigate('/');
  const handleProductClick = (item) => navigate(`/products/${item.id}`);

  const handleCheckout = async () => {
    if (!totalItems) return;
    if (!window.confirm('장바구니의 상품을 주문하시겠습니까?')) return;

    const tasks = [];
    for (const it of items) {
      const pronum = it.id;
      const qty = Number(it.quantity) || 1;
      for (let i = 0; i < qty; i++) tasks.push(createRent(pronum));
    }
    try {
      await Promise.all(tasks);
      clearCart();
      navigate('/orders');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || '주문에 실패했습니다.';
      alert(msg);
    }
  };

  const getOptionsText = (sel) => {
    if (!sel || !Object.keys(sel).length) return '';
    const map = {
      colors: '색상', sizes: '사이즈', types: '타입', sets: '세트',
      editions: '에디션', languages: '언어', levels: '난이도',
      models: '모델', materials: '재질'
    };
    return Object.entries(sel).map(([k, v]) => `${map[k] || k}: ${v}`).join(', ');
  };

  return (
    <div className="member-page">
      <div className={`m-card wide ${styles.cartCard}`}>
        {/* 상단 타이틀/액션 */}
        <div className={styles.headerBar}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>장바구니</h1>
            <span className="m-muted">{totalItems}개의 상품</span>
          </div>
          {totalItems > 0 && (
            <button className="m-btn ghost" onClick={handleClearCart}>전체 삭제</button>
          )}
        </div>

        {/* 본문: 리스트 + 요약(같은 카드 내부) */}
        {totalItems > 0 ? (
          <div className={styles.cardGrid}>
            {/* 상품 리스트 */}
            <div className={styles.itemsList}>
              {items.map((item, idx) => (
                <article key={`${item.cartnum ?? item.id}-${idx}`} className={styles.cartItem}>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                    aria-label="상품 삭제"
                    title="삭제"
                  >
                    ×
                  </button>

                  <div
                    className={styles.itemImage}
                    onClick={() => handleProductClick(item.id)}
                    role="button"
                    title="상품 보기"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className={styles.imagePlaceholder} />
                    )}
                  </div>

                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName} onClick={() => handleProductClick(item.id)}>
                      {item.name}
                    </h3>
                    {getOptionsText(item.selectedOptions) && (
                      <p className="m-muted" style={{ margin: 0 }}>
                        {getOptionsText(item.selectedOptions)}
                      </p>
                    )}
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
                        <span className={styles.price}>₩{item.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.quantitySection}>
                    <div className={styles.quantityControl}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        aria-label="수량 감소"
                      >
                        –
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        aria-label="수량 증가"
                      >
                        +
                      </button>
                    </div>
                    <div className={styles.subtotal}>
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* 주문 요약(오른쪽) */}
            <aside className={styles.summaryBox}>
              <h3 className="m-title" style={{ marginBottom: 12 }}>주문 요약</h3>

              <div className={styles.summaryRow}>
                <span>상품 금액</span>
                <span>₩{totalAmount.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>배송비</span><span>무료</span>
              </div>
              <div className={styles.summaryDivider} />

              <div className={styles.summaryRow}>
                <span className={styles.totalLabel}>총 결제 금액</span>
                <span className={styles.totalAmount}>₩{totalAmount.toLocaleString()}</span>
              </div>

              <div className="m-actions" style={{ marginTop: 12, flexDirection: 'column' }}>
                <button className="m-btn" style={{ width: '100%' }} onClick={handleCheckout}>
                  주문하기
                </button>
                <button className="m-btn ghost" style={{ width: '100%' }} onClick={handleContinueShopping}>
                  쇼핑 계속하기
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>🛒</div>
            <h2 style={{ margin: '0 0 6px' }}>장바구니가 비어있습니다</h2>
            <p className="m-muted" style={{ margin: 0 }}>원하는 상품을 장바구니에 담아보세요!</p>
            <div className="m-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button className="m-btn" onClick={handleContinueShopping}>상품 둘러보기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
