// src/Plan/PlanCheckoutResultPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentsApi } from "../utils/api";

export default function CheckoutResultPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(search);

  // PortOne가 리다이렉트에 붙여줄 수 있는 값들
  const paymentId = qs.get("paymentId") || null;
  const amountInQuery = qs.get("amount") || null;
  const invoiceIdInQuery = qs.get("invoiceId") || null;

  // 실패/취소 쿼리(선택) - 있으면 안내 메시지 우선 표시
  const pgErrorCode = qs.get("code");
  const pgErrorMsg = qs.get("message");

  // ★ 세션에서 보정
  const invoiceIdRaw =
    invoiceIdInQuery ?? sessionStorage.getItem("plan_invoice_id");

  // 숫자 변환 안전화: null, "null", "undefined", "", "NaN" 방어
  const invoiceId =
    invoiceIdRaw &&
    invoiceIdRaw !== "null" &&
    invoiceIdRaw !== "undefined" &&
    invoiceIdRaw.trim() !== "" &&
    !Number.isNaN(Number(invoiceIdRaw))
      ? Number(invoiceIdRaw)
      : null;

  const [msg, setMsg] = useState("결제 확인 중...");
  const ranRef = useRef(false); // 중복 실행 방지

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        // 0) PG가 실패/취소를 명시했다면 바로 메시지
        if (pgErrorCode) {
          setMsg(
            `결제 실패: ${pgErrorMsg || pgErrorCode} (필요 시 다시 시도해주세요)`
          );
          return;
        }

        // 1) invoiceId 우선 확인 (권장 플로우)
        if (invoiceId) {
          const { data } = await paymentsApi.confirm({ invoiceId });
          if (!data?.success) throw new Error(data?.message || "결제 확인 실패");
          // 성공 → 세션 정리
          try {
            sessionStorage.removeItem("plan_invoice_id");
          } catch {}
          setMsg("결제가 완료되었습니다 🎉");
          setTimeout(() => navigate("/sub/me"), 1200);
          return;
        }

        // 2) fallback: paymentId + amount 로 확인
        if (paymentId && amountInQuery && !Number.isNaN(Number(amountInQuery))) {
          const { data } = await paymentsApi.confirm({
            paymentId,
            amount: Number(amountInQuery),
          });
          if (!data?.success) throw new Error(data?.message || "결제 확인 실패");
          setMsg("결제가 완료되었습니다 🎉");
          setTimeout(() => navigate("/sub/me"), 1200);
          return;
        }

        // 3) 여기까지 못 오면 식별 불가
        setMsg("결제 확인에 필요한 정보가 부족합니다.");
      } catch (e) {
        console.error(e);
        setMsg(e?.message || "결제 확인 중 오류가 발생했습니다.");
      }
    })();
  }, [invoiceId, paymentId, amountInQuery, pgErrorCode, pgErrorMsg, navigate]);

  return (
    <div style={{ maxWidth: 720, margin: "32px auto", padding: 16 }}>
      <h1>결과</h1>
      <p>{msg}</p>
    </div>
  );
}
