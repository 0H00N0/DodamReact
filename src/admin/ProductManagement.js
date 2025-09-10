// src/admin/ProductManagement.js
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

const ProductForm = React.lazy(() => import('./ProductForm'));

function ProductList() {
  const { getAllProducts, deleteProduct } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await getAllProducts();
        setProducts(productData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAllProducts]);

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(product => product.pronum !== id));
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-spinner">
          <div className="spinner"></div>
          <span>상품 데이터 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management">
      <h2>상품 관리</h2>
      <button
        className="admin-btn primary"
        onClick={() => navigate('/admin/products/new')}
      >
        상품 등록
      </button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>상품명</th>
            <th>카테고리</th>
            <th>가격</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.pronum}>
              <td>{product.pronum}</td>
              <td>{product.proname}</td>
              <td>{product.category?.catename}</td>
              <td>{product.proprice?.toLocaleString()}원</td>
              <td>{product.prostat}</td>
              <td>
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
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/new" element={<ProductForm />} />
        <Route path="/edit/:id" element={<ProductForm />} />
      </Routes>
    </Suspense>
  );
}

export default ProductManagement;