import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPopularProducts, fetchReviewCountsByProductIds } from "../MainProductApi";
import ProductCard from "../Product/ProductCard";
import styles from "./FeaturedProducts.module.css";

// 화면 크기에 따라 보여줄 개수(데스크탑 9, 모바일 6, 중간 8)
function useVisibleCount() {
  const get = () => {
    if (window.matchMedia("(max-width: 768px)").matches) return 6;
    if (window.matchMedia("(min-width: 1024px)").matches) return 9;
    return 8;
  };
  const [count, setCount] = useState(get);
  useEffect(() => {
    const onResize = () => setCount(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return count;
}

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // ← 여기 오타 수정됨
  const visibleCount = useVisibleCount();

  useEffect(() => {
    let on = true;
    setLoading(true);
    fetchPopularProducts(12)
      .then(async (res) => {
        if (!on) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const adapted = list.map((p) => ({
          id: p.pronum ?? p.proId ?? p.id ?? p.proid,
          name: p.name ?? p.proname ?? "상품명",
          price: p.price ?? p.proprice ?? null,
          image: p.imageUrl ?? p.proimg ?? p.image ?? "/images/placeholder.png",
          reviewCount: 0,
        }));
        const ids = adapted.map((x) => x.id).filter((v) => v != null);
        const counts = await fetchReviewCountsByProductIds(ids);
        const merged = adapted.map((x) => ({
          ...x,
          reviewCount: Number(counts?.[String(x.id)] ?? 0),
        }));
        setItems(merged);
      })
      .catch((e) => {
        console.error("[FeaturedProducts] popular fetch error:", e);
        setItems([]);
      })
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, []);

   const handleProductClick = useCallback(
    (productId) => navigate(`/products/${productId}`),
    [navigate]
  );

  const title = "인기 추천 상품";
  const sub = "많은 부모님들이 선택한 베스트 장난감을 만나보세요";

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{sub}</p>
        </div>

        <div className={styles.productsGrid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))
            : items.slice(0, visibleCount).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  reviewCount={product.reviewCount}
                  onClick={handleProductClick}
                  className={styles.productCard}
                />
              ))}
        </div>

        <div className={styles.viewAllWrapper}>
          <button
            className={styles.viewAllButton}
            onClick={() => navigate("/products")}
          >
            모든 상품 보기 <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
