import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getCategoryById } from '../utils/dummyData';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import styles from './ProductDetail.module.css';

/**
 * 상품 상세 페이지 컴포넌트
 */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 상품 데이터 로드
  useEffect(() => {
    const productData = getProductById(id);
    if (productData) {
      setProduct(productData);
      // 첫 번째 옵션들을 기본 선택
      if (productData.options) {
        const defaultOptions = {};
        Object.keys(productData.options).forEach(key => {
          if (productData.options[key].length > 0) {
            defaultOptions[key] = productData.options[key][0];
          }
        });
        setSelectedOptions(defaultOptions);
      }
    }
    setIsLoading(false);
  }, [id]);

  // 상품 이미지 (더미 데이터이므로 같은 이미지 여러 개)
  const productImages = useMemo(() => {
    if (!product) return [];
    return [
      product.image,
      product.image, // 실제로는 다른 각도 이미지
      product.image  // 실제로는 다른 각도 이미지
    ];
  }, [product]);

  // 최종 가격 계산
  const finalPrice = useMemo(() => {
    if (!product) return 0;
    return product.discountPrice || product.price;
  }, [product]);

  // 옵션 변경 핸들러
  const handleOptionChange = (optionType, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: value
    }));
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // 장바구니 담기
  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedOptions);
    alert(`${product.name}이(가) 장바구니에 담겼습니다!`);
  };

  // 찜하기 토글
  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
  };

  // 즉시 구매 (장바구니로 이동)
  const handleBuyNow = () => {
    addToCart(product.id, quantity, selectedOptions);
    navigate('/cart');
  };

  // 카테고리로 이동
  const handleCategoryClick = () => {
    if (product.category) {
      navigate(`/category/${product.category}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>상품 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>상품을 찾을 수 없습니다</h2>
        <button onClick={() => navigate('/')} className={styles.goHomeBtn}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const category = getCategoryById(product.category);
  const currentQuantityInCart = getItemQuantity(product.id, selectedOptions);
  const isWished = isInWishlist(product.id);

  return (
    <div className={styles.productDetail}>
      {/* 상품 이미지 섹션 */}
      <div className={styles.imageSection}>
        <div className={styles.mainImage}>
          <img 
            src={productImages[activeImageIndex]} 
            alt={product.name}
            className={styles.productImage}
          />
          {product.discountRate && (
            <div className={styles.discountBadge}>
              -{product.discountRate}%
            </div>
          )}
        </div>
        
        {productImages.length > 1 && (
          <div className={styles.thumbnails}>
            {productImages.map((image, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${index === activeImageIndex ? styles.active : ''}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 상품 정보 섹션 */}
      <div className={styles.infoSection}>
        {/* 카테고리 */}
        {category && (
          <button 
            className={styles.categoryTag}
            onClick={handleCategoryClick}
          >
            {category.icon} {category.name}
          </button>
        )}

        {/* 상품명 */}
        <h1 className={styles.productName}>{product.name}</h1>

        {/* 평점 */}
        <div className={styles.ratingSection}>
          <div className={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <span 
                key={i} 
                className={`${styles.star} ${i < Math.floor(product.rating) ? styles.filled : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className={styles.ratingText}>
            {product.rating.toFixed(1)} ({product.reviewCount}개 리뷰)
          </span>
        </div>

        {/* 가격 */}
        <div className={styles.priceSection}>
          {product.discountPrice ? (
            <>
              <span className={styles.originalPrice}>
                ₩{product.price.toLocaleString()}
              </span>
              <span className={styles.discountPrice}>
                ₩{finalPrice.toLocaleString()}
              </span>
            </>
          ) : (
            <span className={styles.price}>
              ₩{finalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* 상품 설명 */}
        <div className={styles.description}>
          <p>{product.description}</p>
        </div>

        {/* 특징 */}
        {product.features && product.features.length > 0 && (
          <div className={styles.features}>
            <h3>주요 특징</h3>
            <ul>
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 옵션 선택 */}
        {product.options && Object.keys(product.options).length > 0 && (
          <div className={styles.optionsSection}>
            <h3>옵션 선택</h3>
            {Object.entries(product.options).map(([optionType, options]) => (
              <div key={optionType} className={styles.optionGroup}>
                <label className={styles.optionLabel}>
                  {optionType === 'colors' ? '색상' :
                   optionType === 'sizes' ? '사이즈' :
                   optionType === 'types' ? '타입' :
                   optionType === 'sets' ? '세트' :
                   optionType === 'editions' ? '에디션' :
                   optionType === 'languages' ? '언어' :
                   optionType === 'levels' ? '난이도' :
                   optionType === 'models' ? '모델' :
                   optionType === 'materials' ? '재질' : optionType}
                </label>
                <div className={styles.optionButtons}>
                  {options.map((option) => (
                    <button
                      key={option}
                      className={`${styles.optionButton} ${
                        selectedOptions[optionType] === option ? styles.selected : ''
                      }`}
                      onClick={() => handleOptionChange(optionType, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 수량 및 재고 */}
        <div className={styles.quantitySection}>
          <div className={styles.quantityControl}>
            <label className={styles.quantityLabel}>수량</label>
            <div className={styles.quantityButtons}>
              <button 
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className={styles.quantityBtn}
              >
                -
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                className={styles.quantityBtn}
              >
                +
              </button>
            </div>
          </div>
          <div className={styles.stockInfo}>
            <span className={`${styles.stockText} ${product.stock < 10 ? styles.lowStock : ''}`}>
              재고: {product.stock}개
            </span>
            {currentQuantityInCart > 0 && (
              <span className={styles.cartQuantity}>
                장바구니에 {currentQuantityInCart}개
              </span>
            )}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className={styles.actionButtons}>
          <button 
            onClick={handleWishlistToggle}
            className={`${styles.wishlistBtn} ${isWished ? styles.wishlisted : ''}`}
            aria-label={isWished ? '찜 목록에서 제거' : '찜 목록에 추가'}
          >
            {isWished ? '♥' : '♡'}
          </button>
          
          <button 
            onClick={handleAddToCart}
            className={styles.addToCartBtn}
            disabled={product.stock === 0}
          >
            장바구니 담기
          </button>
          
          <button 
            onClick={handleBuyNow}
            className={styles.buyNowBtn}
            disabled={product.stock === 0}
          >
            바로 구매
          </button>
        </div>

        {/* 품절 메시지 */}
        {product.stock === 0 && (
          <div className={styles.outOfStock}>
            <p>죄송합니다. 현재 품절된 상품입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;