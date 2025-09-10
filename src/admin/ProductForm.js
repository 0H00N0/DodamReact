// src/admin/ProductForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

function ProductForm() {
  const { getProductById, createProduct, updateProduct, getAllCategories, getAllBrands } = useAdmin();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    proname: '',
    catenum: '',
    brandId: '',
    proprice: '',
    stockQuantity: '',
    prostat: 'AVAILABLE',
    prodetai1: '',
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryData, brandData] = await Promise.all([
          getAllCategories(),
          getAllBrands(),
        ]);
        setCategories(categoryData);
        setBrands(brandData);

        if (isEditMode) {
          const product = await getProductById(id);
          setFormData({
            proname: product.proname || '',
            catenum: product.category?.catenum || '',
            brandId: product.brand?.brandId || '',
            proprice: product.proprice || '',
            stockQuantity: product.stockQuantity || '',
            prostat: product.prostat || 'AVAILABLE',
            prodetai1: product.prodetai1 || '',
          });
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, getProductById, getAllCategories, getAllBrands]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        // Ensure numeric types are sent as numbers
        proprice: Number(formData.proprice),
        stockQuantity: Number(formData.stockQuantity),
        catenum: Number(formData.catenum),
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
    <div className="product-form">
      <h2>{isEditMode ? '상품 수정' : '상품 등록'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>상품명</label>
          <input type="text" name="proname" value={formData.proname} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>카테고리</label>
          <select name="catenum" value={formData.catenum} onChange={handleInputChange} required>
            <option value="">카테고리 선택</option>
            {categories.map(cat => (
              <option key={cat.catenum} value={cat.catenum}>{cat.catename}</option>
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
          <input type="number" name="proprice" value={formData.proprice} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>재고</label>
          <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>상태</label>
          <select name="prostat" value={formData.prostat} onChange={handleInputChange}>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="RENTED">RENTED</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
          </select>
        </div>
        <div className="form-group">
          <label>상세설명</label>
          <textarea name="prodetai1" value={formData.prodetai1} onChange={handleInputChange}></textarea>
        </div>
        <button type="submit" className="admin-btn primary">저장</button>
        <button type="button" className="admin-btn secondary" onClick={() => navigate('/admin/products')}>취소</button>
      </form>
    </div>
  );
}

export default ProductForm;