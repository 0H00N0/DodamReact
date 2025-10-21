// UserManagement.js

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from './contexts/AdminContext';

/**
 * 사용자 관리 메인 컴포넌트
 */
function UserManagement() {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/:id" element={<UserDetail />} />
    </Routes>
  );
}

/**
 * 사용자 목록 컴포넌트 (회원 목록 조회)
 */
function UserList() {
  const { getAllMembers, getMembersByStatus, forceDeleteMember, addNotification } = useAdmin();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: 'ALL', sortBy: 'mname', sortOrder: 'asc' });

  // 회원 목록 로드
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      if (filters.status === 'ACTIVE' || filters.status === 'DELETED') {
        data = await getMembersByStatus(filters.status);
      } else {
        data = await getAllMembers();
      }
      setUsers(data);
    } catch (error) {
      console.error('회원 목록 로드 실패:', error);
      addNotification('회원 목록을 불러올 수 없습니다.', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getAllMembers, getMembersByStatus, filters.status, addNotification]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 강제 탈퇴 처리
  const handleForceDeleteUser = async (userId) => {
    if (window.confirm(`[ID: ${userId}] 회원을 정말로 강제 탈퇴하시겠습니까?`)) {
      try {
        await forceDeleteMember(userId);
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.mnum === userId ? { ...user, memstatus: 'DELETED' } : user
          )
        );
      } catch (error) {
        console.error('강제 탈퇴 실패:', error);
      }
    }
  };

  // 검색 + 정렬
  const filteredUsers = users
    .filter(user => {
      const searchLower = filters.search.toLowerCase();
      return !searchLower ||
        (user.mname?.toLowerCase().includes(searchLower) ?? false) ||
        (user.mid?.toLowerCase().includes(searchLower) ?? false) ||
        (user.memail?.toLowerCase().includes(searchLower) ?? false);
    })
    .sort((a, b) => {
      const valA = a[filters.sortBy] || '';
      const valB = b[filters.sortBy] || '';
      const multiplier = filters.sortOrder === 'asc' ? 1 : -1;
      return multiplier * valA.toString().localeCompare(valB.toString(), undefined, { numeric: true });
    });

  if (loading) {
    return (
      <div className="product-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>회원 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management">
      <div className="page-header">
        <h1>회원 관리 ({filteredUsers.length}명)</h1>
      </div>
      <div className="filters-section">
        <input
          type="text"
          placeholder="이름, 아이디, 이메일 검색..."
          value={filters.search}
          onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
          className="search-input"
        />
        {/* ✅ 상태 필터 추가 */}
        <select
          value={filters.status}
          onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
        >
          <option value="ALL">모든 회원</option>
          <option value="ACTIVE">활성 회원만 보기</option>
          <option value="DELETED">탈퇴 회원만 보기</option>
        </select>
      </div>
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>회원 정보</th>
              <th>상태</th>
              <th>연락처</th>
              <th>가입일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user.mnum}>
                <td>
                  <div className="product-info">
                    <div className="product-details">
                      <h3>{user.mname} ({user.mnic || 'N/A'})</h3>
                      <p>{user.mid} | {user.memail}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${user.memstatus === 'DELETED' ? 'status-deleted' : 'status-active'}`}>
                    {user.memstatus}
                  </span>
                </td>
                <td>{user.mtel}</td>
                <td>{new Date(user.mreg).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/admin/users/${user.mnum}`)}
                      title="상세 조회"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      </svg>
                    </button>
                    {user.memstatus === 'ACTIVE' && (
                      <button
                        className="btn-delete"
                        onClick={() => handleForceDeleteUser(user.mnum)}
                        title="강제 탈퇴"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path d="M6 7v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M10 11v6M14 11v6M4 7h16"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="no-results">검색 결과가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 회원 상세 정보 컴포넌트
 */
function UserDetail() {
  const { getMemberById, forceDeleteMember, addNotification } = useAdmin();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getMemberById(id);
        setUser(data);
      } catch (error) {
        addNotification('회원 정보를 불러올 수 없습니다', 'error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id, getMemberById, addNotification]);

  const handleForceDelete = async () => {
    if (window.confirm(`[ID: ${id}] 회원을 정말로 강제 탈퇴시키시겠습니까?`)) {
      try {
        await forceDeleteMember(id);
        navigate('/admin/users');
      } catch (error) {
        console.error('강제 탈퇴 실패:', error);
      }
    }
  };

  if (loading) {
    return (<div className="product-loading"><div className="loading-spinner"><div className="spinner"></div><p>회원 정보 로딩 중...</p></div></div>);
  }
  if (!user) {
    return (<div className="admin-404"><h2>회원을 찾을 수 없습니다.</h2><p>요청하신 회원 정보가 존재하지 않습니다.</p><button className="btn-primary" onClick={() => navigate('/admin/users')}>목록으로 돌아가기</button></div>);
  }

  return (
    <div className="user-detail">
      <div className="page-header">
        <h1>회원 상세 정보</h1>
        <div>
          {user.memstatus === 'ACTIVE' && (
            <button className="btn-danger" onClick={handleForceDelete}>강제 탈퇴</button>
          )}
          <button className="btn-secondary" onClick={() => navigate('/admin/users')}>목록</button>
        </div>
      </div>

      <div className="user-info-card">
        <h2>{user.mname} ({user.mnic || 'N/A'})</h2>
        <div className="info-grid">
          <p><strong>아이디:</strong> {user.mid}</p>
          <p><strong>이메일:</strong> {user.memail || 'N/A'}</p>
          <p><strong>연락처:</strong> {user.mtel}</p>
          <p><strong>생년월일:</strong> {user.mbirth ? new Date(user.mbirth).toLocaleDateString() : 'N/A'}</p>
          <p><strong>주소:</strong> {user.maddr} (우편번호: {user.mpost})</p>
          <p><strong>가입일:</strong> {new Date(user.mreg).toLocaleDateString()}</p>
          <p><strong>상태:</strong> {user.memstatus}</p>
          {user.memstatus === 'DELETED' && (
            <>
              <p><strong>탈퇴일:</strong> {user.deletedAt || 'N/A'}</p>
              <p><strong>탈퇴 사유:</strong> {user.deletedReason || 'N/A'}</p>
            </>
          )}
          <p><strong>로그인 방법:</strong> {user.lmtype}</p>
          <p><strong>계정 생성일:</strong> {user.createdAt}</p>
          <p><strong>마지막 수정일:</strong> {user.updatedAt}</p>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
