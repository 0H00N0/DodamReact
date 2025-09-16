
import React, { useState, useMemo, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ProductProvider, useProduct } from './contexts/ProductContext';
import './Admin.css'; // We will add new styles here

const ProductForm = React.lazy(() => import('./ProductForm'));

// Product Detail Modal
function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{product.productName}</h2>
        <div className="product-detail-content">
            <img src={`/images/${product.imageName}`} alt={product.productName} className="product-detail-image"/>
            <div className="product-detail-info">
                <p><strong>ID:</strong> {product.productId}</p>
                <p><strong>카테고리:</strong> {product.category.categoryName}</p>
                <p><strong>브랜드:</strong> {product.brand.brandName}</p>
                <p><strong>가격:</strong> {product.price.toLocaleString()}원</p>
                <p><strong>재고:</strong> {product.stockQuantity}</p>
                <p><strong>상태:</strong> {product.status}</p>
                <p><strong>설명:</strong> {product.description}</p>
                <p><strong>등록일:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        <div className="admin-modal-actions">
          <button className="admin-btn secondary" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

function ProductList() {
  const { products, updateProduct, deleteProduct } = useProduct();
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState({ key: 'productId', order: 'asc' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filtering
    if (filter !== 'ALL') {
      result = result.filter(p => p.status === filter);
    }

    // Sorting
    result.sort((a, b) => {
      const valA = a[sort.key];
      const valB = b[sort.key];
      if (valA < valB) return sort.order === 'asc' ? -1 : 1;
      if (valA > valB) return sort.order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, filter, sort]);

  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ key, order: 'asc' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      deleteProduct(id);
    }
  };

  const handleStatusChange = (productId, newStatus) => {
    const product = products.find(p => p.productId === productId);
    if (product) {
      updateProduct(productId, { ...product, status: newStatus });
    }
  };

  return (
    <div className="product-management">
      <h2>상품 관리</h2>
      <div className="toolbar">
        <button
          className="admin-btn primary"
          onClick={() => navigate('/admin/products/new')}
        >
          상품 등록
        </button>
        <div className="filters">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">모든 상태</option>
                <option value="ACTIVE">판매중</option>
                <option value="INACTIVE">판매중지</option>
                <option value="OUT_OF_STOCK">품절</option>
            </select>
        </div>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('productId')}>ID {sort.key === 'productId' && (sort.order === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('productName')}>상품명 {sort.key === 'productName' && (sort.order === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('price')}>가격 {sort.key === 'price' && (sort.order === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => handleSort('stockQuantity')}>재고 {sort.key === 'stockQuantity' && (sort.order === 'asc' ? '▲' : '▼')}</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedProducts.map(product => (
            <tr key={product.productId} onClick={() => setSelectedProduct(product)} style={{cursor: 'pointer'}}>
              <td>{product.productId}</td>
              <td>{product.productName}</td>
              <td>{product.price.toLocaleString()}원</td>
              <td>{product.stockQuantity}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <select value={product.status} onChange={(e) => handleStatusChange(product.productId, e.target.value)}>
                    <option value="ACTIVE">판매중</option>
                    <option value="INACTIVE">판매중지</option>
                    <option value="OUT_OF_STOCK">품절</option>
                </select>
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <button
                  className="admin-btn secondary"
                  onClick={() => navigate(`/admin/products/edit/${product.productId}`)}
                >
                  수정
                </button>
                <button
                  className="admin-btn danger"
                  onClick={() => handleDelete(product.productId)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}

function ProductManagement() {
  return (
    <ProductProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/new" element={<ProductForm />} />
          <Route path="/edit/:id" element={<ProductForm />} />
        </Routes>
      </Suspense>
    </ProductProvider>
  );
}

export default ProductManagement;
