// src/pages/member/DeleteAccount.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function DeleteAccount() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [joinWay, setJoinWay] = useState("LOCAL"); // "LOCAL" | "KAKAO" | "NAVER" ...
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/member/me");
        if (!alive) return;
        setJoinWay((data?.joinWay || "LOCAL").toUpperCase());
      } catch {
        nav("/login", { replace: true }); // 미로그인 → 로그인으로
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [nav]);

  const isLocal = joinWay === "LOCAL";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agree) {
      setError("탈퇴 동의에 체크해 주세요.");
      return;
    }
    if (isLocal && !password.trim()) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }
    if (!window.confirm("정말 탈퇴하시겠어요? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      await api.delete("/member/delete", {
        data: {
          ...(isLocal ? { password } : {}),
          ...(reason ? { reason } : {}),
        },
      });
      alert("회원 탈퇴가 완료되었습니다.");
      // 백엔드에서 세션 무효화됨 — 프론트 상태도 정리
      try {
        sessionStorage.clear();
        localStorage.removeItem("sid");
        window.dispatchEvent(new Event("auth:changed"));
      } catch {}
      nav("/login", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "탈퇴 처리 중 오류가 발생했습니다.";
      setError(msg);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>로딩중...</div>;

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <h2 style={{ marginBottom: 12 }}>회원 탈퇴</h2>
      <p style={{ color: "#666", marginBottom: 16 }}>
        탈퇴 시 개인정보는 마스킹 처리되고 계정 상태가 <b>DELETED</b>로 전환됩니다. 동일 아이디/소셜로 재가입이 가능합니다.
      </p>

      <form onSubmit={onSubmit}>
        {isLocal && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="현재 비밀번호"
              autoComplete="current-password"
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>탈퇴 사유 (선택)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="탈퇴 사유를 입력해 주세요"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", resize: "vertical" }}
          />
        </div>

        <div style={{ margin: "12px 0" }}>
          <label style={{ userSelect: "none" }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />{" "}
            탈퇴 시 개인정보 마스킹/로그인 차단에 동의합니다.
          </label>
        </div>

        {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

        <button
          type="submit"
          style={{
            background: "#d32f2f", color: "#fff", border: "none",
            padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700,
          }}
        >
          회원 탈퇴
        </button>
      </form>
    </div>
  );
}
