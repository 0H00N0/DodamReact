import React, { useEffect, useState } from 'react';
import { useAdmin } from './contexts/AdminContext';

function DiscountManagement() {
  const { getAllDiscounts, createDiscount, updateDiscount, deleteDiscount, getAllPlanTerms } = useAdmin();
  
  const [discounts, setDiscounts] = useState([]);
// PlanTerms를 state에 저장
  const [planTerms, setPlanTerms] = useState([]);
  const [form, setForm] = useState({ disLevel: 2, disValue: 0, ptermId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 할인율 데이터 로드
  const loadDiscounts = async () => {
    try {
      const data = await getAllDiscounts();
      setDiscounts(data || []);
    } catch (error) {
      console.error('할인율 로드 실패:', error);
      setError('할인율 데이터를 불러오는데 실패했습니다.');
    }
  };
// ptermId → 개월수 변환 함수
  const getMonthByTermId = (id) => {
    const term = planTerms.find((t) => t.ptermId === id);
    return term ? `${term.ptermMonth}개월` : id; // 못찾으면 그냥 id 출력
    };
  // planTerms 데이터 로드
  const loadPlanTerms = async () => {
    try {
      const terms = await getAllPlanTerms();
      setPlanTerms(terms || []);
    } catch (error) {
      console.error('플랜 기간 로드 실패:', error);
      setError('플랜 기간 데이터를 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    loadDiscounts();
    loadPlanTerms();
  }, []);

  // 폼 유효성 검사
  const validateForm = () => {
    if (!form.ptermId || form.ptermId === '') {
      setError('기간을 선택해주세요.');
      return false;
    }
    
    if (form.disValue <= 0 || form.disValue > 100) {
      setError('할인율은 1-100% 사이의 값을 입력해주세요.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 유효성 검사
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // 데이터 준비 및 타입 확인
      const submitData = {
        disLevel: Number(form.disLevel),
        disValue: Number(form.disValue),
        ptermId: Number(form.ptermId)
      };
      
      console.log('제출할 데이터:', submitData);
      
      // NaN 체크
      if (isNaN(submitData.disLevel) || isNaN(submitData.disValue) || isNaN(submitData.ptermId)) {
        throw new Error('입력값이 올바르지 않습니다.');
      }
      
      if (form.disNum) {
        await updateDiscount(form.disNum, submitData);
        console.log('할인율 수정 완료');
      } else {
        const result = await createDiscount(submitData);
        console.log('할인율 생성 완료:', result);
      }
      
      // 폼 초기화 및 데이터 새로고침
      setForm({ disLevel: 2, disValue: 0, ptermId: '' });
      await loadDiscounts();
      
    } catch (error) {
      console.error('제출 오류:', error);
      setError(error.message || '할인율 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (d) => {
    setForm({
      ...d,
      disLevel: d.disLevel || 2,
      disValue: d.disValue || 0,
      ptermId: d.ptermId || ''
    });
    setError('');
  };

  const handleDelete = async (disNum) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      setLoading(true);
      await deleteDiscount(disNum);
      await loadDiscounts();
    } catch (error) {
      console.error('삭제 오류:', error);
      setError('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discount-management">
      <h2>할인율 관리</h2>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* 할인 종류 선택 */}
        <div>
          <label>할인 종류:</label>
          <select
            value={form.disLevel}
            onChange={(e) => setForm({ ...form, disLevel: parseInt(e.target.value) })}
            disabled={loading}
          >
            <option value={1}>대여할인</option>
            <option value={2}>구독할인</option>
          </select>
        </div>

        {/* 할인율 입력 */}
        <div>
          <label>할인율 (%):</label>
          <input
            type="number"
            min="1"
            max="100"
            placeholder="할인율 (%)"
            value={form.disValue}
            onChange={(e) => setForm({ ...form, disValue: parseInt(e.target.value) || 0 })}
            disabled={loading}
            required
          />
        </div>

        {/* PlanTerms 드롭다운 */}
        <div>
          <label>기간:</label>
          <select
            value={form.ptermId}
            onChange={(e) => setForm({ ...form, ptermId: parseInt(e.target.value) || '' })}
            disabled={loading}
            required
          >
            <option value="">기간 선택</option>
            {planTerms.map((term) => (
              <option key={term.ptermId} value={term.ptermId}>
                {term.ptermMonth}개월
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '처리중...' : (form.disNum ? '수정' : '추가')}
        </button>
      </form>

      {/* 할인율 목록 */}
      <div className="discount-list">
        <h3>현재 할인율 목록</h3>
        {discounts.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>할인번호</th>
                <th>할인종류</th>
                <th>할인율</th>
                <th>기간</th> {/* ✅ 기간ID → 개월로 바꿈 */}
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => (
                <tr key={discount.disNum}>
                  <td>{discount.disNum}</td>
                  <td>{discount.disLevel === 1 ? '대여할인' : '구독할인'}</td>
                  <td>{discount.disValue}%</td>
                  <td>{getMonthByTermId(discount.ptermId)}</td> {/* ✅ 개월수 출력 */}
                  <td>
                    <button onClick={() => handleEdit(discount)} disabled={loading}>
                      수정
                    </button>
                    <button onClick={() => handleDelete(discount.disNum)} disabled={loading}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>등록된 할인율이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default DiscountManagement;