// src/pages/ProductPickerModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../Product/api/ProductApi";

/**
 * props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onSelect: (product) => void
 *  - excludePronum: number|string|undefined  ← 원래 상품 번호(목록에서 숨김)
 *  - title?: string
 */
export default function ProductPickerModal({
  open,
  onClose,
  onSelect,
  excludePronum,
  title = "상품 선택",
}) {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");

  // 목록 로드
  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        // ✅ Spring Data 표준: page/size + (선택) sort=createdAt,desc
        //    백엔드가 createdAt 필드 없으면 sort는 아예 빼세요.
        const data = await fetchProducts({
         page: 0,
         size: 50,
        // sort: "createdAt,desc",  // ← createdAt 없으면 주석 유지
         keyword: q,                 // 백엔드가 다른 이름(q/name/search)을 쓰면 ProductApi에서 매핑
  });
        const arr = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
        setList(arr);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, q]);

  const exclude = excludePronum != null ? String(excludePronum) : null;

  const filtered = useMemo(() => {
    return (list || []).filter(p => String(p.pronum) !== exclude);
  }, [list, exclude]);

  if (!open) return null;

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.header}>
          <strong>{title}</strong>
          <button onClick={onClose} style={S.close}>✕</button>
        </div>

        <div style={{ padding: "8px 12px" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="상품명/번호 검색"
            style={S.search}
          />
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>불러오는 중...</div>
        ) : (
          <div style={S.list}>
            {filtered.length === 0 ? (
              <div style={{ padding: 16, color: "#888" }}>표시할 상품이 없습니다.</div>
            ) : (
              filtered.map((p) => (
                <button key={p.pronum} style={S.item} onClick={() => onSelect?.(p)}>
                  {/* 썸네일 필드는 프로젝트마다 다름: images[0]?.url, thumbnail 등 */}
                  {p.images?.[0]?.imageUrl && (
                    <img
                      src={p.images[0].imageUrl}
                      alt=""
                      style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, marginRight: 10 }}
                    />
                  )}
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 600 }}>{p.proname ?? `상품 #${p.pronum}`}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>#{p.pronum}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  backdrop: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    width: 520, maxHeight: "70vh", background: "#fff",
    borderRadius: 12, overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    display: "flex", flexDirection: "column",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #eee",
  },
  close: { border: "none", background: "transparent", fontSize: 18, cursor: "pointer" },
  search: {
    width: "100%", padding: "10px 12px",
    border: "1px solid #ddd", borderRadius: 8, outline: "none",
  },
  list: { overflowY: "auto", padding: 8 },
  item: {
    width: "100%", display: "flex", alignItems: "center", gap: 8,
    background: "#fff", border: "1px solid #eee", borderRadius: 10,
    padding: 10, marginBottom: 8, cursor: "pointer", textAlign: "left",
  },
};
