import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const UpdateProfile = () => {
  const [form, setForm] = useState({
    mname: '',
    mbirth: '',
    memail: '',
    mtel: '',
    maddr: '',
    mpost: '',
    mnic: '',
    children: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 카카오 주소검색 스크립트 로드
  useEffect(() => {
    if (!window.daum?.Postcode) {
      const script = document.createElement("script");
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 카카오 주소검색 연동
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      alert("주소 검색 스크립트가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: function (data) {
        setForm(f => ({
          ...f,
          maddr: data.address,
          mpost: data.zonecode
        }));
      }
    }).open();
  };

  // 회원 정보 불러오기
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/member/me');
        if (cancelled) return;
        setForm({
          mname:  data?.mname  ?? '',
          mbirth: data?.mbirth ?? '',
          memail: data?.memail ?? '',
          mtel:   data?.mtel   ?? '',
          maddr:  data?.maddr  ?? '',
          mpost:  data?.mpost  ?? '',
          mnic:   data?.mnic   ?? '',
          children: data?.children ?? []
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

  // 자녀 정보 입력/수정
  const handleChildChange = (idx, e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const children = [...prev.children];
      children[idx] = { ...children[idx], [name]: value };
      return { ...prev, children };
    });
  };

  // 자녀 추가
  const addChild = () => {
    setForm(prev => ({
      ...prev,
      children: [...prev.children, { chname: "", chbirth: "" }]
    }));
  };

  // 자녀 삭제
  const removeChild = (idx) => {
    setForm(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== idx)
    }));
  };

  // 수정 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
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
        <label>이름: <input type="text" name="mname" value={form.mname} onChange={handleChange} /></label><br />
        <label>생년월일: <input type="date" name="mbirth" value={form.mbirth || ""} onChange={handleChange} /></label><br />
        <label>이메일: <input type="email" name="memail" value={form.memail} onChange={handleChange} /></label><br />
        <label>전화번호: <input type="text"  name="mtel"   value={form.mtel}   onChange={handleChange} /></label><br />
        <label>주소:</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            name="maddr"
            value={form.maddr}
            onChange={handleChange}
            placeholder="주소"
            style={{ width: "250px" }} 
            autoComplete="address-line1"
          />
          <button type="button" onClick={handleAddressSearch} style={{ background: "#eee", border: "none", borderRadius: 4, cursor: "pointer", padding: "0 12px" }}>
          주소검색
          </button>
        </div>
        <label>우편번호: <input type="text"  name="mpost"  value={form.mpost}  onChange={handleChange} /></label><br />
        <label>닉네임: <input type="text"  name="mnic"   value={form.mnic}   onChange={handleChange} /></label><br />

        <fieldset style={{ border: "1px solid #eee", padding: 12, borderRadius: 8, marginTop: 16 }}>
          <legend>자녀 정보 (선택)</legend>
          {form.children.map((c, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input
                name="chname"
                value={c.chname}
                onChange={e => handleChildChange(idx, e)}
                placeholder="자녀 이름"
                 style={{ width: "250px" }} 
              />
              <input
                name="chbirth"
                type="date"
                value={c.chbirth}
                onChange={e => handleChildChange(idx, e)}
                 style={{ width: "250px" }} 
              />
              <button type="button" onClick={() => removeChild(idx)} style={{ background: "#eee", border: "none", borderRadius: 4, cursor: "pointer", padding: "0 12px" }}>
                삭제
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addChild}
            style={{ background: "#eee", border: "none", borderRadius: 4, cursor: "pointer", padding: "0 12px" }}
          >
            입력칸 추가
          </button>
        </fieldset>

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