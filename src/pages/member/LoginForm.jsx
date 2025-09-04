import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ mid: "", mpw: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMsg("");
    try {
      await api.post("/member/loginForm", {
        mid: form.mid.trim(),
        mpw: form.mpw,
      });
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/", { replace: true }); // 로그인 성공 후 메인으로
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "아이디/비밀번호를 확인해 주세요.";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={onSubmit} style={styles.form} noValidate>
        <h2>로그인</h2>

        <label htmlFor="mid">아이디</label>
        <input
          id="mid"
          name="mid"
          value={form.mid}
          onChange={onChange}
          placeholder="아이디"
          autoComplete="username"
          required
        />

        <label htmlFor="mpw">비밀번호</label>
        <input
          id="mpw"
          name="mpw"
          type="password"
          value={form.mpw}
          onChange={onChange}
          placeholder="비밀번호"
          autoComplete="current-password"
          required
        />

        {msg && <div style={styles.error}>{msg}</div>}

        {/* ✅ 눈에 보이도록 스타일 지정 */}
        <button
          type="submit"
          disabled={loading}
          style={styles.primaryBtn}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        {/* 옵션: 회원가입 이동 버튼 */}
        <button
          type="button"
          onClick={() => navigate("/signup")}
          disabled={loading}
          style={styles.linkBtn}
        >
          회원가입으로
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
  primaryBtn: {
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
  },
  linkBtn: { background: "transparent", color: "#333", marginTop: 4 },
};
