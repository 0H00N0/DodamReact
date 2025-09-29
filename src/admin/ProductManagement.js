import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

// 코드 스플리팅: ProductForm은 필요할 때만 로드합니다.
const ProductForm = React.lazy(() => import('./ProductForm'));
const ProductDetail = React.lazy(() => import('./ProductDetail')); // 👈 상세 컴포넌트 import
// 상품 목록을 보여주는 메인 컴포넌트
function ProductList() {
  const { getAllProducts, deleteProduct } = useAdmin(); // deleteProduct도 가져옵니다.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("상품 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [getAllProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        await deleteProduct(id);
        fetchProducts(); // 삭제 후 목록 새로고침
      } catch (error) {
        console.error("상품 삭제 실패:", error);
      }
    }
  };

  if (loading) return <div>상품 목록을 불러오는 중...</div>;

  return (
    <div className="product-management">
      <div className="page-header">
        <h2>상품 관리</h2>
        <button
          className="admin-btn primary"
          onClick={() => navigate('/admin/products/new')}
        >
          새 상품 등록
        </button>
      </div>
<table className="admin-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>상품명</th>
      <th>브랜드</th>
      <th>카테고리</th>
      <th>대여 가격</th> {/* ✅ 가격 → 대여가격 */}
      <th>상태</th>
      <th>등록일</th>
      <th>작업</th>
    </tr>
  </thead>
  <tbody>
    {products.map(product => (
      <tr key={product.pronum}>
        <td>{product.pronum}</td>
        <td>{product.proname}</td>
        <td>{product.probrand}</td>
        <td>{product.categoryName}</td>
        <td>{(product.proborrow || 0).toLocaleString()}원</td>
        <td>{product.productGrade}</td>
        <td>{product.procre ? new Date(product.procre).toLocaleDateString() : '-'}</td>
        <td>
          <button
            className="admin-btn info"
            onClick={() => navigate(`/admin/products/${product.pronum}`)}
          >
            상세
          </button>
          <button
            className="admin-btn secondary"
            onClick={() => navigate(`/admin/products/edit/${product.pronum}`)}
          >
            수정
          </button>
          <button
            className="admin-btn danger"
            onClick={() => handleDelete(product.pronum)}
          >
            삭제
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>


    </div>
  );
}

// ProductManagement는 이제 라우터 역할을 합니다.
function ProductManagement() {
  // ProductProvider는 App.js나 상위 Admin 컴포넌트에서 제공한다고 가정합니다.
  // 만약 여기서만 사용한다면 ProductProvider로 감싸야 합니다.
  return (
    <Suspense fallback={<div>페이지 로딩 중...</div>}>
      <Routes>
        <Route index element={<ProductList />} />
        <Route path="new" element={<ProductForm />} />
        <Route path="edit/:id" element={<ProductForm />} />
        <Route path=":id" element={<ProductDetail />} /> {/* 👈 상세 페이지 라우트 추가 */}
      </Routes>
    </Suspense>
  );
}

export default ProductManagement;