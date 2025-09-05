import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';

/**
 * 상품 관리 메인 컴포넌트
 */
function ProductManagement() {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/new" element={<ProductForm />} />
      <Route path="/edit/:id" element={<ProductForm />} />
      <Route path="/inventory" element={<InventoryManagement />} />
    </Routes>
  );
}

/**
 * 상품 목록 컴포넌트
 */
function ProductList() {
  const { addNotification } = useAdmin();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  // 상품 데이터 로드
  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockProducts = [
        {
          id: 1,
          name: '아이폰 15 Pro',
          category: '스마트폰',
          price: 1290000,
          stock: 45,
          status: 'active',
          image: '/images/iphone15.jpg',
          createdAt: new Date('2024-01-15')
        },
        {
          id: 2,
          name: '갤럭시 S24',
          category: '스마트폰',
          price: 1180000,
          stock: 32,
          status: 'active',
          image: '/images/galaxy-s24.jpg',
          createdAt: new Date('2024-01-10')
        },
        {
          id: 3,
          name: '맥북 프로 16인치',
          category: '노트북',
          price: 3290000,
          stock: 12,
          status: 'active',
          image: '/images/macbook-pro.jpg',
          createdAt: new Date('2024-01-08')
        },
        {
          id: 4,
          name: '에어팟 프로 2세대',
          category: '이어폰',
          price: 359000,
          stock: 0,
          status: 'out_of_stock',
          image: '/images/airpods-pro.jpg',
          createdAt: new Date('2024-01-05')
        },
        {
          id: 5,
          name: '아이패드 에어',
          category: '태블릿',
          price: 899000,
          stock: 28,
          status: 'inactive',
          image: '/images/ipad-air.jpg',
          createdAt: new Date('2024-01-03')
        }
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error('상품 로드 실패:', error);
      addNotification('상품 목록을 불러올 수 없습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 상품 삭제
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProducts(prev => prev.filter(p => p.id !== productId));
        addNotification('상품이 삭제되었습니다', 'success');
      } catch (error) {
        addNotification('상품 삭제에 실패했습니다', 'error');
      }
    }
  };

  // 상품 상태 변경
  const handleStatusChange = async (productId, newStatus) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, status: newStatus } : p
      ));
      addNotification('상품 상태가 변경되었습니다', 'success');
    } catch (error) {
      addNotification('상품 상태 변경에 실패했습니다', 'error');
    }
  };

  // 선택된 상품들 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    if (window.confirm(`선택된 ${selectedProducts.size}개 상품을 삭제하시겠습니까?`)) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
        setSelectedProducts(new Set());
        addNotification(`${selectedProducts.size}개 상품이 삭제되었습니다`, 'success');
      } catch (error) {
        addNotification('일괄 삭제에 실패했습니다', 'error');
      }
    }
  };

  // 상품 선택/해제
  const handleProductSelect = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  // 상태 색상 클래스
  const getStatusClass = (status) => {
    const statusClasses = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'out_of_stock': 'status-out-of-stock'
    };
    return statusClasses[status] || '';
  };

  // 숫자 포맷팅
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="product-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>상품 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management">
      {/* 페이지 헤더 */}
      <div className="page-header">
        <div className="header-content">
          <h1>상품 관리</h1>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/admin/products/new')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
              상품 등록
            </button>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              placeholder="상품명 검색..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">모든 카테고리</option>
            <option value="스마트폰">스마트폰</option>
            <option value="노트북">노트북</option>
            <option value="태블릿">태블릿</option>
            <option value="이어폰">이어폰</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="out_of_stock">재고없음</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder }));
            }}
          >
            <option value="name-asc">이름 오름차순</option>
            <option value="name-desc">이름 내림차순</option>
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
            <option value="stock-asc">재고 적은순</option>
            <option value="stock-desc">재고 많은순</option>
          </select>
        </div>

        {/* 일괄 작업 */}
        {selectedProducts.size > 0 && (
          <div className="bulk-actions">
            <span>{selectedProducts.size}개 상품 선택됨</span>
            <button className="btn-danger" onClick={handleBulkDelete}>
              선택된 상품 삭제
            </button>
          </div>
        )}
      </div>

      {/* 상품 테이블 */}
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedProducts.size === products.length && products.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>상품 정보</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>재고</th>
              <th>상태</th>
              <th>등록일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                  />
                </td>
                <td>
                  <div className="product-info">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p>ID: {product.id}</p>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td className="price">{formatCurrency(product.price)}</td>
                <td className={`stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                  {product.stock}개
                </td>
                <td>
                  <select
                    value={product.status}
                    onChange={(e) => handleStatusChange(product.id, e.target.value)}
                    className={`status-select ${getStatusClass(product.status)}`}
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="out_of_stock">재고없음</option>
                  </select>
                </td>
                <td>{product.createdAt.toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      title="수정"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteProduct(product.id)}
                      title="삭제"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 7v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M10 11v6M14 11v6M4 7h16" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 더미 컴포넌트 (실제 구현 시 교체)
function ProductForm() {
  return <div>상품 등록/수정 폼</div>;
}

function InventoryManagement() {
  return <div>재고 관리 페이지</div>;
}

export default ProductManagement;
