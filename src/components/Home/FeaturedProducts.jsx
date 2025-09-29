// components/Home/FeaturedProducts.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPopularProducts } from '../MainProductApi';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductCard from '../Product/ProductCard';
import styles from './FeaturedProducts.module.css';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 인기상품 로드
  useEffect(() => {
    let on = true;
    setLoading(true);
    fetchPopularProducts(12)
      .then(res => {
        if (!on) return;
        const list = Array.isArray(res.data) ? res.data : [];
        // DTO → ProductCard props로 어댑트
        const adapted = list.map(p => ({
          id:       p.proId ?? p.id ?? p.proid,
          name:     p.name ?? p.proname ?? "상품명",
          price:    p.price ?? null,
          image:    p.imageUrl ?? p.proimg ?? p.image ?? "/images/placeholder.png",
          // 없는 필드 기본값
          discountPrice: null,
          discountRate:  null,
          rating:    0,
          reviewCount: p.rentCount ?? 0, // 대여수(rentCount)를 리뷰수 비슷하게 표기 가능
        }));
        setItems(adapted);
      })
      .catch(e => {
        console.error("[FeaturedProducts] popular fetch error:", e);
        setItems([]);
      })
      .finally(() => on && setLoading(false));
    return () => { on = false; };
  }, []);

  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleAddToCart = useCallback((productId) => {
    addToCart({ id: productId, quantity: 1 });
  }, [addToCart]);

  const handleWishlist = useCallback((productId) => {
    toggleWishlist(productId);
  }, [toggleWishlist]);

  const title = "인기 추천 상품";
  const sub = "많은 부모님들이 선택한 베스트 장난감을 만나보세요";

  if (loading) {
    return (
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{sub}</p>
          </div>
          <div className={styles.productsGrid}>
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{sub}</p>
        </div>

        <div className={styles.productsGrid}>
          {items.map(product => (
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
          <button className={styles.viewAllButton} onClick={()=>navigate('/products')}>
            모든 상품 보기
            <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
