import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById } = useAdmin();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // API 기본 URL (환경변수에서 가져오거나 기본값 사용)
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("상품 상세 정보 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, getProductById]);

  if (loading) return <div>상세 정보를 불러오는 중...</div>;
  if (!product) return <div>상품 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="product-detail-container">
      <div className="page-header">
        <h2>상품 상세 정보</h2>
        <button className="admin-btn secondary" onClick={() => navigate('/admin/products')}>
          목록으로 돌아가기
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-main-info">
            {product.images && product.images.length > 0 && (
                <img 
                    src={`${API_BASE_URL}/images/${product.images[0].prourl}`} 
                    alt={product.proname}
                    className="detail-image"
                    onError={(e) => {
                      console.error('이미지 로드 실패:', e.target.src);
                      // 기본 이미지로 대체하거나 숨김 처리
                      e.target.style.display = 'none';
                    }}
                />
            )}
            <div className="detail-summary">
                <span className="detail-brand">{product.probrand}</span>
                <h1>{product.proname}</h1>
                <p className="detail-price">{product.proprice.toLocaleString()}원</p>
                <p><strong>카테고리:</strong> {product.categoryName}</p>
                <p><strong>상품 상태:</strong> {product.productGrade}</p>
                <p><strong>등록일:</strong> {new Date(product.procre).toLocaleString()}</p>
            </div>
        </div>
        
        <div className="detail-section">
            <h3>상세 설명</h3>
            <p>{product.prodetail || '상세 설명이 없습니다.'}</p>
        </div>

        <div className="detail-section">
            <h3>추가 정보</h3>
            <ul>
                <li><strong>상품 ID:</strong> {product.pronum}</li>
                <li><strong>제조사:</strong> {product.promade}</li>
                <li><strong>사용 연령:</strong> {product.proage}세 이상</li>
                <li><strong>안전 인증:</strong> {product.procertif}</li>
                <li><strong>출시일:</strong> {product.prodate}</li>
            </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;