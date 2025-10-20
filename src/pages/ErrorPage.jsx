// src/pages/ErrorPage.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";
import styles from "./ErrorPage.module.css";
import logo from "../images/logo.png"; // 로고 경로 맞춰서 배치

export default function ErrorPage() {
  const navigate = useNavigate();
  const routeErr = useRouteError?.() ?? null;         // 라우터에서 throw된 에러
  const { search, state } = useLocation();            // /error?code=&reason=  or  navigate(..., {state})
  const params = new URLSearchParams(search);

  const data = useMemo(() => {
    // 1) 라우터 에러 우선
    if (routeErr) {
      if (isRouteErrorResponse(routeErr)) {
        return {
          code: routeErr.status,
          reason: routeErr.statusText || "Route Error",
          detail: (routeErr.data && (routeErr.data.message || routeErr.data.detail || String(routeErr.data))) || "",
        };
      }
      // 일반 Error 객체
      return {
        code: 500,
        reason: routeErr?.name || "Unexpected Error",
        detail: routeErr?.message || String(routeErr),
      };
    }

    // 2) /error?code=...&reason=...
    const codeQP = Number(params.get("code"));
    const reasonQP = params.get("reason");
    const detailQP = params.get("detail");

    // 3) navigate("/error", { state: { code, reason, detail }})
    const codeST = state?.code;
    const reasonST = state?.reason;
    const detailST = state?.detail;

    const code = Number.isFinite(codeQP) ? codeQP :
                 Number.isFinite(codeST) ? codeST : 500;

    const reason = reasonQP || reasonST || defaultReason(code);
    const detail = detailQP || detailST || "";

    return { code, reason, detail };
  }, [routeErr, params, state]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <img src={logo} alt="도담도담 로고" className={styles.logo} />
        <div className={styles.badge}>오류 안내</div>

        <h1 className={styles.title}>
          {data.code} <span className={styles.reason}>{data.reason}</span>
        </h1>

        {data.detail && <p className={styles.detail}>{data.detail}</p>}

        <div className={styles.meta}>
          <div><span>요청 시간</span><strong>{new Date().toLocaleString()}</strong></div>
          {/* 필요하다면 서버에서 전달하는 requestId를 detail에 포함해서 노출 */}
        </div>

        <div className={styles.actions}>
          <button className={styles.primary} onClick={() => navigate("/")}>홈으로 가기</button>
          <button className={styles.secondary} onClick={() => navigate(-1)}>이전 페이지</button>
        </div>

        <p className={styles.help}>
          계속 문제가 발생하면 고객센터(1588-1234) 또는 <a href="mailto:support@dodamtoyland.co.kr">이메일</a>로 문의해 주세요.
        </p>
      </div>
    </div>
  );
}

function defaultReason(code) {
  switch (code) {
    case 400: return "잘못된 요청";
    case 401: return "인증이 필요합니다";
    case 403: return "접근 권한이 없습니다";
    case 404: return "페이지를 찾을 수 없어요";
    case 408: return "요청 시간 초과";
    case 409: return "요청 충돌";
    case 422: return "처리 불가한 요청";
    case 429: return "요청이 너무 많아요";
    case 500: return "서버 오류";
    case 502: return "게이트웨이 오류";
    case 503: return "서비스 점검 중";
    case 504: return "게이트웨이 시간 초과";
    default:  return "알 수 없는 오류";
  }
}
