// src/Plan/PlanCheckoutResultPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { api } from "../utils/api";

export default function PlanCheckoutResultPage() {
  const { search } = useLocation();
  const qs = new URLSearchParams(search);

  // ── 상태/라벨
  const rawStatus = qs.get("status") || "";
  const norm = (v) => String(v || "").trim().toUpperCase();
  const statusLabel = useMemo(() => {
    const s = norm(rawStatus);
    if (["PAID", "SUCCEEDED", "SUCCESS", "PARTIAL_PAID"].includes(s)) return "구독 완료";
    if (["PENDING", "READY", "IN_PROGRESS"].includes(s)) return "결제 진행 중";
    if (s === "NEEDS_CONFIRMATION") return "본인인증 필요";
    if (["CANCELLED", "CANCELED"].includes(s)) return "결제 취소됨";
    if (s === "FAILED") return "결제 실패";
    return "알 수 없음";
  }, [rawStatus]);
  const badgeTone = useMemo(() => {
    const s = norm(rawStatus);
    if (["PAID", "SUCCEEDED", "SUCCESS", "PARTIAL_PAID"].includes(s)) return "ok";
    if (["PENDING", "READY", "IN_PROGRESS", "NEEDS_CONFIRMATION"].includes(s)) return "warn";
    if (["FAILED", "CANCELLED", "CANCELED"].includes(s)) return "bad";
    return "neutral";
  }, [rawStatus]);

  // ── 반응형
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(max-width: 640px)").matches
      : false
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener?.("change", handler);
    mql.addListener?.(handler);
    return () => {
      mql.removeEventListener?.("change", handler);
      mql.removeListener?.(handler);
    };
  }, []);

  // ── 화면 표기용 상태
  const [plan, setPlan] = useState({ planCode: "", planName: "구독 플랜" });
  const [months, setMonths] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [products, setProducts] = useState([]);

  // ── 캐러셀
  const rowRef = useRef(null);
  const scrollByAmount = useMemo(() => (isMobile ? 220 : 300), [isMobile]);
  const scrollLeft = () => rowRef.current?.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  const scrollRight = () => rowRef.current?.scrollBy({ left: scrollByAmount, behavior: "smooth" });

  // ── PlanDetailPage와 동일한 스타일의 파서: pbnote / note 모두 커버
  function splitBenefit(note) {
    if (!note) return { desc: "", items: [] };
    const normalized = String(note)
      .replaceAll("\r\n", "\n")   // CRLF → LF
      .replace(/•/g, "- ")        // 동그라미 불릿 → 하이픈
      .replace(/ - /g, "\n- ");   // inline " - " → 줄바꿈 하이픈
    const lines = normalized.split("\n").map(s => s.trim()).filter(Boolean);

    const items = [];
    const descParts = [];
    for (const line of lines) {
      if (/^(-|\*)\s+/.test(line)) items.push(line.replace(/^(-|\*)\s+/, ""));
      else descParts.push(line);
    }
    // 중복 제거
    const seen = new Set();
    const uniq = items.filter(x => {
      const k = x.trim();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return { desc: descParts[0] || "", items: uniq };
  }

  useEffect(() => {
    (async () => {
      // 1) URL 파라미터 우선
      let codeFromUrl = qs.get("planCode") || qs.get("code") || "";
      let monthsFromUrl = qs.get("months") || qs.get("term") || "";

      // 2) sessionStorage 폴백 (Checkout에서 저장해둠)
      if (!codeFromUrl || !monthsFromUrl) {
        try {
          const lastQ = sessionStorage.getItem("lastCheckoutQuery");
          if (lastQ) {
            const lqs = new URLSearchParams(lastQ);
            codeFromUrl = codeFromUrl || lqs.get("planCode") || lqs.get("code") || "";
            monthsFromUrl = monthsFromUrl || lqs.get("months") || lqs.get("term") || "";
          }
        } catch {}
      }

      // 3) 서버 요약(옵션) — 플랜명/개월수 보정
      let sumPlanCode = "";
      let sumPlanName = "";
      let sumMonths = "";
      try {
        const invoiceId = qs.get("invoiceId") || "";
        const paymentId = qs.get("paymentId") || "";
        if (invoiceId) {
          const { data } = await api.get("/plan/checkout/summary", { params: { invoiceId } });
          sumPlanCode = data?.planCode || data?.plan?.code || "";
          sumPlanName = data?.planName || data?.plan?.name || "";
          sumMonths   = data?.months || data?.termMonths || data?.planTerm || "";
        } else if (paymentId) {
          const { data } = await api.get(`/payments/${encodeURIComponent(paymentId)}`);
          sumPlanCode = data?.planCode || data?.plan?.code || "";
          sumPlanName = data?.planName || data?.plan?.name || "";
          sumMonths   = data?.months || data?.termMonths || data?.planTerm || "";
        }
      } catch {}

      // 최종 확정값(우선순위: URL > session > summary)
      const finalPlanCode = (codeFromUrl || sumPlanCode || "").toUpperCase();
      const finalMonths = Number(monthsFromUrl || sumMonths || 0) || 1;

      // 플랜명 보정
      let finalPlanName = sumPlanName || (finalPlanCode ? finalPlanCode : "구독 플랜");
      try {
        if (!sumPlanName && finalPlanCode) {
          const { data } = await api.get(`/plans/${encodeURIComponent(finalPlanCode)}`);
          finalPlanName = data?.planName || data?.name || finalPlanName;
          // note 폴백용 저장 (pbnote 없을 때)
          if (!benefits.length && (data?.note || "")) {
            const parsed = splitBenefit(data.note);
            if (parsed.items.length) setBenefits(parsed.items);
          }
        }
      } catch {}

      setPlan({ planCode: finalPlanCode, planName: finalPlanName });
      setMonths(finalMonths);

      // 4) planbenefit 테이블의 pbnote 로드 → 혜택 구성
      try {
        // 프로젝트 API에 맞게 필요 시 경로 수정
        const { data } = await api.get("/planbenefit", { params: { planCode: finalPlanCode } });
        // 데이터 형태 유연 대응
        const pbnote =
          Array.isArray(data) ? (data[0]?.pbnote ?? data[0]?.note ?? "") : (data?.pbnote ?? data?.note ?? "");
        const parsed = splitBenefit(pbnote);
        if (parsed.items.length) {
          setBenefits(parsed.items);
        }
      } catch {
        // pbnote 실패 시, 위에서 플랜 note로 폴백됨
      }

      // 5) 이 플랜으로 구매 가능한 상품 10개
      try {
        const { data } = await api.get("/products/eligible", {
          params: { planCode: finalPlanCode, limit: 10 },
        });
        const arr = Array.isArray(data) ? data : data?.items || [];
        setProducts(
          (arr || []).slice(0, 10).map((p, i) => ({
            id: p.id ?? p.productId ?? i,
            name: p.name ?? p.proName ?? p.title ?? "상품",
            imageUrl: p.imageUrl ?? p.thumbnailUrl ?? p.thumb ?? p.image ?? "/img/noimg.png",
            price: p.price ?? p.salePrice ?? p.amount ?? 0,
          }))
        );
      } catch {
        setProducts([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ── 테마/스타일
  const theme = {
    bg: "#FFFAFC",
    panel: "#FFFFFF",
    border: "#FFE3EE",
    borderStrong: "#FFD1E5",
    accent: "#FFC8DB",
    accentDeep: "#FFB3D0",
    accentSoft: "#FFF6FA",
    text: "#6F5663",
    textSub: "#9A8190",
    shadow: "0 10px 24px rgba(255, 175, 205, 0.15)",
    radius: 18,
  };
  const styles = {
    page: { background: `linear-gradient(180deg, ${theme.bg} 0%, #FFFFFF 100%)`, padding: "24px 16px 40px" },
    wrap: { maxWidth: 960, margin: "0 auto" },
    headerCard: { background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: theme.radius, boxShadow: theme.shadow, padding: isMobile ? "18px 16px" : "22px 24px", marginBottom: 18 },
    headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
    title: { fontSize: isMobile ? 22 : 26, fontWeight: 900, color: theme.text, margin: 0 },
    badge: (tone) => ({
      display: "inline-block", padding: "6px 12px", borderRadius: 999,
      background: tone==="ok"?"#EAFBF1":tone==="warn"?"#FFF7E6":tone==="bad"?"#FFF1F1":theme.accentSoft,
      border:     tone==="ok"?"1px solid #C7F0D9":tone==="warn"?"1px solid #FFE1B3":tone==="bad"?"1px solid #FFCCCC":`1px solid ${theme.borderStrong}`,
      color:      tone==="ok"?"#256D3F":tone==="warn"?"#925B16":tone==="bad"?"#B42318":theme.text,
      fontWeight: 800, fontSize: 12,
    }),
    subInfo: { color: theme.textSub, fontSize: 14, marginTop: 8, display: "flex", flexWrap: "wrap", gap: 12 },
    planName: { fontWeight: 700, color: theme.text },
    sectionCard: { background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: theme.radius, boxShadow: theme.shadow, padding: isMobile ? 14 : 18, marginBottom: 18 },
    sectionH: { fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 12 },
    benefitList: {
  margin: "0",
  paddingLeft: 20,           // 기본 불릿 들여쓰기
  color: theme.text,
},
benefitItem: {
  listStyle: "disc",         // 기본 동그라미 불릿
  marginBottom: 6,
  lineHeight: 1.55,
  fontSize: 14,
  fontWeight: 500,
  // 박스/테두리/배경 제거 (알약 형태 삭제)
},
    rowWrap: { position: "relative" },
    row: { display: "grid", gridAutoFlow: "column", gridAutoColumns: isMobile ? "70%" : "24%", overflowX: "auto", gap: 12, scrollSnapType: "x mandatory", paddingBottom: 6 },
    arrow: (pos) => ({ position: "absolute", top: "50%", transform: "translateY(-50%)", [pos]: -6, background: "#fff", border: `1px solid ${theme.borderStrong}`, width: 36, height: 36, borderRadius: 999, boxShadow: "0 8px 16px rgba(0,0,0,0.06)", cursor: "pointer", display: isMobile ? "none" : "grid", placeItems: "center", fontWeight: 800, color: theme.text }),
    productCard: { background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 14, boxShadow: "0 6px 16px rgba(255, 180, 205, 0.12)", overflow: "hidden", scrollSnapAlign: "start", display: "grid", gridTemplateRows: "140px 1fr auto" },
    imgBox: { background: theme.accentSoft, display: "grid", placeItems: "center" },
    img: { width: "100%", height: "100%", objectFit: "cover" },
    productBody: { padding: "10px 12px" },
    productName: { fontWeight: 700, color: theme.text, fontSize: 14, lineHeight: 1.35, minHeight: 38, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
    price: { marginTop: 6, color: theme.textSub, fontSize: 13, fontWeight: 700 },
    productActions: { padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderTop: `1px solid ${theme.border}` },
    btn: { padding: "10px 12px", borderRadius: 999, border: `1px solid ${theme.borderStrong}`, background: "#fff", color: "#6F5663", fontWeight: 800, fontSize: 13, letterSpacing: 0.2, textAlign: "center", textDecoration: "none", display: "inline-block", width: "100%" },
    btnPrimary: { padding: "10px 12px", borderRadius: 999, border: "none", background: `linear-gradient(180deg, ${theme.accent}, ${theme.accentDeep})`, color: "#fff", fontWeight: 900, fontSize: 13, letterSpacing: 0.2, textAlign: "center", textDecoration: "none", display: "inline-block", width: "100%" },
    footerActions: { marginTop: 10, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {/* 상단: 구독 결과 + 상태 배지 + 플랜/개월 */}
        <div style={styles.headerCard}>
          <div style={styles.headerRow}>
            <h1 style={styles.title}>구독 결과</h1>
            <span style={styles.badge(badgeTone)}>{statusLabel}</span>
          </div>
          <div style={styles.subInfo}>
            <span>플랜명: <span style={styles.planName}>{plan.planName}</span></span>
            <span>구독 기간: <b>{months ? `${months}개월` : "-"}</b></span>
          </div>
        </div>

        {/* 플랜 혜택 (planbenefit.pbnote → 폴백: plan.note) */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionH}>구독 플랜 혜택</div>
          {benefits.length ? (
            <ul style={styles.benefitList}>
              {benefits.map((b, i) => (
                <li key={i} style={styles.benefitItem}>{b}</li>
              ))}
            </ul>
          ) : (
            <div style={{ color: theme.textSub, fontSize: 14 }}>
              플랜 혜택 정보를 불러오지 못했습니다.
            </div>
          )}
        </div>

        {/* 구매 가능한 상품 */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionH}>이 플랜으로 구매 가능한 상품</div>
          <div style={{ position: "relative" }}>
            {!isMobile && (
              <>
                <button style={styles.arrow("left")} onClick={scrollLeft} aria-label="left">‹</button>
                <button style={styles.arrow("right")} onClick={scrollRight} aria-label="right">›</button>
              </>
            )}
            <div ref={rowRef} style={styles.row}>
              {(products || []).map((p) => (
                <div key={p.id} style={styles.productCard}>
                  <div style={styles.imgBox}><img src={p.imageUrl} alt={p.name} style={styles.img} /></div>
                  <div style={styles.productBody}>
                    <div style={styles.productName}>{p.name}</div>
                    <div style={styles.price}>{Number(p.price || 0).toLocaleString()}원</div>
                  </div>
                  <div style={styles.productActions}>
                    <Link to={`/products/${p.id}`} style={styles.btn}>상품 페이지</Link>
                    <Link to={`/member/subscriptions/my`} style={styles.btnPrimary}>구독 확인</Link>
                  </div>
                </div>
              ))}
              {!products?.length && (
                <div style={{ display: "grid", placeItems: "center", color: theme.textSub, height: 180 }}>
                  구매 가능한 상품이 없습니다.
                  <div style={{ marginTop: 12 }}>
                    <Link to="/products" style={styles.btnPrimary}>상품 페이지로</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 하단 이동 */}
          <div style={styles.footerActions}>
            <Link to="/products" style={styles.btn}>상품 페이지로</Link>
            <Link to="/member/subscriptions/my" style={styles.btnPrimary}>내 구독 확인</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
