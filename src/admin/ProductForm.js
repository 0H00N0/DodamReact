import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css'; // 폼 스타일링을 위해 CSS를 import 합니다.

// 브랜드 목록 (하드코딩)
const BRAND_LIST = [
  { brandId: 1, brandName: '레고' },
  { brandId: 2, brandName: '아이코닉스' },
  { brandId: 3, brandName: '미미월드' },
  { brandId: 4, brandName: '실바니안' },
  { brandId: 5, brandName: '기타' }
];

// 폼 상태 초기화 객체 (백엔드 DTO의 모든 필드 포함)
const initialFormData = {
  proname: '',
  prodetail: '',
  proprice: '',
  proborrow: '',
  probrand: '',
  promade: '',
  proage: '',
  procertif: '',
  prodate: '',
  resernum: '',
  ctnum: '',
  catenum: '',
  prosnum: '',
  imageName: ''
};


function ProductForm() {
  const { 
    getProductById, 
    createProduct, 
    updateProduct, 
    getAllCategories,
    getAllProductStates,
    uploadImage 
  } = useAdmin();

  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [productStates, setProductStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';
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
            // 수정 시 기존 데이터를 폼에 채워넣기
            setFormData({
              proname: product.proname || '',
              prodetail: product.prodetail || '',
              proprice: product.proprice || '',
              proborrow: product.proborrow || '',
              probrand: product.probrand || '',
              promade: product.promade || '',
              proage: product.proage || '',
              procertif: product.procertif || '',
              prodate: product.prodate || '',
              resernum: product.resernum || '',
              ctnum: product.ctnum || '',
              catenum: product.category?.catenum || '',
              prosnum: product.prostate?.prosnum || '',
              imageName: product.imageName || ''
            });
            if (product.imageName) {
              // 그냥 파일 이름이 아닌, 서버에서 이미지를 제공하는 전체 URL로 설정
              setImagePreview(`${API_BASE_URL}/images/${product.imageName}`);
            }
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
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalImageName = formData.imageName;

    if (imageFile) {
      try {
        const uploadResult = await uploadImage(imageFile);
        finalImageName = uploadResult.imageName;
      } catch (error) {
        return; // 이미지 업로드 실패 시 중단
      }
    }
    
    // 백엔드 DTO 형식에 맞게 숫자형으로 변환
    const dataToSubmit = {
      ...formData,
      imageName: finalImageName,
      proprice: parseFloat(formData.proprice),
      proborrow: parseFloat(formData.proborrow),
      proage: formData.proage ? parseInt(formData.proage, 10) : null, // 비어있을 수 있으므로 null 처리
      resernum: parseInt(formData.resernum, 10),
      ctnum: parseInt(formData.ctnum, 10),
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
          <label>상품 가격</label>
          <input type="number" name="proprice" value={formData.proprice} onChange={handleInputChange} required />
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
          <label>대여 예약 번호(임시)</label>
          <input type="number" name="resernum" value={formData.resernum} onChange={handleInputChange} required />
        </div>
        
        <div className="form-group">
          <label>쿠폰 종류(임시)</label>
          <input type="number" name="ctnum" value={formData.ctnum} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label>상세 설명</label>
          <textarea name="prodetail" value={formData.prodetail} onChange={handleInputChange}></textarea>
        </div>
        
        <div className="form-group">
          <label>상품 이미지</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div className="image-preview" style={{ marginTop: '10px' }}>
              <img src={imagePreview} alt="상품 미리보기" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            </div>
          )}
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