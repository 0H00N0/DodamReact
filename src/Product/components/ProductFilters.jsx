import React, { useEffect, useMemo, useState } from "react";
import "./product-filters.css";

/**
 * 지원 파라미터(모두 선택):
 * - keyword, categoryId, status(ProductStatus), minPrice, maxPrice, minStock, lowStock
 * - sort(Spring Data 형식), size
 * ※ onChange(payload)로 상위에서 API 호출
 */
export default function ProductFilters({ value, onChange }) {
  const [form, setForm] = useState({
    keyword: "",
    categoryId: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    minStock: "",
    lowStock: false,
    sort: "productId,desc",
    size: 12,
  });
  const [open, setOpen] = useState(false); // 모바일 접힘

  useEffect(() => {
    if (!value) return;
    // 숫자형 → 문자열로 보정(인풋 안정화)
    setForm((f) => ({
      ...f,
      ...value,
      categoryId: numToStr(value.categoryId),
      minPrice: numToStr(value.minPrice),
      maxPrice: numToStr(value.maxPrice),
      minStock: numToStr(value.minStock),
    }));
  }, [value]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const payload = useMemo(
    () => ({
      ...form,
      categoryId: strToNum(form.categoryId),
      minPrice: strToNum(form.minPrice),
      maxPrice: strToNum(form.maxPrice),
      minStock: strToNum(form.minStock),
    }),
    [form]
  );

  const apply = (e) => {
    e?.preventDefault?.();
    onChange?.(payload);
    setOpen(false);
  };

  const reset = () => {
    const init = {
      keyword: "",
      categoryId: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      minStock: "",
      lowStock: false,
      sort: "productId,desc",
      size: 12,
    };
    setForm(init);
    onChange?.({
      ...init,
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minStock: undefined,
    });
    setOpen(false);
  };

  return (
    <div className="pf-wrap">
      {/* 데스크탑: 얇은 가로 바 */}
      <div className="pf-bar pf-desktop">
        <div className="pf-left">
          {/* 검색 */}
          <div className="pf-field pf-search">
            <span className="pf-ico">🔎</span>
            <input
              className="pf-input"
              placeholder="검색어"
              value={form.keyword}
              onChange={(e) => update("keyword", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />
          </div>

          {/* 카테고리ID */}
          <div className="pf-field">
            <label className="pf-label">카테고리</label>
            <input
              className="pf-input pf-num"
              placeholder="ID"
              value={form.categoryId}
              onChange={(e) =>
                update("categoryId", e.target.value.replace(/[^0-9]/g, ""))
              }
              inputMode="numeric"
            />
          </div>

          {/* 상태 */}
          <div className="pf-field">
            <label className="pf-label">상태</label>
            <select
              className="pf-input"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="">전체</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            </select>
          </div>

          {/* 가격 */}
          <div className="pf-field pf-range">
            <label className="pf-label">가격</label>
            <div className="pf-range-box">
              <div className="pf-currency">₩</div>
              <input
                className="pf-input pf-num"
                type="number"
                min="0"
                placeholder="최소"
                value={form.minPrice}
                onChange={(e) => update("minPrice", e.target.value)}
              />
              <span className="pf-tilde">~</span>
              <div className="pf-currency">₩</div>
              <input
                className="pf-input pf-num"
                type="number"
                min="0"
                placeholder="최대"
                value={form.maxPrice}
                onChange={(e) => update("maxPrice", e.target.value)}
              />
            </div>
          </div>

          {/* 최소 재고 */}
          <div className="pf-field">
            <label className="pf-label">최소 재고</label>
            <input
              className="pf-input pf-num"
              type="number"
              min="0"
              placeholder="0"
              value={form.minStock}
              onChange={(e) => update("minStock", e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              title="상품 최소 재고(advancedSearch 연동)"
            />
          </div>

          {/* 재고부족 */}
          <div className="pf-field pf-toggle">
            <label className="pf-switch">
              <input
                type="checkbox"
                checked={form.lowStock}
                onChange={(e) => update("lowStock", e.target.checked)}
              />
              <span className="pf-slider" />
            </label>
            <span className="pf-toggle-label">재고부족</span>
          </div>
        </div>

        <div className="pf-right">
          <select
            className="pf-input"
            value={form.sort}
            onChange={(e) => update("sort", e.target.value)}
            title="정렬"
          >
            <option value="productId,desc">최신순</option>
            <option value="productId,asc">오래된순</option>
            <option value="price,asc">가격낮은순</option>
            <option value="price,desc">가격높은순</option>
            <option value="name,asc">이름순(A→Z)</option>
            <option value="name,desc">이름순(Z→A)</option>
          </select>

          <select
            className="pf-input pf-w80"
            value={form.size}
            onChange={(e) => update("size", Number(e.target.value))}
            title="페이지 크기"
          >
            {[12, 24, 48].map((n) => (
              <option key={n} value={n}>
                {n}개씩
              </option>
            ))}
          </select>

          <button className="pf-btn pf-primary" onClick={apply}>적용</button>
          <button className="pf-btn" onClick={reset}>초기화</button>
        </div>
      </div>

      {/* 모바일: 접힘 패널 */}
      <div className="pf-mobile">
        <button className="pf-mobile-toggle" onClick={() => setOpen((o) => !o)}>
          <span>필터</span>
          <span className="pf-caret">{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <div className="pf-mobile-panel">
            <div className="pf-group">
              <div className="pf-field pf-search">
                <span className="pf-ico">🔎</span>
                <input
                  className="pf-input"
                  placeholder="검색어"
                  value={form.keyword}
                  onChange={(e) => update("keyword", e.target.value)}
                />
              </div>

              <div className="pf-field">
                <label className="pf-label">카테고리 ID</label>
                <input
                  className="pf-input"
                  placeholder="숫자"
                  value={form.categoryId}
                  onChange={(e) =>
                    update("categoryId", e.target.value.replace(/[^0-9]/g, ""))
                  }
                  inputMode="numeric"
                />
              </div>

              <div className="pf-field">
                <label className="pf-label">상태</label>
                <select
                  className="pf-input"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                </select>
              </div>

              <div className="pf-field">
                <label className="pf-label">가격</label>
                <div className="pf-range-box">
                  <div className="pf-currency">₩</div>
                  <input
                    className="pf-input pf-num"
                    type="number"
                    min="0"
                    placeholder="최소"
                    value={form.minPrice}
                    onChange={(e) => update("minPrice", e.target.value)}
                  />
                  <span className="pf-tilde">~</span>
                  <div className="pf-currency">₩</div>
                  <input
                    className="pf-input pf-num"
                    type="number"
                    min="0"
                    placeholder="최대"
                    value={form.maxPrice}
                    onChange={(e) => update("maxPrice", e.target.value)}
                  />
                </div>
              </div>

              <div className="pf-field">
                <label className="pf-label">최소 재고</label>
                <input
                  className="pf-input pf-num"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.minStock}
                  onChange={(e) => update("minStock", e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                />
              </div>

              <label className="pf-toggle-row">
                <input
                  type="checkbox"
                  checked={form.lowStock}
                  onChange={(e) => update("lowStock", e.target.checked)}
                />
                <span>재고부족만</span>
              </label>
            </div>

            <div className="pf-row pf-gap">
              <select
                className="pf-input"
                value={form.sort}
                onChange={(e) => update("sort", e.target.value)}
                title="정렬"
              >
                <option value="productId,desc">최신순</option>
                <option value="productId,asc">오래된순</option>
                <option value="price,asc">가격낮은순</option>
                <option value="price,desc">가격높은순</option>
                <option value="name,asc">이름순(A→Z)</option>
                <option value="name,desc">이름순(Z→A)</option>
              </select>

              <select
                className="pf-input"
                value={form.size}
                onChange={(e) => update("size", Number(e.target.value))}
              >
                {[12, 24, 48].map((n) => (
                  <option key={n} value={n}>
                    {n}개씩
                  </option>
                ))}
              </select>
            </div>

            <div className="pf-row pf-actions">
              <button className="pf-btn pf-primary" onClick={apply}>적용</button>
              <button className="pf-btn" onClick={reset}>초기화</button>
            </div>
          </div>
        )}
      </div>

      {/* 활성 칩(선택) */}
      <ActiveChips
        form={form}
        onClearKey={(k) =>
          setForm((prev) => ({
            ...prev,
            [k]: k === "lowStock" ? false : "",
          }))
        }
        onApply={() => onChange?.(payload)}
      />
    </div>
  );
}

function ActiveChips({ form, onClearKey, onApply }) {
  const chips = [];
  if (form.keyword) chips.push(["keyword", `검색: ${form.keyword}`]);
  if (form.categoryId) chips.push(["categoryId", `카테고리: ${form.categoryId}`]);
  if (form.status) chips.push(["status", `상태: ${form.status}`]);
  if (form.minPrice) chips.push(["minPrice", `최소가: ${Number(form.minPrice).toLocaleString()}원`]);
  if (form.maxPrice) chips.push(["maxPrice", `최대가: ${Number(form.maxPrice).toLocaleString()}원`]);
  if (form.minStock) chips.push(["minStock", `최소 재고: ${form.minStock}`]);
  if (form.lowStock) chips.push(["lowStock", "재고부족"]);

  if (chips.length === 0) return null;

  return (
    <div className="pf-chips">
      {chips.map(([k, label]) => (
        <button
          key={k}
          className="pf-chip"
          onClick={() => {
            onClearKey?.(k);
            onApply?.();
          }}
          title="클릭하여 해제"
        >
          {label} <span className="pf-chip-x">✕</span>
        </button>
      ))}
    </div>
  );
}

// 유틸
function numToStr(v) {
  return v === 0 || v ? String(v) : "";
}
function strToNum(v) {
  return v === "" || v === null || v === undefined ? undefined : Number(v);
}
