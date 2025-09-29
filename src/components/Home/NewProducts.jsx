// components/Home/NewProducts.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNewProducts } from '../MainProductApi';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductCard from '../Product/ProductCard';
import styles from './FeaturedProducts.module.css'; // ✅ 동일 CSS 재사용

const NewProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let on = true;
    setLoading(true);
    fetchNewProducts(12)
      .then(res=>{
        if(!on) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const adapted = list.map(p => ({
          id:    p.proId ?? p.id ?? p.proid,
          name:  p.proname ?? p.name ?? "상품명",
          price: p.proprice ?? p.price ?? null,
          image: p.imageUrl ?? p.proimg ?? p.image ?? "/images/placeholder.png",
          rating: 0,
          reviewCount: 0,
          discountPrice: null,
          discountRate: null,
        }));
        setItems(adapted);
      })
      .catch(e=>{
        console.error("[NewProducts] new fetch error:", e);
        setItems([]);
      })
      .finally(()=>on && setLoading(false));
    return ()=>{ on = false; };
  },[]);

  const goDetail = useCallback((id)=>navigate(`/product/${id}`), [navigate]);
  const onAddToCart = useCallback((id)=>addToCart({id, quantity:1}), [addToCart]);
  const onWishlist = useCallback((id)=>toggleWishlist(id), [toggleWishlist]);

  // ✅ 신상품 전체 보기 버튼 핸들러
  const goAllNew = useCallback(() => {
    navigate('/products?sort=new');
  }, [navigate]);

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>신상품</h2>
          <p className={styles.subtitle}>가장 최근에 입고된 장난감을 만나보세요</p>
        </div>

        <div className={styles.productsGrid}>
          {loading
            ? Array.from({length:6}).map((_,i)=>(<div key={i} className={styles.skeletonCard} />))
            : items.map(it => (
                <ProductCard
                  key={it.id}
                  id={it.id}
                  name={it.name}
                  price={it.price}
                  discountPrice={it.discountPrice}
                  discountRate={it.discountRate}
                  image={it.image}
                  rating={it.rating}
                  reviewCount={it.reviewCount}
                  onAddToCart={onAddToCart}
                  onWishlist={onWishlist}
                  isWishlisted={isInWishlist(it.id)}
                  onClick={goDetail}
                />
              ))
          }
        </div>

        {/* ✅ 신상품 전체 보기 버튼 (Featured와 동일 스타일 재사용) */}
        <div className={styles.viewAllWrapper}>
          <button className={styles.viewAllButton} onClick={()=>navigate('/products?sort=new')}>
            {/*경로 수정 필요*/}
            신상품 모두 보기
            <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewProducts;
