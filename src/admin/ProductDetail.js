
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
          {/* ✅ 대표 이미지 */}
          {product.images && product.images.length > 0 && product.images[0].prourl && (
            <img 
              src={product.images[0].prourl}
              alt={product.proname}
              className="detail-image"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}

          <div className="detail-summary">
            <span className="detail-brand">{product.probrand}</span>
            <h1>{product.proname}</h1>
            {/* ✅ 상품 가격 → 대여 가격으로 교체 */}
            <p className="detail-price">{product.proborrow.toLocaleString()}원</p>
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

        {/* ✅ 상세 이미지 영역 */}
        {product.images && product.images.some(img => img.prodetailimage) && (
          <div className="detail-section">
            <h3>상세 이미지</h3>
            <div className="detail-images-grid">
              {product.images.map((img, idx) =>
                img.prodetailimage ? (
                  <img
                    key={idx}
                    src={img.prodetailimage}
                    alt={`상세 이미지 ${idx + 1}`}
                    className="detail-image"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
