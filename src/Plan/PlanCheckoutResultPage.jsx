// src/Plan/CheckoutResultPage.jsx  (혹은 PlanCheckoutResultPage.jsx)
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentsApi } from "../utils/api";

export default function CheckoutResultPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(search);

  const paymentId = qs.get("paymentId");         // PortOne 리다이렉트 기본
  const invoiceIdInQuery = qs.get("invoiceId");  // 혹시 모를 케이스 대비
  const [msg, setMsg] = useState("결제 확인 중...");

  useEffect(() => {
    (async () => {
      try {
        if (!paymentId && !invoiceIdInQuery) {
          setMsg("결제 ID가 없습니다.");
          return;
        }

        // 백엔드가 어떤 이름을 받든 안전하게 보냄
        await paymentsApi.confirm({
          paymentId: paymentId ?? null,
          invoiceId: invoiceIdInQuery ?? paymentId ?? null,
        });

        setMsg("결제가 완료되었습니다 🎉");
        setTimeout(() => navigate("/sub/me"), 1200);
      } catch (e) {
        console.error(e);
        setMsg("결제 확인 중 오류가 발생했습니다.");
      }
    })();
  }, [paymentId, invoiceIdInQuery, navigate]);

  return (
    <div style={{ maxWidth: 720, margin: "32px auto", padding: 16 }}>
      <h1>결제 결과</h1>
      <p>{msg}</p>
    </div>
  );
}
