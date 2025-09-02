import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductsByCategory, getCategoryById, sortProducts, filterProductsByPrice, priceRanges, sortOptions } from '../utils/dummyData';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/Product/ProductCard';
import styles from './Category.module.css';

/**
 * 카테고리별 상품 목록 페이지
 */
const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 카테고리 데이터 로드
  useEffect(() => {
    const categoryData = getCategoryById(categoryId);
    const categoryProducts = getProductsByCategory(categoryId);
    
    if (categoryData) {
      setCategory(categoryData);
      setProducts(categoryProducts);
    }
    setIsLoading(false);
  }, [categoryId]);

  // 필터링 및 정렬 적용
  useEffect(() => {
    let filtered = [...products];

    // 가격 필터 적용
    if (selectedPriceRange) {
      filtered = filterProductsByPrice(filtered, selectedPriceRange);
    }

    // 정렬 적용
    filtered = sortProducts(filtered, sortBy);

    setFilteredProducts(filtered);
  }, [products, selectedPriceRange, sortBy]);

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

  // 필터 초기화
  const handleClearFilters = () => {
    setSelectedPriceRange(null);
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

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>상품을 불러오는 중...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className={styles.notFound}>
        <h2>카테고리를 찾을 수 없습니다</h2>
        <button onClick={() => navigate('/')} className={styles.goHomeBtn}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.categoryPage}>
      {/* 카테고리 헤더 */}
      <div className={styles.categoryHeader}>
        <div className={styles.categoryInfo}>
          <span className={styles.categoryIcon}>{category.icon}</span>
          <h1 className={styles.categoryName}>{category.name}</h1>
        </div>
        <p className={styles.productCount}>
          총 {filteredProducts.length}개의 상품
        </p>
      </div>

      {/* 필터 및 정렬 섹션 */}
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
        {(selectedPriceRange || sortBy !== 'popularity') && (
          <button 
            onClick={handleClearFilters}
            className={styles.clearFilters}
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 상품 목록 */}
      {filteredProducts.length > 0 ? (
        <div className={styles.productGrid}>
          {filteredProducts.map(product => (
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
        <div className={styles.noProducts}>
          <p>조건에 맞는 상품이 없습니다.</p>
          <button onClick={handleClearFilters} className={styles.resetBtn}>
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
};

export default Category;