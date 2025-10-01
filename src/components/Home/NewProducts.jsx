import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNewProducts, fetchReviewCountsByProductIds } from "../MainProductApi";
import ProductCard from "../Product/ProductCard";
import styles from "./FeaturedProducts.module.css";

// 화면 크기에 따라 보여줄 개수(데스크탑 9, 모바일 6)
function useVisibleCount() {
  const get = () => {
    if (window.matchMedia("(max-width: 768px)").matches) return 6;
    if (window.matchMedia("(min-width: 1024px)").matches) return 9;
    return 8; // 태블릿 등 중간 구간은 8로 타협
  };
  const [count, setCount] = useState(get);
  useEffect(() => {
    const onResize = () => setCount(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return count;
}

const NewProducts = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const visibleCount = useVisibleCount();

  useEffect(() => {
    let on = true;
    setLoading(true);
    fetchNewProducts(12)
      .then(async (res) => {
        if (!on) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const adapted = list.map((p) => ({
          id: p.pronum ?? p.proId ?? p.id ?? p.proid,
          name: p.proname ?? p.name ?? "상품명",
          price: p.proprice ?? p.price ?? null,
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
        console.error("[NewProducts] new fetch error:", e);
        setItems([]);
      })
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, []);

  const goDetail = useCallback((id) => navigate(`/product/${id}`), [navigate]);

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>신상품</h2>
          <p className={styles.subtitle}>가장 최근에 입고된 장난감을 만나보세요</p>
        </div>

        <div className={styles.productsGrid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))
            : items.slice(0, visibleCount).map((it) => (
                <ProductCard
                  key={it.id}
                  id={it.id}
                  name={it.name}
                  price={it.price}
                  image={it.image}
                  reviewCount={it.reviewCount}
                  onClick={goDetail}
                  className={styles.productCard}
                />
              ))}
        </div>

        <div className={styles.viewAllWrapper}>
          <button
            className={styles.viewAllButton}
            onClick={() => navigate("/products?sort=new")}
          >
            신상품 모두 보기 <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewProducts;
