import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';

const initialPrice = { termMonth: 1, billMode: 'auto', amount: '', currency: 'KRW' };
const initialBenefit = { note: '', priceCap: '' };

function PlanForm() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { createPlan, getPlanById, updatePlan } = useAdmin();

  const [planCode, setPlanCode] = useState('');
  const [planName, setPlanName] = useState('');
  const [planActive, setPlanActive] = useState(true);
  const [prices, setPrices] = useState([initialPrice]);
  const [benefits, setBenefits] = useState([initialBenefit]);
  const [loading, setLoading] = useState(false);
  
  const isEditing = Boolean(planId);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      getPlanById(planId)
        .then(data => {
          setPlanCode(data.planCode);
          setPlanName(data.planName);
          setPlanActive(data.planActive);
          if (data.prices && data.prices.length > 0) {
            setPrices(data.prices.map(p => ({
              termMonth: p.termMonth,
              billMode: p.billMode,
              amount: p.amount,
              currency: p.currency
            })));
          } else {
            setPrices([{...initialPrice}]); // ✅ 가격 정보가 없으면 초기값 설정
          }
          if (data.benefits && data.benefits.length > 0) {
            setBenefits(data.benefits.map(b => ({
              note: b.note,
              priceCap: b.priceCap || ''
            })));
          } else {
            setBenefits([{...initialBenefit}]); // ✅ 혜택 정보가 없으면 초기값 설정
          }
        })
        .finally(() => setLoading(false));
    }
  }, [planId, isEditing, getPlanById]);

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...prices];
    newPrices[index][field] = value;
    setPrices(newPrices);
  };
  
  const addPrice = () => setPrices([...prices, { ...initialPrice }]);
  const removePrice = index => setPrices(prices.filter((_, i) => i !== index));

  const handleBenefitChange = (index, field, value) => {
    const newBenefits = [...benefits];
    newBenefits[index][field] = value;
    setBenefits(newBenefits);
  };
  
  const addBenefit = () => setBenefits([...benefits, { ...initialBenefit }]);
  const removeBenefit = index => setBenefits(benefits.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // ✅ [핵심 수정 1] 수정 시에도 가격과 혜택 정보를 모두 포함하여 전송합니다.
        const updatePayload = { planName, planActive, prices, benefits };
        await updatePlan(planId, updatePayload);
      } else {
        const createPayload = { planCode, planName, prices, benefits };
        await createPlan(createPayload);
      }
      navigate('/admin/plans');
    } catch (error) {
      console.error("Form submission failed", error);
    }
  };

  if (loading) return <div>플랜 정보 로딩 중...</div>;

  return (
    <div className="plan-form-container">
      <h2>{isEditing ? '플랜 수정' : '새 플랜 등록'}</h2>
      <form onSubmit={handleSubmit}>
        {/* 기본 정보 */}
        <div className="form-section">
          <h3>기본 정보</h3>
          <div className="form-group">
            <label>플랜 코드</label>
            <input 
              type="text" 
              value={planCode} 
              onChange={e => setPlanCode(e.target.value)} 
              disabled={isEditing} // 플랜 코드는 고유 식별자이므로 수정 불가 유지를 권장합니다.
              required 
            />
          </div>
          <div className="form-group">
            <label>플랜 이름</label>
            <input 
              type="text" 
              value={planName} 
              onChange={e => setPlanName(e.target.value)} 
              required 
            />
          </div>
          {isEditing && (
            <div className="form-group">
              <label>상태</label>
              <select value={planActive} onChange={e => setPlanActive(e.target.value === 'true')}>
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>
          )}
        </div>

        {/* 가격 정보 */}
        <div className="form-section">
          <h3>가격 정보</h3>
          {prices.map((price, index) => (
            <div key={index} className="dynamic-list-item">
              <div className="dynamic-item-fields">
                {/* ✅ [핵심 수정 2] 수정 시에도 필드가 활성화되도록 disabled={isEditing} 속성을 제거합니다. */}
                <div className="form-group"><label>기간(개월)</label><input type="number" value={price.termMonth} onChange={e => handlePriceChange(index, 'termMonth', e.target.value)} required /></div>
                <div className="form-group"><label>결제 모드</label><input type="text" value={price.billMode} onChange={e => handlePriceChange(index, 'billMode', e.target.value)} placeholder="e.g., auto" required /></div>
                <div className="form-group"><label>가격</label><input type="number" value={price.amount} onChange={e => handlePriceChange(index, 'amount', e.target.value)} required /></div>
                <div className="form-group"><label>통화</label><input type="text" value={price.currency} onChange={e => handlePriceChange(index, 'currency', e.target.value)} required /></div>
              </div>
              {/* ✅ [핵심 수정 3] 수정 시에도 삭제 버튼이 보이도록 '!isEditing &&' 조건을 제거합니다. */}
              <button type="button" className="remove-item-btn" onClick={() => removePrice(index)}>×</button>
            </div>
          ))}
          {/* ✅ [핵심 수정 3] 수정 시에도 추가 버튼이 보이도록 '!isEditing &&' 조건을 제거합니다. */}
          <button type="button" className="add-item-btn" onClick={addPrice}>+ 가격 추가</button>
        </div>

        {/* 혜택 정보 */}
        <div className="form-section">
          <h3>혜택 정보</h3>
          {benefits.map((benefit, index) => (
            <div key={index} className="dynamic-list-item">
              <div className="dynamic-item-fields">
                {/* ✅ [핵심 수정 2] disabled={isEditing} 속성을 제거합니다. */}
                <div className="form-group"><label>혜택 설명</label><textarea value={benefit.note} onChange={e => handleBenefitChange(index, 'note', e.target.value)} required /></div>
                <div className="form-group"><label>월 대여료 상한 (선택)</label><input type="number" value={benefit.priceCap} onChange={e => handleBenefitChange(index, 'priceCap', e.target.value)} /></div>
              </div>
              {/* ✅ [핵심 수정 3] '!isEditing &&' 조건을 제거합니다. */}
              <button type="button" className="remove-item-btn" onClick={() => removeBenefit(index)}>×</button>
            </div>
          ))}
          {/* ✅ [핵심 수정 3] '!isEditing &&' 조건을 제거합니다. */}
          <button type="button" className="add-item-btn" onClick={addBenefit}>+ 혜택 추가</button>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/plans')}>취소</button>
          <button type="submit" className="btn-primary">{isEditing ? '수정하기' : '등록하기'}</button>
        </div>
      </form>
    </div>
  );
}

export default PlanForm;