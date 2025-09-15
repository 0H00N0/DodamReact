import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';            // ✅ 공용 인스턴스만 사용
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const UpdateProfile = () => {
  const [form, setForm] = useState({
    memail: '',
    mtel: '',
    maddr: '',
    mpost: '',
    mnic: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 회원 정보 불러오기
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // ✅ 서버에 /member/me 구현되어 있어야 함
        const { data } = await api.get('/member/me');
        if (cancelled) return;
        setForm({
          memail: data?.memail ?? '',
          mtel:   data?.mtel   ?? '',
          maddr:  data?.maddr  ?? '',
          mpost:  data?.mpost  ?? '',
          mnic:   data?.mnic   ?? ''
        });
      } catch (err) {
        console.error('회원 정보 로딩 실패:', err);
        if (err?.response?.status === 401) {
          alert('로그인이 필요합니다.');
          navigate('/login', { replace: true });
          return;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  // 입력값 변경 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 수정 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      // ✅ 공용 인스턴스 + 상대경로
      await api.put('/member/updateProfile', form);
      alert('회원정보 수정이 완료되었습니다.');
      navigate('/member/profile', { replace: true });
    } catch (err) {
      console.error('수정 실패:', err);
      setMessage(err?.response?.data?.error || '수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>회원정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <label>이메일: <input type="email" name="memail" value={form.memail} onChange={handleChange} /></label><br />
        <label>전화번호: <input type="text"  name="mtel"   value={form.mtel}   onChange={handleChange} /></label><br />
        <label>주소:   <input type="text"  name="maddr"  value={form.maddr}  onChange={handleChange} /></label><br />
        {/* 숫자 필드는 빈값 처리 어려우니 텍스트 추천 */}
        <label>우편번호: <input type="text"  name="mpost"  value={form.mpost}  onChange={handleChange} /></label><br />
        <label>닉네임: <input type="text"  name="mnic"   value={form.mnic}   onChange={handleChange} /></label><br />

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 16,
            padding: '12px 24px',
            background: '#1976d2',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? '저장 중…' : '수정하기'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateProfile;
