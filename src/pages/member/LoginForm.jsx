import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

// --- 소셜 로그인 유틸 ---
function randomState() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function kakaoAuthUrl() {
  const clientId = process.env.REACT_APP_KAKAO_REST_KEY;
  const redirect = `${process.env.REACT_APP_REDIRECT_BASE}/oauth/callback/kakao`;
  return `https://kauth.kakao.com/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code`;
}
function naverAuthUrl() {
  const clientId = process.env.REACT_APP_NAVER_CLIENT_ID;
  const redirect = `${process.env.REACT_APP_REDIRECT_BASE}/oauth/callback/naver`;
  const state = randomState();
  sessionStorage.setItem("naver_oauth_state", state); // ✅ state 저장(콜백에서 검증)
  return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirect)}&state=${encodeURIComponent(
    state
  )}`;
}

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

      // ✅ 1) 프론트 유효성 검사: 요청 전
    if (!form.mid.trim() || !form.mpw) {
      setMsg("아이디/비밀번호를 입력하세요.");
      return; // 여기서 끝내면 네트워크 요청 안 감
    }

    if (loading) return;
    setLoading(true);
    setMsg("");
    try {
      await api.post("/member/loginForm", {
        mid: form.mid.trim(),
        mpw: form.mpw,
      });
      sessionStorage.setItem("auth_hint", "1");
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

  // 소셜 버튼 동작
  const goKakao = () => {
    if (loading) return;
    setLoading(true);
    window.location.href = kakaoAuthUrl();
  };
  const goNaver = () => {
    if (loading) return;
    setLoading(true);
    window.location.href = naverAuthUrl();
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

        {/* 로컬 로그인 */}
        <button type="submit" disabled={loading} style={styles.primaryBtn}>
          {loading ? "로그인 중..." : "로그인"}
        </button>

        {/* 보조 액션 */}
        <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            disabled={loading}
            style={styles.linkBtn}
          >
            회원가입으로
          </button>
          <button
            type="button"
            onClick={() =>
              window.open("/member/findIdModal", "_blank", "width=500,height=600")
            }
            disabled={loading}
            style={styles.linkBtn}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            onClick={() =>
              window.open("/member/findPw", "_blank", "width=500,height=600")
            }
            disabled={loading}
            style={styles.linkBtn}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 구분선 */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>또는 소셜로 계속</span>
          <span style={styles.dividerLine} />
        </div>

        {/* 소셜 로그인 */}
        <button
          type="button"
          onClick={goKakao}
          disabled={loading}
          style={styles.kakaoBtn}
          aria-label="카카오로 로그인"
        >
          카카오로 로그인
        </button>
        <button
          type="button"
          onClick={goNaver}
          disabled={loading}
          style={styles.naverBtn}
          aria-label="네이버로 로그인"
        >
          네이버로 로그인
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
  linkBtn: {
    background: "transparent",
    color: "#333",
    marginTop: 4,
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 12px",
    cursor: "pointer",
  },
  divider: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 8,
    margin: "8px 0 4px",
  },
  dividerLine: { height: 1, background: "#e5e7eb" },
  dividerText: { fontSize: 12, color: "#666" },
  kakaoBtn: {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    background: "#FEE500",
    color: "#000",
  },
  naverBtn: {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    background: "#03C75A",
    color: "#fff",
  },
};
