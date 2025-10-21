import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css'; // 공용 어드민 CSS 사용

// 카테고리 생성/수정 모달 컴포넌트
const CategoryModal = ({ isOpen, onClose, onSubmit, category }) => {
  const [name, setName] = useState('');
  const isEditMode = category != null;

  useEffect(() => {
    // 모달이 열릴 때, 수정 모드이면 기존 카테고리 이름을, 아니면 빈 문자열을 설정
    setName(isEditMode ? category.categoryName : '');
  }, [isOpen, category, isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('카테고리 이름을 입력하세요.');
      return;
    }
    onSubmit(name);
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h2>{isEditMode ? '카테고리 수정' : '새 카테고리 등록'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>카테고리 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="카테고리 이름을 입력하세요"
              autoFocus
            />
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="admin-btn secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="admin-btn primary">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 메인 카테고리 관리 컴포넌트
function CategoryManagement() {
  const { getAllCategories, createCategory, updateCategory, deleteCategory } = useAdmin();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); // 수정할 카테고리 저장

  // 카테고리 목록을 불러오는 함수
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('카테고리 목록을 불러오는 데 실패했습니다.', error);
    } finally {
      setLoading(false);
    }
  }, [getAllCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // '새 카테고리 등록' 버튼 클릭 핸들러
  const handleCreate = () => {
    setCurrentCategory(null);
    setIsModalOpen(true);
  };

  // '수정' 버튼 클릭 핸들러
  const handleEdit = (category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  // '삭제' 버튼 클릭 핸들러
  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까? 관련된 상품이 있을 경우 문제가 발생할 수 있습니다.')) {
      try {
        await deleteCategory(id);
        fetchCategories(); // 목록 새로고침
      } catch (error) {
        console.error('카테고리 삭제에 실패했습니다.', error);
      }
    }
  };

  // 모달 폼 제출 핸들러
  const handleSubmit = async (name) => {
    try {
      if (currentCategory) {
        // 수정 모드
        await updateCategory(currentCategory.categoryId, { categoryName: name });
      } else {
        // 생성 모드
        await createCategory({ categoryName: name });
      }
      fetchCategories(); // 목록 새로고침
      setIsModalOpen(false); // 모달 닫기
    } catch (error) {
      console.error('카테고리 저장에 실패했습니다.', error);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="category-management">
      <div className="page-header">
        <h2>카테고리 관리</h2>
        <button className="admin-btn primary" onClick={handleCreate}>
          새 카테고리 등록
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>카테고리 이름</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.categoryId}>
              <td>{cat.categoryId}</td>
              <td>{cat.categoryName}</td>
              <td>
                <button className="admin-btn secondary" onClick={() => handleEdit(cat)}>
                  수정
                </button>
                <button className="admin-btn danger" onClick={() => handleDelete(cat.categoryId)}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        category={currentCategory}
      />
    </div>
  );
}

export default CategoryManagement;