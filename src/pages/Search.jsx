import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchProducts, sortProducts, filterProductsByPrice, priceRanges, sortOptions, categories } from '../utils/dummyData';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/Product/ProductCard';
import styles from './Search.module.css';

/**
 * 검색 결과 페이지
 */
const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 검색 실행
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    // 실제로는 API 호출이지만 여기서는 더미 데이터 사용
    setTimeout(() => {
      const results = searchProducts(query);
      setSearchResults(results);
      setIsLoading(false);
    }, 300);
  };

  // URL 파라미터에서 검색어 변경 감지
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    performSearch(query);
  }, [searchParams]);

  // 필터링 및 정렬 적용
  useEffect(() => {
    let filtered = [...searchResults];

    // 카테고리 필터 적용
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // 가격 필터 적용
    if (selectedPriceRange) {
      filtered = filterProductsByPrice(filtered, selectedPriceRange);
    }

    // 정렬 적용
    filtered = sortProducts(filtered, sortBy);

    setFilteredResults(filtered);
  }, [searchResults, selectedCategory, selectedPriceRange, sortBy]);

  // 검색어 입력 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  // 정렬 변경 핸들러
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  // 가격 필터 변경 핸들러
  const handlePriceFilterChange = (priceRange) => {
    setSelectedPriceRange(
      selectedPriceRange?.id === priceRange.id ? null : priceRange
    );
  };

  // 카테고리 필터 변경 핸들러
  const handleCategoryFilterChange = (categoryId) => {
    setSelectedCategory(
      selectedCategory === categoryId ? null : categoryId
    );
  };

  // 필터 초기화
  const handleClearFilters = () => {
    setSelectedPriceRange(null);
    setSelectedCategory(null);
    setSortBy('popularity');
  };

  // 상품 카드 클릭 핸들러
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // 장바구니 추가 핸들러
  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
  };

  // 찜하기 핸들러
  const handleWishlist = (productId) => {
    toggleWishlist(productId);
  };

  const hasActiveFilters = selectedPriceRange || selectedCategory || sortBy !== 'popularity';

  return (
    <div className={styles.searchPage}>
      {/* 검색 헤더 */}
      <div className={styles.searchHeader}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상품을 검색해보세요..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>
            검색
          </button>
        </form>

        {searchQuery && (
          <div className={styles.searchInfo}>
            <h1 className={styles.searchTitle}>
              '{searchQuery}' 검색 결과
            </h1>
            <p className={styles.resultCount}>
              {isLoading ? '검색 중...' : `총 ${filteredResults.length}개의 상품`}
            </p>
          </div>
        )}
      </div>

      {/* 검색 결과가 있을 때만 필터 섹션 표시 */}
      {searchResults.length > 0 && (
        <div className={styles.filterSection}>
          {/* 정렬 옵션 */}
          <div className={styles.sortOptions}>
            <label htmlFor="sort-select" className={styles.sortLabel}>정렬:</label>
            <select 
              id="sort-select"
              value={sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
              className={styles.sortSelect}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 카테고리 필터 */}
          <div className={styles.categoryFilter}>
            <span className={styles.filterLabel}>카테고리:</span>
            <div className={styles.categoryButtons}>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`${styles.categoryButton} ${
                    selectedCategory === category.id ? styles.active : ''
                  }`}
                  onClick={() => handleCategoryFilterChange(category.id)}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 가격 필터 */}
          <div className={styles.priceFilter}>
            <span className={styles.filterLabel}>가격대:</span>
            <div className={styles.priceButtons}>
              {priceRanges.map(range => (
                <button
                  key={range.id}
                  className={`${styles.priceButton} ${
                    selectedPriceRange?.id === range.id ? styles.active : ''
                  }`}
                  onClick={() => handlePriceFilterChange(range)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* 필터 초기화 */}
          {hasActiveFilters && (
            <button 
              onClick={handleClearFilters}
              className={styles.clearFilters}
            >
              필터 초기화
            </button>
          )}
        </div>
      )}

      {/* 검색 결과 */}
      <div className={styles.searchResults}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>검색 중...</p>
          </div>
        ) : !searchQuery ? (
          <div className={styles.noQuery}>
            <div className={styles.searchIcon}>🔍</div>
            <h2>상품을 검색해보세요</h2>
            <p>원하는 상품명을 입력하여 검색할 수 있습니다.</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className={styles.productGrid}>
            {filteredResults.map(product => (
              <div key={product.id} onClick={() => handleProductClick(product.id)}>
                <ProductCard
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
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>😔</div>
            <h2>검색 결과가 없습니다</h2>
            <p>
              '{searchQuery}'에 대한 검색 결과를 찾을 수 없습니다.<br />
              다른 검색어로 시도해보세요.
            </p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className={styles.resetBtn}>
                필터 초기화
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;