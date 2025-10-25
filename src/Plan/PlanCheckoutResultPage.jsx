// src/Plan/PlanCheckoutResultPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { api, paymentsApi, API_BASE_URL } from "../utils/api";

/**
 * PlanCheckoutResultPage
 * - 요약: /plan/checkout/summary (paymentId | orderId | invoiceId)
 * - 영수증: /plan/attempts/receipt
 * - 혜택: /planbenefit -> /plans/{code}
 * - 추천상품: /api/products/search (FAMILY/VIP만 100만원 초과 허용)
 */
export default function PlanCheckoutResultPage() {
  // === URL 파라미터 ===
  const params = useParams();
  const handleId = (params.handleId || params.paymentId || "").trim(); // e.g. inv..., pay...
  const { search } = useLocation();
  const qs = new URLSearchParams(search);

  // === Helper ===
  const upper = (s) => String(s ?? "").trim().toUpperCase();
  const isNumber = (v) => Number.isFinite(Number(v));
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const getAnyQS = (...keys) => {
    for (const k of keys) {
      const v = qs.get(k);
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return "";
  };
  const getAny = (obj, ...paths) => {
    for (const p of paths) {
      const val = p.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
      if (val !== undefined && val !== null && String(val) !== "") return val;
    }
    return undefined;
  };
  const onlyDigits = (s) => {
    const m = String(s || "").match(/\d+/);
    return m ? m[0] : "";
  };
  const fixImage = (s) => {
    if (!s) return "/logo192.png";
    const v = String(s);
    if (/^https?:\/\//i.test(v)) return v;
    if (v.startsWith("/")) return v;
    return `${API_BASE_URL}/uploads/${encodeURIComponent(v)}`;
  };

  // === ID 해석 ===
  const isInv = /^inv/i.test(handleId);
  const invoiceUid = isInv
    ? handleId
    : getAnyQS("orderId", "invoiceUid", "invoiceuid", "invoiceId", "invoiceid");
  const paymentId = !isInv ? handleId : getAnyQS("paymentId", "paymentid", "paymentUid", "payUid");
  const invoiceIdNum = onlyDigits(invoiceUid) || onlyDigits(getAnyQS("invoiceId", "piId", "invoiceNo", "piid"));

  // === 상태 ===
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState({ planCode: "", planName: "구독 플랜" });
  const [months, setMonths] = useState(null);
  const [amount, setAmount] = useState(null);
  const [currency, setCurrency] = useState("KRW");
  const [benefits, setBenefits] = useState([]);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [products, setProducts] = useState([]);

  // === 캐러셀 ===
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(max-width: 640px)").matches
      : false
  );
  const railRef = useRef(null);
  const scrollByAmount = isMobile ? 240 : 320;
  const scrollLeft = () => railRef.current?.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  const scrollRight = () => railRef.current?.scrollBy({ left: scrollByAmount, behavior: "smooth" });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = (e) => setIsMobile(e.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  // === 혜택 파서 ===
  const parseBenefits = (raw) => {
    if (!raw) return [];
    const s = String(raw).replaceAll("\r\n", "\n").replace(/•/g, "- ").replace(/ - /g, "\n- ");
    const lines = s.split("\n").map((x) => x.trim()).filter(Boolean);
    const out = [];
    for (const line of lines) out.push(line.replace(/^[-*]\s*/, ""));
    const seen = new Set();
    return out.filter((x) => {
      const k = x.trim();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  // === 고가 노출 허용 규칙 (FAMILY / VIP만) ===
  const allowHighPrice = (code) => ["FAMILY", "VIP"].includes(upper(code));

  // === 메인 로딩 ===
  useEffect(() => {
    (async () => {
      let merged = {};

      // 1) 요약 조회
      const summaryParamSets = [];
      if (paymentId) summaryParamSets.push({ paymentId });
      if (invoiceUid) summaryParamSets.push({ orderId: invoiceUid });
      if (invoiceIdNum) summaryParamSets.push({ invoiceId: Number(invoiceIdNum) });

      for (const params of summaryParamSets) {
        try {
          const { data } = await api.get("/plan/checkout/summary", { params });
          if (
            data &&
            (getAny(data, "planCode", "plan.code", "plan.planCode") ||
              getAny(data, "planName", "plan.planName", "plan.name", "displayName") ||
              getAny(data, "months", "termMonths", "planTerm") ||
              getAny(data, "status", "invoiceStatus", "paymentStatus", "invoice.status", "payment.status") ||
              getAny(data, "amount", "piAmount", "payAmount"))
          ) {
            merged = { ...merged, ...data };
            break;
          }
        } catch {}
      }

      // 2) 부족 시 /payments/{id} 보강
      if (!merged.status || !merged.planCode) {
        const idForLookup = paymentId || invoiceUid || "";
        if (idForLookup) {
          try {
            const { data: pay } = await paymentsApi.lookup(idForLookup);
            merged.status = upper(getAny(pay, "status", "state", "result", "payment.status")) || merged.status;
            merged.receiptUrl =
              getAny(pay, "receiptUrl", "pgResponse.receipt.url", "pgResponse.card.receiptUrl") ||
              merged.receiptUrl;
            merged.planCode = upper(getAny(pay, "planCode", "plan.code")) || merged.planCode;
            merged.months = toNum(getAny(pay, "months", "termMonths", "planTerm")) ?? merged.months;
            merged.amount = toNum(getAny(pay, "amount", "piAmount", "payAmount")) ?? merged.amount;
            merged.currency = getAny(pay, "currency") || merged.currency || "KRW";
          } catch {}
        }
      }

      // 3) 영수증 URL
      if (!merged.receiptUrl) {
        try {
          const p = {};
          if (paymentId) p.paymentId = paymentId;
          else if (invoiceUid) p.invoiceId = invoiceUid;
          if (Object.keys(p).length) {
            const { data } = await api.get("/plan/attempts/receipt", { params: p });
            if (data?.url) merged.receiptUrl = data.url;
          }
        } catch {}
      }

      // 4) 플랜/혜택
      const planCode = upper(getAny(merged, "planCode", "plan.code", "plan.planCode", "code"));
      let planName =
        getAny(merged, "planName", "plan.planName", "plan.name", "displayName") ||
        (planCode || "구독 플랜");

      let benefitLines = [];
      const rawFromSummary = getAny(merged, "benefits", "planBenefits", "note", "plan.note");
      if (rawFromSummary) {
        benefitLines = Array.isArray(rawFromSummary) ? rawFromSummary : parseBenefits(rawFromSummary);
      }
      if (!benefitLines.length && planCode) {
        try {
          const { data } = await api.get("/planbenefit", { params: { planCode } });
          const pbnote = Array.isArray(data)
            ? (data[0]?.pbnote ?? data[0]?.note ?? "")
            : (data?.pbnote ?? data?.note ?? "");
          const parsed = parseBenefits(pbnote);
          if (parsed.length) benefitLines = parsed;
        } catch {}
      }
      if (!benefitLines.length && planCode) {
        try {
          const { data } = await api.get(`/plans/${encodeURIComponent(planCode)}`);
          planName = data?.displayName || data?.planName || data?.name || planName;
          const rawNote = data?.benefits || data?.note || "";
          const parsed = Array.isArray(rawNote) ? rawNote : parseBenefits(rawNote);
          if (parsed.length) benefitLines = parsed;
        } catch {}
      }

      // 5) 추천상품 (FAMILY/VIP 외에는 100만원 미만만 노출)
      try {
        const { data } = await api.get("/api/products/search", { params: { q: "", sort: "RECENT", page: 0, size: 12 } });
        let list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];

        const highAllowed = allowHighPrice(planCode);
        if (!highAllowed) {
          list = list.filter((p) => Number(p.proprice ?? p.price ?? 0) < 1_000_000);
        }

        const adapted = list.map((p, i) => ({
          pronum: p.pronum ?? p.proId ?? p.id ?? p.proid ?? i,
          name: p.proname ?? p.name ?? "상품명",
          price: p.proprice ?? p.price ?? null,
          image: fixImage(
            p.proimg || p.imageurl || p.imageUrl || p.thumbnailUrl || p.imgpath || p.image
          ),
        }));
        setProducts(adapted.slice(0, 12));
      } catch {
        setProducts([]);
      }

      // 6) 상태/금액/개월수 반영
      setStatus(upper(merged.status || ""));
      setPlan({ planCode, planName });
      setMonths(toNum(merged.months) ?? null);
      setAmount(toNum(merged.amount));
      setCurrency(merged.currency || "KRW");
      if (merged.receiptUrl) setReceiptUrl(merged.receiptUrl);
      setBenefits(benefitLines);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleId, search]);

  // === 라벨/배지 ===
  const statusLabel = useMemo(() => {
    const s = upper(status);
    if (["PAID", "SUCCEEDED", "SUCCESS", "PARTIAL_PAID"].includes(s)) return "구독 완료";
    if (["PENDING", "READY", "IN_PROGRESS", "NEEDS_CONFIRMATION"].includes(s)) return "결제 진행 중";
    if (["CANCELLED", "CANCELED"].includes(s)) return "결제 취소됨";
    if (["FAILED"].includes(s)) return "결제 실패";
    return "알 수 없음";
  }, [status]);

  const badgeTone = useMemo(() => {
    const s = upper(status);
    if (["PAID", "SUCCEEDED", "SUCCESS", "PARTIAL_PAID"].includes(s)) return "ok";
    if (["PENDING", "READY", "IN_PROGRESS", "NEEDS_CONFIRMATION"].includes(s)) return "warn";
    if (["FAILED", "CANCELLED", "CANCELED"].includes(s)) return "bad";
    return "neutral";
  }, [status]);

  // === 스타일 ===
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

  const S = {
    page: { background: `linear-gradient(180deg, ${theme.bg} 0%, #FFFFFF 100%)`, padding: "24px 16px 40px" },
    wrap: { maxWidth: 960, margin: "0 auto" },
    headerCard: { background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: theme.radius, boxShadow: theme.shadow, padding: "22px 24px", marginBottom: 18 },
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
    title: { fontSize: 24, fontWeight: 900, color: theme.text, margin: 0 },
    badge: (tone) => ({
      display: "inline-block", padding: "6px 12px", borderRadius: 999,
      background: tone === "ok" ? "#EAFBF1" : tone === "warn" ? "#FFF7E6" : tone === "bad" ? "#FFF1F1" : theme.accentSoft,
      border: tone === "ok" ? "1px solid #C7F0D9" : tone === "warn" ? "1px solid #FFE1B3" : tone === "bad" ? "1px solid #FFCCCC" : `1px solid ${theme.borderStrong}`,
      color: tone === "ok" ? "#256D3F" : tone === "warn" ? "#925B16" : tone === "bad" ? "#B42318" : theme.text,
      fontWeight: 800, fontSize: 12,
    }),
    sectionCard: { background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: theme.radius, boxShadow: theme.shadow, padding: 18, marginBottom: 18 },
    sectionH: { fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 12 },
    benefitList: { margin: 0, paddingLeft: 20, color: theme.text },
    benefitItem: { listStyle: "disc", marginBottom: 6, lineHeight: 1.55, fontSize: 14, fontWeight: 500 },
    rowWrap: { position: "relative" },
    row: { display: "grid", gridAutoFlow: "column", gridAutoColumns: "23%", overflowX: "auto", gap: 16, scrollSnapType: "x mandatory", paddingBottom: 6 },
    arrow: (pos) => ({ position: "absolute", top: "50%", transform: "translateY(-50%)", [pos]: -10, background: "#fff", border: `1px solid ${theme.borderStrong}`, width: 36, height: 36, borderRadius: 999, boxShadow: "0 8px 16px rgba(0,0,0,0.06)", cursor: "pointer", display: "grid", placeItems: "center", fontWeight: 800, color: theme.text, zIndex: 2 }),
    productCard: { background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 14, boxShadow: "0 6px 16px rgba(255, 180, 205, 0.12)", overflow: "hidden", scrollSnapAlign: "start", display: "grid", gridTemplateRows: "180px 1fr auto" },
    imgBox: { background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" },
    img: { width: "100%", height: "100%", objectFit: "contain", backgroundColor: theme.accentSoft },
    productBody: { padding: "10px 12px" },
    productName: { fontWeight: 700, color: theme.text, fontSize: 14, lineHeight: 1.35, minHeight: 38, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
    price: { marginTop: 6, color: theme.textSub, fontSize: 13, fontWeight: 700 },
    productActions: { padding: 12, display: "grid", gridTemplateColumns: "1fr", borderTop: `1px solid ${theme.border}` },
    btn: { padding: "10px 12px", borderRadius: 999, border: `1px solid ${theme.borderStrong}`, background: "#fff", color: "#6F5663", fontWeight: 800, fontSize: 13, textAlign: "center", textDecoration: "none" },
    btnPrimary: { padding: "10px 12px", borderRadius: 999, border: "none", background: `linear-gradient(180deg, ${theme.accent}, ${theme.accentDeep})`, color: "#fff", fontWeight: 900, fontSize: 13, textAlign: "center", textDecoration: "none" },
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* ===== 헤더 ===== */}
        <div style={S.headerCard}>
          <div style={S.headerRow}>
            <h1 style={S.title}>구독 결과</h1>
            <span style={S.badge(badgeTone)}>{statusLabel}</span>
          </div>
          <div style={{ color: theme.text, marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span>플랜명: <b>{plan.planName}</b></span>
            <span>구독 기간: {isNumber(months) ? `${months}개월` : "-"}</span>
            <span>결제 금액: {isNumber(amount) ? `${Number(amount).toLocaleString()} ${currency || "KRW"}` : "-"}</span>
          </div>
          {receiptUrl && (
            <div style={{ marginTop: 10 }}>
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-block", padding: "10px 12px", borderRadius: 999, border: `1px solid ${theme.borderStrong}`, background: "#fff", color: "#6F5663", fontWeight: 900, fontSize: 13, textDecoration: "none" }}
              >
                영수증 보기
              </a>
            </div>
          )}
        </div>

        {/* ===== 혜택 ===== */}
        <div style={S.sectionCard}>
          <div style={S.sectionH}>구독 플랜 혜택</div>
          {benefits.length ? (
            <ul style={S.benefitList}>
              {benefits.map((b, i) => (
                <li key={i} style={S.benefitItem}>{b}</li>
              ))}
            </ul>
          ) : (
            <div style={{ color: theme.textSub, fontSize: 14 }}>플랜 혜택 정보를 불러오지 못했습니다.</div>
          )}
        </div>

        {/* ===== 추천 상품 ===== */}
        <div style={S.sectionCard}>
          <div style={S.sectionH}>{plan.planName} 플랜 고객 최신상품</div>
          <div style={{ position: "relative" }}>
            {!isMobile && (
              <>
                <button style={S.arrow("left")} onClick={scrollLeft} aria-label="왼쪽으로">‹</button>
                <button style={S.arrow("right")} onClick={scrollRight} aria-label="오른쪽으로">›</button>
              </>
            )}
            <div ref={railRef} style={S.row}>
              {products.length ? (
                products.map((p) => (
                  <div key={p.pronum} style={S.productCard}>
                    <div style={S.imgBox}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={S.img}
                        onError={(e) => (e.currentTarget.src = "/logo192.png")}
                      />
                    </div>
                    <div style={S.productBody}>
                      <div style={S.productName}>{p.name}</div>
                      <div style={S.price}>{isNumber(p.price) ? `${Number(p.price).toLocaleString()}원` : "가격정보 없음"}</div>
                    </div>
                    <div style={S.productActions}>
                      <Link to={`/products/${p.pronum}`} style={S.btn}>상품 페이지</Link>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: "grid", placeItems: "center", color: theme.textSub, height: 180 }}>
                  상품 정보를 불러오지 못했습니다.
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginTop: 10 }}>
            <Link to="/products" style={S.btn}>상품 페이지로</Link>
            <Link to="/member/membership" style={S.btnPrimary}>내 구독 확인</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
