import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./MemberTheme.css";

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
  sessionStorage.setItem("naver_oauth_state", state);
  return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirect)}&state=${encodeURIComponent(state)}`;
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

    if (!form.mid.trim() || !form.mpw) {
      setMsg("아이디/비밀번호를 입력하세요.");
      return;
    }

    if (loading) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post(
  "/member/loginForm",
  { mid: form.mid.trim(), mpw: form.mpw },
  { withCredentials: true }
);

sessionStorage.setItem("user", JSON.stringify(res.data));

console.log("로그인 응답:", res.data); 

sessionStorage.setItem("auth_hint", "1");
window.dispatchEvent(new Event("auth:changed"));
navigate("/", { replace: true });
    } catch (err) {
      const KOREAN_INVALID = "아이디 혹은 비밀번호가 맞지 않습니다.";
      const status = err?.response?.status;
      let message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "";

      if (!err?.response) {
        setMsg("로그인 서버와 통신에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      if (status === 401 && !message) message = KOREAN_INVALID;
      if (typeof message === "string" && /invalid id\/pw/i.test(message)) message = KOREAN_INVALID;
      if (!message) message = KOREAN_INVALID;

      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="member-page">
      <form onSubmit={onSubmit} className="m-card m-form" noValidate>
        <h2 className="m-title">로그인</h2>

        <label htmlFor="mid" className="m-label">아이디</label>
        <input id="mid" name="mid" value={form.mid} onChange={onChange} className="m-input" />

        <label htmlFor="mpw" className="m-label">비밀번호</label>
        <input id="mpw" name="mpw" type="password" value={form.mpw} onChange={onChange} className="m-input" />

        {msg && <div className="m-error" role="alert">{msg}</div>}

        {/* 로컬 로그인 */}
        <button type="submit" disabled={loading} className="m-btn">
          {loading ? "로그인 중..." : "로그인"}
        </button>

        {/* 보조 액션 */}
        <div className="m-actions">
          <button
            type="button"
            onClick={() => navigate("/signup")}
            disabled={loading}
            className="m-btn ghost"
          >
            회원가입으로
          </button>
          <button
            type="button"
            onClick={() => window.open("/auth/find-id", "_blank", "width=500,height=600")}
            disabled={loading}
            className="m-btn ghost"
          >
            아이디 찾기
          </button>
          <button
            type="button"
            onClick={() => window.open("/auth/find-pw", "_blank", "width=500,height=600")}
            disabled={loading}
            className="m-btn ghost"
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 구분선 */}
        <div className="m-divider" aria-hidden="true">
          <span className="m-divider-line" />
          <span className="m-divider-text">또는 소셜로 계속</span>
          <span className="m-divider-line" />
        </div>

        {/* 소셜 로그인 */}
        <button
          type="button"
          onClick={goKakao}
          disabled={loading}
          className="m-btn kakao"
          aria-label="카카오로 로그인"
        >
          카카오로 로그인
        </button>
        <button
          type="button"
          onClick={goNaver}
          disabled={loading}
          className="m-btn naver"
          aria-label="네이버로 로그인"
        >
          네이버로 로그인
        </button>
      </form>
    </div>
  );
}
