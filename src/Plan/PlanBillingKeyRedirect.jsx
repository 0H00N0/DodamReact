// src/Plan/PlanBillingKeyRedirect.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";

function parseAllParams() {
  const u = new URL(window.location.href);
  const merged = new URLSearchParams(u.search);

  const h = u.hash || "";
  const qIndex = h.indexOf("?");
  if (qIndex >= 0) {
    const hashQs = new URLSearchParams(h.substring(qIndex + 1));
    for (const [k, v] of hashQs.entries()) merged.set(k, v);
  }

  if (h.startsWith("#/?")) {
    const hashQs = new URLSearchParams(h.substring(2));
    for (const [k, v] of hashQs.entries()) merged.set(k, v);
  }
  return merged;
}

function pick(params, keys) {
  for (const k of keys) {
    const v = params.get(k);
    if (v != null && String(v).length > 0) return v;
  }
  return null;
}

export default function BillingKeyRedirect() {
  const [msg, setMsg] = useState("처리 중…");
  const [busy, setBusy] = useState(true);
  const [debug, setDebug] = useState(""); // 화면 디버깅
  const params = useMemo(() => parseAllParams(), []);

  // ✅ 항상 '마지막 체크아웃 URL'을 최우선으로 복귀
  function goBackToCheckout() {
    const last = sessionStorage.getItem("lastCheckoutUrl");
    if (last && last.startsWith(window.location.origin)) {
      window.location.assign(last);
      return;
    }
    const lastQuery = sessionStorage.getItem("lastCheckoutQuery") || "";
    window.location.assign(`${window.location.origin}/#/plan/checkout${lastQuery}`);
  }

  useEffect(() => {
    (async () => {
      try {
        const txType = (pick(params, ["transactionType", "txType"]) || "").toUpperCase();
        const status = (pick(params, ["status", "result"]) || "").toUpperCase();
        const statusLike = status || ((pick(params, ["billingKey"]) || "").toUpperCase());
        const token = pick(params, ["billingIssueToken", "issueToken", "token"]);

        // 화면 디버깅용
        setDebug(
          "URL=" + window.location.href + "\n" +
          "params=" + JSON.stringify(Object.fromEntries(params.entries())) + "\n" +
          "txType=" + txType + ", status=" + status + ", token=" + token
        );

        // 본인인증 확정
        if (statusLike === "NEEDS_CONFIRMATION" && token) {
          setMsg("본인인증을 확인하고 있습니다…");

          const s = await api.post("/billing-keys/confirm", { billingIssueToken: token });
          setDebug(prev => prev + "\nconfirmRes=" + JSON.stringify(s.data));

          const realKey = s?.data?.billingKey;
          if (realKey && !String(realKey).startsWith("billing-issue-token")) {
            const r = await api.post("/billing-keys/register", {
              billingKey: realKey,
              rawJson: JSON.stringify(s.data),
            });
            setDebug(prev => prev + "\nregisterRes=" + JSON.stringify(r.data));
            setMsg("카드 등록이 완료되었습니다. 아래 버튼으로 이전 화면으로 돌아가세요.");
          } else {
            setMsg("본인인증 확인에 실패했습니다. 다시 시도해 주세요.");
          }
          setBusy(false);
          return;
        }

        if (status === "CANCELED" || status === "FAILED") {
          setMsg("카드 등록이 취소되었거나 실패했습니다.");
          setBusy(false);
          return;
        }

        if (status === "ISSUED" || txType === "ISSUE_BILLING_KEY") {
          setMsg("등록 결과를 확인 중입니다. 잠시 후 목록에서 갱신해 보세요.");
          setBusy(false);
          return;
        }

        setMsg("유효하지 않은 접근입니다. 창을 닫고 카드 등록을 다시 시도해 주세요.");
      } catch (e) {
        setMsg("처리 중 오류: " + (e?.message || e));
        setDebug(prev => prev + "\nerror=" + (e?.message || JSON.stringify(e)));
      } finally {
        setBusy(false);
      }
    })();
  }, [params]);

  return (
    <div style={{ maxWidth: 520, margin: "32px auto" }}>
      <h2>카드 등록</h2>
      <p>{msg}</p>
      {busy && <p style={{ color: "#666" }}>잠시만 기다려 주세요…</p>}

      {/* 돌아가기 버튼 */}
      <div style={{ marginTop: 16 }}>
        <button
          onClick={goBackToCheckout}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #4096ff",
            background: "#4096ff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          이전 화면으로 돌아가기
        </button>
      </div>

      {/* 디버깅 정보 출력 */}
      {debug && (
        <pre
          style={{
            marginTop: 20,
            padding: 10,
            background: "#f4f4f4",
            color: "#333",
            fontSize: 12,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {debug}
        </pre>
      )}
    </div>
  );
}
