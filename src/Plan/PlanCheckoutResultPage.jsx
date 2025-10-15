// src/Plan/PlanCheckoutResultPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { api } from "../utils/api";

export default function PlanCheckoutResultPage() {
  const { search } = useLocation();
  const qs = new URLSearchParams(search);

  // ===== 상태 라벨 =====
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

  // ===== 반응형 =====
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(max-width: 640px)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = (e) => setIsMobile(e.matches);
    mq.addEventListener?.("change", on);
    mq.addListener?.(on);
    return () => {
      mq.removeEventListener?.("change", on);
      mq.removeListener?.(on);
    };
  }, []);

  // ===== 화면 상태 =====
  const [plan, setPlan] = useState({ planCode: "", planName: "구독 플랜" });
  const [months, setMonths] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [products, setProducts] = useState([]);

  // ===== 캐러셀 컨트롤 =====
  const rowRef = useRef(null);
  const scrollByAmount = useMemo(() => (isMobile ? 240 : 320), [isMobile]);
  const scrollLeft = () => rowRef.current?.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  const scrollRight = () => rowRef.current?.scrollBy({ left: scrollByAmount, behavior: "smooth" });

  // ===== 유틸 =====
  const splitBenefit = (note) => {
    if (!note) return [];
    // 줄바꿈/하이픈/• 불릿 모두 지원
    const normalized = String(note)
      .replaceAll("\r\n", "\n")
      .replace(/•/g, "- ")
      .replace(/ - /g, "\n- ");
    const lines = normalized.split("\n").map((s) => s.trim()).filter(Boolean);

    const items = [];
    for (const line of lines) {
      if (/^(-|\*)\s*/.test(line)) items.push(line.replace(/^(-|\*)\s*/, ""));
      else items.push(line); // 불릿이 없어도 한 줄짜리 혜택으로 취급
    }
    // 중복 제거
    const seen = new Set();
    return items.filter((x) => {
      const k = x.trim();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const allowsHighPrice = (note = "") =>
    /100 ?만\s*원\s*이상|1000000\s*원\s*이상|백 ?만원\s*이상/.test(String(note).replaceAll(",", ""));

  // ===== 데이터 로딩 =====
  useEffect(() => {
    (async () => {
      // 1) URL 우선
      let codeFromUrl = qs.get("planCode") || qs.get("code") || "";
      let monthsFromUrl = qs.get("months") || qs.get("term") || "";

      // 2) sessionStorage 폴백(Checkout에서 저장)
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

      // 3) 서버 요약(옵션)
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
          sumMonths = data?.months || data?.termMonths || data?.planTerm || "";
        } else if (paymentId) {
          const { data } = await api.get(`/payments/${encodeURIComponent(paymentId)}`);
          sumPlanCode = data?.planCode || data?.plan?.code || "";
          sumPlanName = data?.planName || data?.plan?.name || "";
          sumMonths = data?.months || data?.termMonths || data?.planTerm || "";
        }
      } catch {}

      const finalPlanCode = (codeFromUrl || sumPlanCode || "").toUpperCase();
      const finalMonths = Number(monthsFromUrl || sumMonths || 0) || 1;

      // 플랜명 확보 + note 폴백
      let finalPlanName = sumPlanName || (finalPlanCode ? finalPlanCode : "구독 플랜");
      let planNoteForFallback = "";
      try {
        if (finalPlanCode) {
          const { data } = await api.get(`/plans/${encodeURIComponent(finalPlanCode)}`);
          finalPlanName = data?.planName || data?.name || finalPlanName;
          planNoteForFallback = data?.note || "";
        }
      } catch {}

      setPlan({ planCode: finalPlanCode, planName: finalPlanName });
      setMonths(finalMonths);

      // planbenefit → 혜택/고가상품 허용
      let highPriceAllowed = false;
      let pbnote = "";
      try {
        const { data } = await api.get("/planbenefit", { params: { planCode: finalPlanCode } });
        pbnote =
          Array.isArray(data) ? (data[0]?.pbnote ?? data[0]?.note ?? "") : (data?.pbnote ?? data?.note ?? "");
        const parsed = splitBenefit(pbnote);
        if (parsed.length) setBenefits(parsed);
        highPriceAllowed = allowsHighPrice(pbnote);
      } catch {
        // 실패 시 plans.note 폴백
        if (planNoteForFallback) {
          const parsed = splitBenefit(planNoteForFallback);
          if (parsed.length) setBenefits(parsed);
          highPriceAllowed = allowsHighPrice(planNoteForFallback);
        }
      }

      // 제품 목록(최대 10) — 100만원 제한 적용
      try {
        const params = { q: "", sort: "RECENT", page: 0, size: 10 };
        if (!highPriceAllowed) params.priceMax = 999999;
        const res = await api.get("/api/products/search", { params });
        let list = Array.isArray(res?.data?.content) ? res.data.content : Array.isArray(res?.data) ? res.data : [];

        if (!highPriceAllowed) {
          list = list.filter((p) => Number(p.proprice ?? p.price ?? 0) < 1000000);
        }

        const adapted = list.map((p, i) => ({
          pronum: p.pronum ?? p.proId ?? p.id ?? p.proid ?? i,
          name: p.proname ?? p.name ?? "상품명",
          price: p.proprice ?? p.price ?? null,
          image:
            p.proimg ||
            p.imageurl ||
            p.imageUrl ||
            p.thumbnailUrl ||
            p.imgpath ||
            p.image ||
            "/images/placeholder.png",
        }));
        setProducts(adapted.slice(0, 10));
      } catch {
        setProducts([]);
      }
    })();
  }, [search]);

  // ===== 테마 & 스타일 =====
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
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 999,
      background: tone === "ok" ? "#EAFBF1" : tone === "warn" ? "#FFF7E6" : tone === "bad" ? "#FFF1F1" : theme.accentSoft,
      border: tone === "ok" ? "1px solid #C7F0D9" : tone === "warn" ? "1px solid #FFE1B3" : tone === "bad" ? "1px solid #FFCCCC" : `1px solid ${theme.borderStrong}`,
      color: tone === "ok" ? "#256D3F" : tone === "warn" ? "#925B16" : tone === "bad" ? "#B42318" : theme.text,
      fontWeight: 800, fontSize: 12,
    }),
    subInfo: { color: theme.textSub, fontSize: 14, marginTop: 8, display: "flex", flexWrap: "wrap", gap: 12 },
    planName: { fontWeight: 700, color: theme.text },

    sectionCard: { background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: theme.radius, boxShadow: theme.shadow, padding: isMobile ? 14 : 18, marginBottom: 18 },
    sectionH: { fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 12 },

    // 혜택 리스트
    benefitList: { margin: 0, paddingLeft: 20, color: theme.text },
    benefitItem: { listStyle: "disc", marginBottom: 6, lineHeight: 1.55, fontSize: 14, fontWeight: 500 },

    // 캐러셀 + 화살표
    rowWrap: { position: "relative" },
    row: { display: "grid", gridAutoFlow: "column", gridAutoColumns: isMobile ? "75%" : "23%", overflowX: "auto", gap: 16, scrollSnapType: "x mandatory", paddingBottom: 6 },
    arrow: (pos) => ({
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      [pos]: -10,
      background: "#fff",
      border: `1px solid ${theme.borderStrong}`,
      width: 36, height: 36, borderRadius: 999,
      boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
      cursor: "pointer",
      display: isMobile ? "none" : "grid",
      placeItems: "center",
      fontWeight: 800,
      color: theme.text,
      zIndex: 2,
    }),

    productCard: { background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 14, boxShadow: "0 6px 16px rgba(255, 180, 205, 0.12)", overflow: "hidden", scrollSnapAlign: "start", display: "grid", gridTemplateRows: "180px 1fr auto" },
    imgBox: { background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" },
    img: { width: "100%", height: "100%", objectFit: "contain", backgroundColor: theme.accentSoft },

    productBody: { padding: "10px 12px" },
    productName: { fontWeight: 700, color: theme.text, fontSize: 14, lineHeight: 1.35, minHeight: 38, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
    price: { marginTop: 6, color: theme.textSub, fontSize: 13, fontWeight: 700 },

    productActions: { padding: 12, display: "grid", gridTemplateColumns: "1fr", borderTop: `1px solid ${theme.border}` },
    btn: { padding: "10px 12px", borderRadius: 999, border: `1px solid ${theme.borderStrong}`, background: "#fff", color: "#6F5663", fontWeight: 800, fontSize: 13, textAlign: "center", textDecoration: "none", width: "100%" },
    btnPrimary: { padding: "10px 12px", borderRadius: 999, border: "none", background: `linear-gradient(180deg, ${theme.accent}, ${theme.accentDeep})`, color: "#fff", fontWeight: 900, fontSize: 13, textAlign: "center", textDecoration: "none", width: "100%" },

    footerActions: { marginTop: 10, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {/* 헤더 */}
        <div style={styles.headerCard}>
          <div style={styles.headerRow}>
            <h1 style={styles.title}>구독 결과</h1>
            <span style={styles.badge(badgeTone)}>{statusLabel}</span>
          </div>
          <div style={styles.subInfo}>
            <span>플랜명: <span style={styles.planName}>{plan.planName}</span></span>
            <span>구독 기간: {months ? `${months}개월` : "-"}</span>
          </div>
        </div>

        {/* 플랜 혜택 */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionH}>구독 플랜 혜택</div>
          {benefits.length ? (
            <ul style={styles.benefitList}>
              {benefits.map((b, i) => (
                <li key={i} style={styles.benefitItem}>{b}</li>
              ))}
            </ul>
          ) : (
            <div style={{ color: theme.textSub, fontSize: 14 }}>플랜 혜택 정보를 불러오지 못했습니다.</div>
          )}
        </div>

        {/* 상품 섹션 */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionH}>
            {plan.planName ? `${plan.planName} 플랜 고객 인기상품` : "이 플랜으로 구매 가능한 상품"}
          </div>

          <div style={styles.rowWrap}>
            {/* 데스크탑 화살표 */}
            {!isMobile && (
              <>
                <button style={styles.arrow("left")} onClick={scrollLeft} aria-label="왼쪽으로">‹</button>
                <button style={styles.arrow("right")} onClick={scrollRight} aria-label="오른쪽으로">›</button>
              </>
            )}

            <div ref={rowRef} style={styles.row}>
              {products.length ? (
                products.map((p) => (
                  <div key={p.pronum} style={styles.productCard}>
                    <div style={styles.imgBox}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={styles.img}
                        onError={(e) => (e.target.src = "/images/placeholder.png")}
                      />
                    </div>
                    <div style={styles.productBody}>
                      <div style={styles.productName}>{p.name}</div>
                      <div style={styles.price}>
                        {p.price != null ? `${Number(p.price).toLocaleString()}원` : "가격정보 없음"}
                      </div>
                    </div>
                    <div style={styles.productActions}>
                      <Link to={`/products/${p.pronum}`} style={styles.btn}>상품 페이지</Link>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: "grid", placeItems: "center", color: theme.textSub, height: 180 }}>
                  구매 가능한 상품이 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div style={styles.footerActions}>
            <Link to="/products" style={styles.btn}>상품 페이지로</Link>
            <Link to="/member/subscriptions/my" style={styles.btnPrimary}>내 구독 확인</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
