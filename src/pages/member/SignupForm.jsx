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
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      // 백엔드: POST /member/signup
      await api.post("/member/signup", form);
      // 가입 성공 -> 로그인 페이지로
      navigate("/member/login", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "회원가입에 실패했습니다.";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={onSubmit} style={styles.form}>
        <h2>회원가입</h2>

        <label htmlFor="mid">아이디</label>
        <input
          id="mid"
          name="mid"
          value={form.mid}
          onChange={onChange}
          placeholder="아이디"
          required
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
        />

        <label htmlFor="mname">이름</label>
        <input
          id="mname"
          name="mname"
          value={form.mname}
          onChange={onChange}
          placeholder="이름"
          required
        />

        <label htmlFor="mtel">전화번호</label>
        <input
          id="mtel"
          name="mtel"
          value={form.mtel}
          onChange={onChange}
          placeholder="010-0000-0000"
        />

        {msg && <p style={styles.error}>{msg}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "처리 중..." : "가입하기"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/member/login")}
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
  linkBtn: { background: "transparent", color: "#333", marginTop: 4 },
};
