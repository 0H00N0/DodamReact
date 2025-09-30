import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { searchProductsByName } from "../components/MainProductApi";
import ProductCard from "../components/Product/ProductCard";
import styles from "./Search.module.css";

const normalizeImage = (url) => {
  if (!url) return "/placeholder.png";
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.REACT_APP_API_BASE || "";
  return base.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
};

const mapDtoToCard = (dto) => ({
  id: dto.id,
  name: dto.name,
  price: Number(dto.price ?? 0),
  discountPrice: null,
  discountRate: null,
  image: normalizeImage(dto.thumbnailUrl),
  rating: null,
  reviewCount: null,
});

const Search = () => {
  const navigate = useNavigate();
  const { keyword } = useParams();
  const [searchParams] = useSearchParams();

  // /search?q=... 로 들어온 경우 리다이렉트
  useEffect(() => {
    const q = searchParams.get("q");
    if (!keyword && q) navigate(`/search/${encodeURIComponent(q)}`, { replace: true });
  }, [keyword, searchParams, navigate]);

  const [query, setQuery] = useState(keyword || "");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // 주소 파라미터 바뀔 때마다 서버 검색
  useEffect(() => {
    const run = async () => {
      const q = keyword || "";
      setQuery(q);
      if (!q) { setItems([]); setTotal(0); return; }

      setIsLoading(true);
      try {
        const pageResp = await searchProductsByName({ q, sort: "RECENT", page: 0, size: 24 });
        const list = (pageResp?.content || []).map(mapDtoToCard);
        setItems(list);
        setTotal(pageResp?.totalElements ?? list.length);
      } catch (e) {
        console.error(e);
        setItems([]); setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [keyword]);

  const onSubmit = (e) => {
    e.preventDefault();
    const q = (query || "").trim();
    if (!q) return;
    navigate(`/search/${encodeURIComponent(q)}`);
  };

  const handleProductClick = (id) => navigate(`/product/${id}`);

  return (
    <div className={styles.searchPage}>
      <div className={styles.searchHeader}>
        <form onSubmit={onSubmit} className={styles.searchForm}>
          <input
            className={styles.searchInput}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품명을 입력하세요"
          />
          <button type="submit" className={styles.searchBtn}>검색</button>
        </form>

        {keyword && (
          <div className={styles.searchInfo}>
            <h1 className={styles.searchTitle}>‘{keyword}’ 검색 결과</h1>
            <p className={styles.resultCount}>{isLoading ? "검색 중..." : `총 ${total}개의 상품`}</p>
          </div>
        )}
      </div>

      <div className={styles.searchResults}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>검색 중...</p>
          </div>
        ) : !keyword ? (
          <div className={styles.noQuery}>
            <div className={styles.searchIcon}>🔍</div>
            <h2>상품명을 검색해보세요</h2>
          </div>
        ) : items.length > 0 ? (
          <div className={styles.productGrid}>
            {items.map((p) => (
              <div key={p.id} onClick={() => handleProductClick(p.id)}>
                <ProductCard
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  discountPrice={p.discountPrice}
                  discountRate={p.discountRate}
                  image={p.image}
                  rating={p.rating}
                  reviewCount={p.reviewCount}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>😔</div>
            <h2>검색 결과가 없습니다</h2>
            <p>다른 상품명으로 시도해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
