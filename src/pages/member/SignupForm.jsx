import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

export default function SignupForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    mid: "",
    mpw: "",
    mname: "",
    mtel: "",
    memail: "",
    maddr: "",
    mpost: "",
    mnic: "",
    children: [], // 자녀 정보 배열
  });
  const [child, setChild] = useState({ chname: "", chbirth: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 주소 검색 결과를 입력하는 함수 (예시)
  const handleAddressSearch = () => {
    // 실제 주소 검색 API 연동 필요
    setForm(f => ({
      ...f,
      maddr: "서울시 강남구 테헤란로 123",
      mpost: "06236"
    }));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // 자녀 정보 입력
  const onChildChange = (e) => {
    const { name, value } = e.target;
    setChild((c) => ({ ...c, [name]: value }));
  };

  // 자녀 정보 추가
  const addChild = () => {
    if (child.chname && child.chbirth) {
      setForm(f => ({
        ...f,
        children: [...f.children, { ...child }]
      }));
      setChild({ chname: "", chbirth: "" });
    }
  };

  // 자녀 정보 삭제
  const removeChild = idx => {
    setForm(f => ({
      ...f,
      children: f.children.filter((_, i) => i !== idx)
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMsg("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        mid: form.mid.trim(),
        mpw: form.mpw,
        mname: form.mname.trim(),
        mtel: form.mtel.trim(),
        memail: form.memail.trim(),
        maddr: form.maddr.trim(),
        mpost: form.mpost,
        children: form.children,
      };
      await api.post("/member/signup", payload);
      navigate("/loginForm", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : undefined) ??
        err?.message ??
        "회원가입에 실패했습니다.";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={onSubmit} style={styles.form} noValidate>
        <h2>회원가입</h2>

        <label htmlFor="mid">아이디</label>
        <input
          id="mid"
          name="mid"
          value={form.mid}
          onChange={onChange}
          placeholder="아이디"
          required
          autoComplete="username"
        />

        <label htmlFor="mpw">비밀번호</label>
        <input
          id="mpw"
          type="password"
          name="mpw"
          value={form.mpw}
          onChange={onChange}
          placeholder="비밀번호"
          required
          autoComplete="new-password"
        />

        <label htmlFor="mname">이름</label>
        <input
          id="mname"
          name="mname"
          value={form.mname}
          onChange={onChange}
          placeholder="이름"
          required
          autoComplete="name"
        />

        <label htmlFor="mtel">전화번호</label>
        <input
          id="mtel"
          name="mtel"
          value={form.mtel}
          onChange={onChange}
          placeholder="010-0000-0000"
          autoComplete="tel"
        />

        <label htmlFor="memail">이메일 주소</label>
        <input
          id="memail"
          name="memail"
          value={form.memail}
          onChange={onChange}
          placeholder="이메일"
          autoComplete="email"
        />

        <label htmlFor="maddr">주소</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id="maddr"
            name="maddr"
            value={form.maddr}
            onChange={onChange}
            placeholder="주소"
            style={{ flex: 1 }}
            autoComplete="address-line1"
          />
          <button type="button" onClick={handleAddressSearch} style={styles.linkBtn}>
            주소검색
          </button>
        </div>

        <label htmlFor="mpost">우편번호</label>
        <input
          id="mpost"
          name="mpost"
          value={form.mpost}
          onChange={onChange}
          placeholder="우편번호"
          autoComplete="postal-code"
        />

        {/* 자녀 정보 입력 (선택) */}
        <fieldset style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
  <legend>자녀 정보 (선택)</legend>
  {form.children.map((c, idx) => (
    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
      <input
        name="chname"
        value={c.chname}
        onChange={e => {
          const value = e.target.value;
          setForm(f => {
            const arr = [...f.children];
            arr[idx].chname = value;
            return { ...f, children: arr };
          });
        }}
        placeholder="자녀 이름"
        style={{ flex: 1 }}
      />
      <input
        name="chbirth"
        type="date"
        value={c.chbirth}
        onChange={e => {
          const value = e.target.value;
          setForm(f => {
            const arr = [...f.children];
            arr[idx].chbirth = value;
            return { ...f, children: arr };
          });
        }}
        style={{ flex: 1 }}
      />
      <button type="button" onClick={() => removeChild(idx)} style={styles.linkBtn}>
        삭제
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={() => setForm(f => ({ ...f, children: [...f.children, { chname: "", chbirth: "" }] }))}
    style={styles.linkBtn}
  >
    입력칸 추가
  </button>
</fieldset>

        {msg && <p style={styles.error}>{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            display: "block",
            width: "100%",
            padding: "12px 14px",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            background: "#1f6feb",
            color: "#fff",
          }}
        >
          {loading ? "처리 중..." : "가입하기"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/loginForm")}
          disabled={loading}
          style={styles.linkBtn}
        >
          로그인으로
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f7f7f7",
    padding: "40px",
  },
  form: {
    width: 400,
    display: "grid",
    gap: 12,
    padding: 24,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  error: { color: "#c13030", fontSize: 14, marginTop: 4 },
  linkBtn: { background: "transparent", color: "#333", marginTop: 4, cursor: "pointer" },
};