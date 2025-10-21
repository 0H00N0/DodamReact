// src/admin/DeliverymanForm.js
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

const ACCEPTED_ROLE_NAMES = new Set(['Deliveryman', '배송기사', 'DELIVERYMAN']);

export default function DeliverymanForm({ mode = 'create' }) {
  const navigate = useNavigate();
  const { delnum } = useParams();
  const { getDeliverymanById, createDeliveryman, updateDeliveryman, getAllProducts, getAllMembers } = useAdmin();

  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]); // 배송기사(memtype=3)만 필터
  const [form, setForm] = useState({ pronum: '', mnum: '', dayoff: 0, delcost: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [prods, membersAll] = await Promise.all([
          getAllProducts(),
          getAllMembers()
        ]);
        setProducts(Array.isArray(prods) ? prods : []);
        const riders = (Array.isArray(membersAll) ? membersAll : []).filter(m => {
          const rn = (m.roleName || '').trim();
          return ACCEPTED_ROLE_NAMES.has(rn);
        });
        setMembers(riders);

        if (mode === 'edit' && delnum) {
          const row = await getDeliverymanById(delnum);
          setForm({
            pronum: row.pronum ?? '',
            mnum: row.mnum ?? '',
            dayoff: row.dayoff ?? 0,
            delcost: row.delcost ?? '',
            location: row.location ?? ''
          });
        }
      } catch (e) {
        console.error(e);
        setError(e.message || '데이터 로딩 실패');
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, delnum, getAllProducts, getAllMembers, getDeliverymanById]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const canSubmit = useMemo(() => {
    if (!form.pronum || !form.mnum) return false;
    if (form.dayoff < 0) return false;
    if (form.delcost === '' || Number(form.delcost) < 0) return false;
    return true;
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setSaving(true);
      const payload = {
        pronum: Number(form.pronum),
        mnum: Number(form.mnum),
        dayoff: Number(form.dayoff) || 0,
        delcost: String(form.delcost),
        location: form.location?.trim() || ''
      };
      if (mode === 'create') {
        await createDeliveryman(payload);
      } else {
        await updateDeliveryman(Number(delnum), payload);
      }
      navigate('/admin/deliverymen', { replace: true });
    } catch (e) {
      console.error(e);
      alert(e.message || '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-spinner">
          <div className="spinner" />
          <span>로딩 중…</span>
        </div>
      </div>
    );
  }
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-content-area">
      <div className="admin-header-row">
        <h2>{mode === 'create' ? '배송기사 등록' : `배송기사 수정 #${delnum}`}</h2>
      </div>

      <form className="admin-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            <span>상품</span>
            <select name="pronum" value={form.pronum} onChange={onChange} required>
              <option value="">선택하세요</option>
              {products.map(p => (
                <option key={p.pronum} value={p.pronum}>{p.proname} (#{p.pronum})</option>
              ))}
            </select>
          </label>

          <label>
            <span>배송기사(회원)</span>
            <select name="mnum" value={form.mnum} onChange={onChange} required>
              <option value="">선택하세요</option>
              {members.map(m => (
                <option key={m.mnum} value={m.mnum}>{m.mname} (#{m.mnum})</option>
              ))}
            </select>
          </label>

          <label>
            <span>휴무일수</span>
            <input type="number" name="dayoff" value={form.dayoff} onChange={onChange} min={0} placeholder="0" />
          </label>

          <label>
            <span>배송비</span>
            <input type="number" step="0.01" name="delcost" value={form.delcost} onChange={onChange} min={0} placeholder="0.00" />
          </label>

          <label className="full-row">
            <span>지역</span>
            <input type="text" name="location" value={form.location} onChange={onChange} maxLength={200} placeholder="예: 서울 강남구" />
          </label>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="admin-secondary-btn" onClick={() => navigate(-1)}>취소</button>
          <button type="submit" className="admin-primary-btn" disabled={!canSubmit || saving}>
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
