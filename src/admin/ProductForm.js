import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from './contexts/ProductContext';
import './Admin.css';

function ProductForm() {
  const { getProductById, addProduct, updateProduct, getCategories, getBrands } = useProduct();
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
    imageName: ''
  });
  const [loading, setLoading] = useState(true);

  const categories = getCategories();
  const brands = getBrands();

  useEffect(() => {
    if (isEditMode) {
      const product = getProductById(id);
      if (product) {
        setFormData({
          productName: product.productName || '',
          categoryId: product.category.categoryId || '',
          brandId: product.brand.brandId || '',
          price: product.price || '',
          stockQuantity: product.stockQuantity || '',
          status: product.status || 'ACTIVE',
          description: product.description || '',
          imageName: product.imageName || ''
        });
      }
    }
    setLoading(false);
  }, [id, isEditMode, getProductById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const category = categories.find(c => c.categoryId === parseInt(formData.categoryId));
    const brand = brands.find(b => b.brandId === parseInt(formData.brandId));

    const dataToSubmit = {
      ...formData,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      category,
      brand
    };

    if (isEditMode) {
      updateProduct(id, dataToSubmit);
    } else {
      addProduct(dataToSubmit);
    }
    navigate('/admin/products');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-form">
      <h2>{isEditMode ? '상품 수정' : '상품 등록'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>상품명</label>
          <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>카테고리</label>
          <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
            <option value="">카테고리 선택</option>
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
            ))}
          </select>
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
            <option value="OUT_OF_STOCK">품절</option>
          </select>
        </div>
        <div className="form-group">
          <label>이미지 파일명</label>
          <input type="text" name="imageName" value={formData.imageName} onChange={handleInputChange} placeholder="e.g., lego_classic.jpg" />
        </div>
        <div className="form-group">
          <label>상세설명</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange}></textarea>
        </div>
        <button type="submit" className="admin-btn primary">저장</button>
        <button type="button" className="admin-btn secondary" onClick={() => navigate('/admin/products')}>취소</button>
      </form>
    </div>
  );
}

export default ProductForm;