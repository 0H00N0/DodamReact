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
    setMsg("");
    setLoading(true);
    try {
      // 백엔드: POST /member/loginForm
      // 예시 바디는 백엔드에 맞춰 조정(mid/mpw or username/password)
      await api.post("/member/loginForm", form);
      // 로그인 성공 -> 메인으로
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : undefined) ??
        err?.message ??
        "로그인에 실패했습니다.";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={onSubmit} style={styles.form}>
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

        {msg && <p style={styles.error}>{msg}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          disabled={loading}
          style={styles.linkBtn}
        >
          로그인
        </button>

        <button
          type="button"
          onClick={() => navigate("/signup")}
          disabled={loading}
          style={styles.linkBtn}
        >
          회원가입
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
    width: 360,
    display: "grid",
    gap: 12,
    padding: 24,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  error: { color: "#c13030", fontSize: 14, marginTop: 4 },
  linkBtn: { background: "transparent", color: "#333", marginTop: 4 },
};
