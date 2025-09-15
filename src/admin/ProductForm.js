import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

function CategoryModal({ onClose, onCategoryCreated }) {
  const { createCategory } = useAdmin();
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCategory = await createCategory({ categoryName, description });
      onCategoryCreated(newCategory);
    } catch (error) {
      console.error("Failed to create category", error);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h2>새 카테고리 등록</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>카테고리 이름</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="admin-modal-actions">
            <button type="submit" className="admin-btn primary">저장</button>
            <button type="button" className="admin-btn secondary" onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductForm() {
  const { getProductById, createProduct, updateProduct, getAllCategories, getAllBrands } = useAdmin();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    productName: '',
    categoryId: '',
    brandId: '',
    price: '',
    stockQuantity: '',
    status: 'ACTIVE',
    description: '',
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const categoryData = await getAllCategories();
      setCategories(categoryData);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, [getAllCategories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brandData] = await Promise.all([
          getAllBrands(),
          fetchCategories(),
        ]);
        setBrands(brandData);

        if (isEditMode) {
          const product = await getProductById(id);
          setFormData({
            productName: product.productName || '',
            categoryId: product.categoryId || '',
            brandId: product.brandId || '',
            price: product.price || '',
            stockQuantity: product.stockQuantity || '',
            status: product.status || 'ACTIVE',
            description: product.description || '',
          });
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, getProductById, getAllBrands, fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryCreated = (newCategory) => {
    setCategoryModalOpen(false);
    fetchCategories();
    setFormData(prev => ({ ...prev, categoryId: newCategory.categoryId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: Number(formData.categoryId),
        brandId: Number(formData.brandId),
      };

      if (isEditMode) {
        await updateProduct(id, dataToSubmit);
      } else {
        await createProduct(dataToSubmit);
      }
      navigate('/admin/products');
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isCategoryModalOpen && (
        <CategoryModal 
          onClose={() => setCategoryModalOpen(false)} 
          onCategoryCreated={handleCategoryCreated} 
        />
      )}
      <div className="product-form">
        <h2>{isEditMode ? '상품 수정' : '상품 등록'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>상품명</label>
            <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>카테고리</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required style={{ flex: 1 }}>
                <option value="">카테고리 선택</option>
                {categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                ))}
              </select>
              <button type="button" className="admin-btn" onClick={() => setCategoryModalOpen(true)} style={{ marginLeft: '10px' }}>
                추가
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>브랜드</label>
            <select name="brandId" value={formData.brandId} onChange={handleInputChange} required>
              <option value="">브랜드 선택</option>
              {brands.map(brand => (
                <option key={brand.brandId} value={brand.brandId}>{brand.brandName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>가격</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>재고</label>
            <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>상태</label>
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="ACTIVE">판매중</option>
              <option value="INACTIVE">판매중지</option>
            </select>
          </div>
          <div className="form-group">
            <label>상세설명</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange}></textarea>
          </div>
          <button type="submit" className="admin-btn primary">저장</button>
          <button type="button" className="admin-btn secondary" onClick={() => navigate('/admin/products')}>취소</button>
        </form>
      </div>
    </>
  );
}

export default ProductForm;

