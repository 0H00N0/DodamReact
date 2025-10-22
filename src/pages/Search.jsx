// src/pages/Search.jsx  (네가 준 컴포넌트 파일 대체)
import React, { useEffect, useMemo, useState } from "react";
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

// 프리셋
const AGE_PRESETS = [
  { label: "전체", v: [null, null] },
  { label: "0–2세", v: [0, 2] },
  { label: "3–5세", v: [3, 5] },
  { label: "6–8세", v: [6, 8] },
  { label: "9–12세", v: [9, 12] },
];
const PRICE_PRESETS = [
  { label: "전체", v: [null, null] },
  { label: "~ 20,000", v: [0, 20000] },
  { label: "20,000 ~ 50,000", v: [20000, 50000] },
  { label: "50,000 ~ 100,000", v: [50000, 100000] },
  { label: "100,000+", v: [100000, null] },
];

const Search = () => {
  const navigate = useNavigate();
  const { keyword } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // /search?q=... 로 들어온 경우 리다이렉트 (기존 동작 유지)
  useEffect(() => {
    const q = searchParams.get("q");
    if (!keyword && q) navigate(`/search/${encodeURIComponent(q)}?${searchParams.toString()}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, searchParams, navigate]);

  // 폼 입력 상태(상단 검색창)
  const [query, setQuery] = useState(keyword || "");

  // 필터 상태 (URL <-> 상태 동기화)
  const [ageMin, setAgeMin] = useState(null);
  const [ageMax, setAgeMax] = useState(null);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [sort, setSort] = useState("RECENT");

  // 로딩/데이터
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // 최초/URL 변경 시 URL -> state 반영
  useEffect(() => {
    const sp = new URLSearchParams(searchParams);
    const readNum = (k) => {
      const v = sp.get(k);
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    setAgeMin(readNum("ageMin"));
    setAgeMax(readNum("ageMax"));
    setPriceMin(readNum("priceMin"));
    setPriceMax(readNum("priceMax"));
    setSort(sp.get("sort") || "RECENT");
  }, [searchParams]);

  // 서버 호출 파라미터 메모
  const fetchArgs = useMemo(() => {
    return {
      q: keyword || "",
      ageMin,
      ageMax,
      priceMin,
      priceMax,
      sort,
      page: 0,
      size: 24,
    };
  }, [keyword, ageMin, ageMax, priceMin, priceMax, sort]);

  // 주소 파라미터/키워드 바뀔 때마다 검색
  useEffect(() => {
    const run = async () => {
      const q = keyword || "";
      setQuery(q);
      if (!q) { setItems([]); setTotal(0); return; }

      setIsLoading(true);
      try {
        const pageResp = await searchProductsByName(fetchArgs);
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
  }, [keyword, fetchArgs]);

  // 상단 검색 폼 제출
  const onSubmit = (e) => {
    e.preventDefault();
    const q = (query || "").trim();
    if (!q) return;
    // 현재 필터/정렬 유지하여 이동
    const next = new URLSearchParams(searchParams);
    next.delete("q"); // path param으로 대체
    navigate(`/search/${encodeURIComponent(q)}?${next.toString()}`);
  };

  // 칩/셀렉트 조작 시 URL 동기화
  const applyFilters = (next = {}) => {
    const sp = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") sp.delete(k);
      else sp.set(k, String(v));
    });
    // keyword 유지
    const path = `/search/${encodeURIComponent(keyword || query || "")}`;
    navigate(`${path}?${sp.toString()}`, { replace: false });
  };

  // 프리셋 핸들러
  const onAgePreset = ([min, max]) => {
    applyFilters({ ageMin: min, ageMax: max });
  };
  const onPricePreset = ([min, max]) => {
    applyFilters({ priceMin: min, priceMax: max });
  };
  const onSortChange = (e) => {
    applyFilters({ sort: e.target.value });
  };

  const activeAge = `${ageMin ?? ""}-${ageMax ?? ""}`;
  const activePrice = `${priceMin ?? ""}-${priceMax ?? ""}`;

  const handleProductClick = (id) => navigate(`/products/${id}`);

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

        {/* 🔽 필터 바 추가 */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>연령대</span>
            <div className={styles.chips}>
              {AGE_PRESETS.map(p => {
                const key = `${p.v[0] ?? ""}-${p.v[1] ?? ""}`;
                const active = key === activeAge;
                return (
                  <button
                    key={p.label}
                    type="button"
                    className={`${styles.chip} ${active ? styles.active : ""}`}
                    onClick={() => onAgePreset(p.v)}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>가격대</span>
            <div className={styles.chips}>
              {PRICE_PRESETS.map(p => {
                const key = `${p.v[0] ?? ""}-${p.v[1] ?? ""}`;
                const active = key === activePrice;
                return (
                  <button
                    key={p.label}
                    type="button"
                    className={`${styles.chip} ${active ? styles.active : ""}`}
                    onClick={() => onPricePreset(p.v)}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.filterGroupRight}>
            <label className={styles.filterLabel} htmlFor="sortSel">정렬</label>
            <select id="sortSel" value={sort} onChange={onSortChange} className={styles.select}>
              <option value="RECENT">최신순</option>
              <option value="PRICE_ASC">가격↑</option>
              <option value="PRICE_DESC">가격↓</option>
            </select>
          </div>
        </div>

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
