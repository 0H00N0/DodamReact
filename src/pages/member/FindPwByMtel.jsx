import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./MemberTheme.css";

export default function FindPwByMtel() {
  const [mid, setMid] = useState("");
  const [mname, setMname] = useState("");
  const [mtel, setMtel] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setResult("");

    // ✅ 최소 보정: 공백 제거 + 전화번호 숫자만
    const onlyDigits = (s) => (s || "").replace(/\D/g, "");
    const payload = {
      mid: (mid || "").trim(),
      mname: (mname || "").trim(),
      mtel: onlyDigits(mtel),
    };

    if (!payload.mid || !payload.mname || !payload.mtel) {
      setResult("아이디/이름/전화번호를 모두 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/member/findPwByMtel", payload);
      // 인증 성공 → 비밀번호 변경 페이지로 이동
      navigate("/member/changePwDirect", { state: { mid: payload.mid } });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "회원정보가 일치하지 않습니다.";
      setResult(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-page">
      <div className="m-card">
    <form className="m-form" onSubmit={handleVerify} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
      <input
        value={mid}
        onChange={(e) => setMid(e.target.value)}
        placeholder="아이디"
        autoComplete="username"
      />
      <input
        value={mname}
        onChange={(e) => setMname(e.target.value)}
        placeholder="이름"
      />
      <input
        type="tel"
        value={mtel}
        onChange={(e) => setMtel(e.target.value)}
        placeholder="전화번호(예: 010-1234-5678)"
        inputMode="tel"
      />
      <button type="submit" disabled={loading}>
        {loading ? "확인 중..." : "정보 확인"}
      </button>
      {!!result && <div style={{ color: "#c13030", fontSize: 14 }}>{result}</div>}
    </form>
      </div>
    </div>
  );
}
