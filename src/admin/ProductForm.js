import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

// 브랜드 목록 (하드코딩)
const BRAND_LIST = [
  { brandId: 1, brandName: '레고' },
  { brandId: 2, brandName: '아이코닉스' },
  { brandId: 3, brandName: '미미월드' },
  { brandId: 4, brandName: '실바니안' },
  { brandId: 5, brandName: '기타' }
];

// ✅ 수정 후
const initialFormData = {
  proname: '',
  prodetail: '',
  proborrow: '',
  probrand: '',
  promade: '',
  proage: '',
  procertif: '',
  prodate: '',
  catenum: '',
  prosnum: '',
  images: [{ proimageorder: 1, prourl: '', prodetailimage: '' }]
};

function ProductForm() {
  const { 
    getProductById, 
    createProduct, 
    updateProduct, 
    getAllCategories,
    getAllProductStates
  } = useAdmin();

  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [productStates, setProductStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, states] = await Promise.all([
          getAllCategories(),
          getAllProductStates()
        ]);
        setCategories(cats);
        setProductStates(states);

        if (isEditMode) {
          const product = await getProductById(id);
          if (product) {
            setFormData({
              proname: product.proname || '',
              prodetail: product.prodetail || '',
              proborrow: product.proborrow || '',
              probrand: product.probrand || '',
              promade: product.promade || '',
              proage: product.proage || '',
              procertif: product.procertif || '',
              prodate: product.prodate || '',
              catenum: product.category?.catenum || '',
              prosnum: product.prostate?.prosnum || '',
              images: product.images && product.images.length > 0 
                ? product.images.map((img, idx) => ({
                    proimageorder: idx + 1,
                    prourl: img.prourl || '',
                    prodetailimage: img.prodetailimage || ''
                  }))
                : [{ proimageorder: 1, prourl: '', prodetailimage: '' }]
            });
          }
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, isEditMode, getProductById, getAllCategories, getAllProductStates]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index][field] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { proimageorder: formData.images.length + 1, prourl: '', prodetailimage: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ✅ 수정 후
    const dataToSubmit = {
      ...formData,
      proborrow: parseFloat(formData.proborrow),
      proage: formData.proage ? parseInt(formData.proage, 10) : null,
      catenum: parseInt(formData.catenum, 10),
      prosnum: parseInt(formData.prosnum, 10)
    };
    
    try {
      if (isEditMode) {
        await updateProduct(id, dataToSubmit);
      } else {
        await createProduct(dataToSubmit);
      }
      navigate('/admin/products');
    } catch (error) {
      console.error("상품 저장 실패:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="product-form-container">
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
              <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>브랜드</label>
          <select name="probrand" value={formData.probrand} onChange={handleInputChange} required>
            <option value="">브랜드 선택</option>
            {BRAND_LIST.map(brand => (
              <option key={brand.brandId} value={brand.brandName}>{brand.brandName}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>상품 상태</label>
          <select name="prosnum" value={formData.prosnum} onChange={handleInputChange} required>
            <option value="">상태 선택</option>
            {productStates.map(state => (
              <option key={state.prosnum} value={state.prosnum}>{state.prograde}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>대여 가격</label>
          <input type="number" name="proborrow" value={formData.proborrow} onChange={handleInputChange} required />
        </div>
        
        <div className="form-group">
          <label>제조사</label>
          <input type="text" name="promade" value={formData.promade} onChange={handleInputChange} />
        </div>
        
        <div className="form-group">
          <label>사용 연령</label>
          <input type="number" name="proage" value={formData.proage} onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label>안전인증 정보</label>
          <input type="text" name="procertif" value={formData.procertif} onChange={handleInputChange} />
        </div>
        
        <div className="form-group">
          <label>출시일</label>
          <input type="date" name="prodate" value={formData.prodate} onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label>상세 설명</label>
          <textarea name="prodetail" value={formData.prodetail} onChange={handleInputChange}></textarea>
        </div>
        
        <div className="form-group">
          <label>상품 이미지 URL</label>
          {formData.images.map((img, idx) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="미리보기 이미지 URL"
                value={img.prourl}
                onChange={(e) => handleImageChange(idx, "prourl", e.target.value)}
              />
              <input
                type="text"
                placeholder="상세 이미지 URL"
                value={img.prodetailimage}
                onChange={(e) => handleImageChange(idx, "prodetailimage", e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={addImageField}>+ 이미지 추가</button>
        </div>
        
        <div className="form-actions">
          <button type="button" className="admin-btn secondary" onClick={() => navigate('/admin/products')}>취소</button>
          <button type="submit" className="admin-btn primary">저장</button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
