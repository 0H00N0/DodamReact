import React, { useEffect, useState, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';
import './Admin.css';

const DeliverymanForm = React.lazy(() => import('./DeliverymanForm'));

function DeliverymanList() {
  const { getAllDeliverymen, deleteDeliveryman } = useAdmin();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 목록 로딩 함수
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllDeliverymen();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || '목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 최초 1회만 호출 (무한 루프 방지)
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (row) => {
    if (!window.confirm(`정말 삭제하시겠습니까?\n(delnum: ${row.delnum}, ${row.mname} / ${row.proname})`)) return;
    try {
      await deleteDeliveryman(row.delnum);
      await fetchData(); // 삭제 후 목록 갱신
    } catch (e) {
      alert(e.message || '삭제 실패');
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
        <h2>배송기사 관리</h2>
        <button className="admin-primary-btn" onClick={() => navigate('new')}>+ 배송기사 등록</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>delnum</th>
              <th>상품</th>
              <th>기사</th>
              <th>휴무일수</th>
              <th>배송비</th>
              <th>지역</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>
            )}
            {list.map(row => (
              <tr key={row.delnum}>
                <td>{row.delnum}</td>
                <td>{row.proname ?? `#${row.pronum}`}</td>
                <td>{row.mname ?? `#${row.mnum}`}</td>
                <td>{row.dayoff ?? 0}</td>
                <td>{row.delcost != null ? Number(row.delcost).toLocaleString() : '-'}</td>
                <td>{row.location || '-'}</td>
                <td>
                  <div className="admin-action-group">
                    <button className="admin-secondary-btn" onClick={() => navigate(`${row.delnum}/edit`)}>수정</button>
                    <button className="admin-danger-btn" onClick={() => onDelete(row)}>삭제</button>
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

export default function DeliverymanManagement() {
  return (
    <Suspense fallback={
      <div className="admin-loading-container">
        <div className="admin-loading-spinner">
          <div className="spinner" />
          <span>컴포넌트 로딩…</span>
        </div>
      </div>
    }>
      <Routes>
        <Route index element={<DeliverymanList />} />
        <Route path="new" element={<DeliverymanForm mode="create" />} />
        <Route path=":delnum/edit" element={<DeliverymanForm mode="edit" />} />
      </Routes>
    </Suspense>
  );
}