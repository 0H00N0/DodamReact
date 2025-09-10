// ProductManagement.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

function ProductManagement() {
  const { getAllProducts, getAllCategories, createProduct, updateProduct, deleteProduct } = useAdmin();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 상품 및 카테고리 목록 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);
        setProducts(productData);
        setCategories(categoryData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAllProducts, getAllCategories]);

  // 상품 등록/수정 폼 데이터 상태
  const [formData, setFormData] = useState({
    proname: '',
    catenum: '',
    proprice: '',
    prorent: '',
    prodepos: '',
    prolatfe: '',
    probrand: '',
    promanuf: '',
    prosafe: '',
    prograd: '',
    proagfr: '',
    proagto: '',
    promind: '',
    prostat: 'AVAILABLE',
    proispu: true,
    prodetai1: ''
  });

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 상품 등록
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await createProduct(formData);
      setProducts([...products, { pronum: response.id, ...formData }]);
      resetForm();
      navigate('/admin/products');
    } catch (error) {
      // 오류 처리
    }
  };

  // 상품 삭제
  const handleDeleteProduct = async (id) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(product => product.pronum !== id));
      } catch (error) {
        // 오류 처리
      }
    }
  };

  // 상품 수정 페이지 이동
  const handleEditProduct = (product) => {
    setFormData({
      proname: product.proname || '',
      catenum: product.category?.catenum || '',
      proprice: product.proprice || '',
      prorent: product.prorent || '',
      prodepos: product.prodepos || '',
      prolatfe: product.prolatfe || '',
      probrand: product.probrand || '',
      promanuf: product.promanuf || '',
      prosafe: product.prosafe || '',
      prograd: product.prograd || '',
      proagfr: product.proagfr || '',
      proagto: product.proagto || '',
      promind: product.promind || '',
      prostat: product.prostat || 'AVAILABLE',
      proispu: product.proispu !== undefined ? product.proispu : true,
      prodetai1: product.prodetai1 || ''
    });
    navigate(`/admin/products/edit/${product.pronum}`);
  };

  // 상품 수정
  const handleUpdateProduct = async (e, id) => {
    e.preventDefault();
    try {
      await updateProduct(id, formData);
      setProducts(products.map(product =>
        product.pronum === id ? { ...product, ...formData } : product
      ));
      resetForm();
      navigate('/admin/products');
    } catch (error) {
      // 오류 처리
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      proname: '',
      catenum: '',
      proprice: '',
      prorent: '',
      prodepos: '',
      prolatfe: '',
      probrand: '',
      promanuf: '',
      prosafe: '',
      prograd: '',
      proagfr: '',
      proagto: '',
      promind: '',
      prostat: 'AVAILABLE',
      proispu: true,
      prodetai1: ''
    });
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
    <Routes>
      {/* 상품 목록 */}
      <Route
        path="/"
        element={
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
                  <th>정가</th>
                  <th>대여가</th>
                  <th>상태</th>
                  <th>공개</th>
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
                    <td>{product.prorent?.toLocaleString()}원</td>
                    <td>{product.prostat}</td>
                    <td>{product.proispu ? '공개' : '비공개'}</td>
                    <td>
                      <button
                        className="admin-btn secondary"
                        onClick={() => handleEditProduct(product)}
                      >
                        수정
                      </button>
                      <button
                        className="admin-btn danger"
                        onClick={() => handleDeleteProduct(product.pronum)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
      {/* 상품 등록 */}
      <Route
        path="new"
        element={
          <ProductForm
            formData={formData}
            categories={categories}
            handleInputChange={handleInputChange}
            handleSubmit={handleCreateProduct}
            navigate={navigate}
            title="상품 등록"
          />
        }
      />
      {/* 상품 수정 */}
      <Route
        path="edit/:id"
        element={
          <ProductForm
            formData={formData}
            categories={categories}
            handleInputChange={handleInputChange}
            handleSubmit={handleUpdateProduct}
            navigate={navigate}
            title="상품 수정"
          />
        }
      />
    </Routes>
  );
}

// 상품 등록/수정 폼
function ProductForm({ formData, categories, handleInputChange, handleSubmit, navigate, title }) {
  const { id } = useParams(); // ✅ 여기서만 사용

  return (
    <div className="product-form">
      <h2>{title}</h2>
      <form onSubmit={(e) => handleSubmit(e, id)}> {/* ✅ id 전달 */}
        {/* 폼 필드들 (생략) */}
        <button type="submit" className="admin-btn primary">저장</button>
        <button
          type="button"
          className="admin-btn secondary"
          onClick={() => navigate('/admin/products')}
        >
          취소
        </button>
      </form>
    </div>
  );
}

export default ProductManagement;
