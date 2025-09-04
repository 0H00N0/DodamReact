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
    e.preventDefault();                // ★ 괄호 필수
    setLoading(true);
    setMsg("");
    try {
      await api.post("/member/loginForm", {
        mid: form.mid.trim(),
        mpw: form.mpw,
      });
      // 세션이 생겼으므로 헤더 갱신 이벤트 발행
      window.dispatchEvent(new Event("auth:changed"));
      // 마이페이지로 이동(아래 5번 라우트 추가 필요)
      navigate("/", { replace: true });
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
    <div style={{display:"grid",placeItems:"center",minHeight:"60vh",padding:40}}>
      <form onSubmit={onSubmit} style={{width:360,display:"grid",gap:12,padding:24,borderRadius:12,background:"#fff",boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}>
        <h2>로그인</h2>
        <label htmlFor="mid">아이디</label>
        <input id="mid" name="mid" value={form.mid} onChange={onChange} />

        <label htmlFor="mpw">비밀번호</label>
        <input id="mpw" name="mpw" type="password" value={form.mpw} onChange={onChange} />

        {msg && <div style={{color:"#c13030",fontSize:14}}>{msg}</div>}

        <button disabled={loading}>{loading ? "로그인 중..." : "로그인"}</button>
      </form>
    </div>
  );
}
