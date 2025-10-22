import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

const ProductForm = React.lazy(() => import('./ProductForm'));
const ProductDetail = React.lazy(() => import('./ProductDetail'));

function ProductList() {
  const { getAllProducts, deleteProduct } = useAdmin();
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
        fetchProducts();
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
            <th>대여 가격</th>
            <th>상태</th>
            <th>등록일</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.pronum}>
              <td>{product.pronum}</td>
              <td>{product.proname}</td>
              <td>{product.probrand}</td>
              <td>{product.categoryName}</td>
              <td>{(product.proborrow || 0).toLocaleString()}원</td>
              <td>{product.productGrade}</td>
              <td>
                {product.procre
                  ? new Intl.DateTimeFormat('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    }).format(new Date(product.procre))
                  : '-'}
              </td>
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

function ProductManagement() {
  return (
    <Routes>
      <Route index element={<ProductList />} />
      <Route
        path="new"
        element={
          <Suspense fallback={<div>새 상품 등록 페이지 로딩 중...</div>}>
            <ProductForm />
          </Suspense>
        }
      />
      <Route
        path="edit/:id"
        element={
          <Suspense fallback={<div>상품 수정 페이지 로딩 중...</div>}>
            <ProductForm />
          </Suspense>
        }
      />
      <Route
        path=":id"
        element={
          <Suspense fallback={<div>상품 상세 페이지 로딩 중...</div>}>
            <ProductDetail />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default ProductManagement;
