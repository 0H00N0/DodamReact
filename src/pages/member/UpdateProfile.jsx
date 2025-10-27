// src/pages/member/UpdateProfile.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import "./MemberTheme.css";

// 날짜/빈값 유틸
const toYYYYMMDD = (v) => {
  if (!v) return "";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/(\d{4})\D?(\d{1,2})\D?(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};
const nullIfBlank = (v) => (v === "" || v == null ? null : v);
const numOrNull = (v) => (v === "" || v == null ? null : Number(v));

const isFilledChild = (c) => (c.chname || "").trim() !== "" && toYYYYMMDD(c.chbirth) !== "";
const isPartialChild = (c) => {
  const name = (c.chname || "").trim();
  const birth = toYYYYMMDD(c.chbirth);
  return (name !== "" || birth !== "") && !(name !== "" && birth !== "");
};

export default function UpdateProfile() {
  const [form, setForm] = useState({
    mname: "",
    mbirth: "",
    memail: "",
    mtel: "",
    maddr: "",
    mpost: "",
    mnic: "",
    children: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 카카오 주소검색 스크립트 로드
  useEffect(() => {
    if (!window.daum?.Postcode) {
      const script = document.createElement("script");
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      alert("주소 검색 스크립트가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: function (data) {
        setForm((f) => ({
          ...f,
          maddr: data.address,
          mpost: data.zonecode,
        }));
      },
    }).open();
  };

  // /member/me
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/member/me");
        if (cancelled) return;

        if (!data?.login) {
          alert("로그인이 필요합니다.");
          navigate("/member/login", { replace: true });
          return;
        }

        const m = data.member || {};
        setForm({
          mname: m.mname ?? "",
          mbirth: toYYYYMMDD(m.mbirth),
          memail: m.memail ?? "",
          mtel: m.mtel ?? "",
          maddr: m.maddr ?? "",
          mpost: (m.mpost ?? "").toString(),
          mnic: m.mnic ?? "",
          children: (m.children ?? []).map((c) => ({
            chname: c?.chname ?? "",
            chbirth: toYYYYMMDD(c?.chbirth),
          })),
        });
      } catch (err) {
        console.error("회원 정보 로딩 실패:", err);
        alert("회원 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleChildChange = (idx, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const children = [...prev.children];
      children[idx] = { ...children[idx], [name]: value };
      return { ...prev, children };
    });
    setMessage("");
  };

  const addChild = () => {
    setForm((prev) => ({
      ...prev,
      children: [...prev.children, { chname: "", chbirth: "" }],
    }));
  };

  const removeChild = (idx) => {
    setForm((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = toYYYYMMDD(new Date());

    if (form.mbirth) {
      if (form.mbirth > today) {
        setMessage("생년월일은 미래일 수 없습니다.");
        return;
      }
      if (form.mbirth < "1900-01-01") {
        setMessage("생년월일은 1900-01-01 이후여야 합니다.");
        return;
      }
    }
    for (const [i, c] of (form.children || []).entries()) {
      const b = toYYYYMMDD(c.chbirth);
      if (!b) continue;
      if (b > today) {
        setMessage(`자녀 ${i + 1}의 생년월일은 미래일 수 없습니다.`);
        return;
      }
      if (b < "2000-01-01") {
        setMessage(`자녀 ${i + 1}의 생년월일은 2000-01-01 이후여야 합니다.`);
        return;
      }
    }

    if (form.memail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.memail)) {
      setMessage("이메일 형식이 올바르지 않습니다.");
      return;
    }
    if (form.mtel) {
      const digits = form.mtel.replace(/\D/g, "");
      if (!/^\d{9,13}$/.test(digits)) {
        setMessage("전화번호는 숫자 9~13자리로 입력하세요.");
        return;
      }
    }

    setSaving(true);
    setMessage("");
    try {
      const partial = (form.children || []).find(isPartialChild);
      if (partial) {
        setSaving(false);
        const idx = (form.children || []).findIndex(isPartialChild);
        setMessage(`자녀 ${idx + 1} 행: 이름과 생년월일을 모두 입력해주세요.`);
        return;
      }

      const cleanedChildren = (form.children || [])
        .filter(isFilledChild)
        .map((c) => ({
          chname: (c.chname || "").trim(),
          chbirth: toYYYYMMDD(c.chbirth),
        }));

      const payload = {
        ...form,
        mname: (form.mname || "").trim(),
        memail: (form.memail || "").trim(),
        mtel: (form.mtel || "").replace(/\D/g, ""),
        maddr: (form.maddr || "").trim(),
        mnic: (form.mnic || "").trim(),
        mbirth: nullIfBlank(toYYYYMMDD(form.mbirth)),
        mpost: numOrNull(form.mpost),
        children: cleanedChildren,
      };

      await api.put("/member/updateProfile", payload);
      alert("회원정보 수정이 완료되었습니다.");
      navigate("/member/profile", { replace: true });
    } catch (err) {
      console.error("수정 실패:", err);
      setMessage(err?.response?.data?.error || "수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="member-page">
        <div className="m-card">로딩 중...</div>
      </div>
    );
  }

  const today = toYYYYMMDD(new Date());

  return (
    <div className="member-page">
      <form onSubmit={handleSubmit} className="m-card wide m-form">
        <h2 className="m-title">회원정보 수정</h2>

        <label htmlFor="mname" className="m-label">이름</label>
        <input id="mname" name="mname" value={form.mname} onChange={handleChange} className="m-input" />

        <label htmlFor="mbirth" className="m-label">생년월일</label>
        <input
          id="mbirth"
          type="date"
          name="mbirth"
          value={form.mbirth || ""}
          onChange={handleChange}
          min="1900-01-01"
          max={today}
          className="m-input"
        />

        <label htmlFor="memail" className="m-label">이메일</label>
        <input
          id="memail"
          type="email"
          name="memail"
          value={form.memail}
          onChange={handleChange}
          autoComplete="email"
          className="m-input"
        />

        <label htmlFor="mtel" className="m-label">전화번호</label>
        <input
          id="mtel"
          type="text"
          name="mtel"
          value={form.mtel}
          onChange={handleChange}
          inputMode="numeric"
          placeholder="-없이 숫자만"
          className="m-input"
        />

        <label className="m-label">주소</label>
        <div className="m-grid-2">
          <input
            type="text"
            name="maddr"
            value={form.maddr}
            onChange={handleChange}
            placeholder="주소"
            autoComplete="address-line1"
            className="m-input"
          />
          <button type="button" onClick={handleAddressSearch} className="m-btn ghost">
            주소검색
          </button>
        </div>

        <label htmlFor="mpost" className="m-label">우편번호</label>
        <input id="mpost" type="text" name="mpost" value={form.mpost} onChange={handleChange} className="m-input" />

        <label htmlFor="mnic" className="m-label">닉네임</label>
        <input id="mnic" type="text" name="mnic" value={form.mnic} onChange={handleChange} className="m-input" />

        <fieldset className="m-fieldset" style={{ marginTop: 8 }}>
          <legend>자녀 정보 (선택)</legend>
          {(form.children || []).map((c, idx) => (
            <div key={idx} className="m-grid-2" style={{ alignItems: "center" }}>
              <input
                name="chname"
                value={c.chname}
                onChange={(e) => handleChildChange(idx, e)}
                placeholder="자녀 이름"
                className="m-input"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  name="chbirth"
                  type="date"
                  value={c.chbirth || ""}
                  onChange={(e) => handleChildChange(idx, e)}
                  min="2000-01-01"
                  max={today}
                  className="m-input"
                  style={{ flex: 1 }}
                />
                <button type="button" className="m-btn ghost" onClick={() => removeChild(idx)}>
                  삭제
                </button>
              </div>
            </div>
          ))}

          <div className="m-actions" style={{ marginTop: 8 }}>
            <button type="button" className="m-btn ghost" onClick={addChild}>
              입력칸 추가
            </button>
          </div>
        </fieldset>

        {message && <p className="m-error" aria-live="polite">{message}</p>}

        <div className="m-actions">
          <button type="submit" disabled={saving} className="m-btn">
            {saving ? "저장 중…" : "수정하기"}
          </button>
          <button type="button" className="m-btn ghost" onClick={() => navigate(-1)}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
