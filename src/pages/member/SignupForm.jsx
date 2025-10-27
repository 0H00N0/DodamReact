// src/pages/member/SignupForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./MemberTheme.css";

export default function SignupForm() {
  const navigate = useNavigate();

  const todayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [form, setForm] = useState({
    mid: "",
    mpw: "",
    mname: "",
    mbirth: "",
    mtel: "",
    memail: "",
    maddr: "",
    mpost: "",
    mnic: "",
    children: [],
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 주소 UI용 상태
  const [maddrBase, setMaddrBase] = useState("");
  const [maddrDetail, setMaddrDetail] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const detailRef = useRef(null);

  const digitsOnly = (s = "") => s.replace(/\D/g, "").slice(0, 13);

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
      oncomplete: (data) => {
        setMaddrBase(data.address);
        setForm((f) => ({
          ...f,
          maddr: data.address,
          mpost: data.zonecode,
        }));
        setShowDetail(true);
        setTimeout(() => detailRef.current?.focus(), 0);
      },
    }).open();
  };

  // ✅ onChange: memail은 ASCII만 허용(한글 제거), mtel은 숫자만
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name === "memail"
          ? value.replace(/[^\x00-\x7F]/g, "") // ASCII만 허용 (한글 제거)
          : name === "mtel"
          ? digitsOnly(value)
          : value,
    }));
  };

  // 자녀 입력칸 추가/삭제
  const addChild = () => {
    setForm((f) => ({
      ...f,
      children: [...(f.children || []), { chname: "", chbirth: "" }],
    }));
  };
  const removeChild = (idx) => {
    setForm((f) => ({
      ...f,
      children: f.children.filter((_, i) => i !== idx),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMsg("");

    const today = todayStr();
    const MEMBER_MIN = "1900-01-01";
    const childMin = "2000-01-01";

    if (form.mbirth && form.mbirth > today) {
      setMsg("생년월일은 오늘 이후(미래)로 설정할 수 없습니다.");
      return;
    }
    if (form.mbirth && form.mbirth < MEMBER_MIN) {
      setMsg("회원 생년월일은 1900-01-01 이후여야 합니다.");
      return;
    }

    if (Array.isArray(form.children)) {
      for (const [idx, ch] of form.children.entries()) {
        if (ch?.chbirth && ch.chbirth > today) {
          setMsg(`자녀 ${idx + 1}의 생년월일이 미래로 설정되어 있습니다.`);
          return;
        }
        if (ch?.chbirth && ch.chbirth < childMin) {
          setMsg(`자녀 ${idx + 1}의 생년월일은 2000-01-01 이후여야 합니다.`);
          return;
        }
      }
    }

    const mtelDigits = String(form.mtel || "").replace(/\D/g, "");
    if (!/^\d{9,13}$/.test(mtelDigits)) {
      setMsg("전화번호는 숫자 9~13자리로 입력하세요.");
      return;
    }

    const mpostDigits = String(form.mpost || "").replace(/\D/g, "");
    if (!/^\d{5}$/.test(mpostDigits)) {
      setMsg("우편번호는 주소검색으로 입력한 5자리 숫자여야 합니다.");
      return;
    }

    const base = (maddrBase || form.maddr || "").trim();
    const detail = (maddrDetail || "").trim();
    const addr = detail ? `${base} ${detail}` : base;

    if (!base) {
      setMsg("주소를 입력해주세요.");
      return;
    }

    // ✅ 이메일 형식/한글 방지 검증 (브라우저 검증 외에 JS 가드 추가)
    const email = (form.memail || "").trim().toLowerCase();
    if (email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      setMsg("이메일 형식이 올바르지 않습니다. (한글 불가)");
      return;
    }

    setLoading(true);
    try {
      const cleanChildren = (form.children || []).filter(
        (c) => c?.chname?.trim() && c?.chbirth
      );

      const payload = {
        ...form,
        mid: form.mid.trim(),
        mpw: form.mpw,
        mname: form.mname.trim(),
        mtel: mtelDigits,
        memail: email,       // ← 정리된 이메일 사용
        maddr: addr,
        mpost: mpostDigits,
        children: cleanChildren,
      };

      await api.post("/member/signup", payload);
      navigate("/login", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : undefined) ??
        err?.message ??
        "회원가입에 실패했습니다.";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-page">
      <form onSubmit={onSubmit} className="m-card m-form">
        <h2 className="m-title">회원가입</h2>
        <div className="m-muted" aria-hidden="true">
          <span style={{ color: "red" }}>*</span>는 필수 입력사항입니다.
        </div>

        <label htmlFor="mid" className="m-label">
          아이디<span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="mid"
          name="mid"
          value={form.mid}
          onChange={onChange}
          placeholder="아이디"
          required
          autoComplete="username"
          className="m-input"
        />

        <label htmlFor="mpw" className="m-label">
          비밀번호<span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="mpw"
          type="password"
          name="mpw"
          value={form.mpw}
          onChange={onChange}
          placeholder="비밀번호"
          required
          autoComplete="new-password"
          className="m-input"
        />

        <label htmlFor="mname" className="m-label">
          이름<span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="mname"
          name="mname"
          value={form.mname}
          onChange={onChange}
          placeholder="이름"
          required
          autoComplete="name"
          className="m-input"
        />

        <label htmlFor="mtel" className="m-label">
          전화번호<span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="mtel"
          name="mtel"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={13}
          value={form.mtel}
          onChange={onChange}
          placeholder="-없이 숫자만 입력"
          autoComplete="tel"
          required
          className="m-input"
        />

        <label htmlFor="mbirth" className="m-label">
          생년월일<span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="mbirth"
          name="mbirth"
          type="date"
          value={form.mbirth || ""}
          onChange={onChange}
          placeholder="생년월일"
          autoComplete="bday"
          max={todayStr()}
          min="1900-01-01"
          required
          className="m-input"
        />

        <label htmlFor="memail" className="m-label">이메일 주소</label>
        <input
          id="memail"
          name="memail"
          type="email"
          value={form.memail}
          onChange={onChange}
          autoComplete="email"
          placeholder="이메일"
          className="m-input"
        />

        {/* 우편번호 + 주소검색(짧은 버튼) */}
        <label htmlFor="mpost" className="m-label">
          우편번호<span style={{ color: "red" }}>*</span>
        </label>
        <div className="m-input-row">
          <input
            id="mpost"
            name="mpost"
            value={form.mpost}
            readOnly
            placeholder="우편번호"
            autoComplete="postal-code"
            required
            className="m-input"
          />
          <button type="button" onClick={handleAddressSearch} className="m-btn ghost sm">
            주소검색
          </button>
        </div>

        {/* 주소 + 상세주소 토글(짧은 버튼) */}
        <label htmlFor="maddr" className="m-label">
          주소<span style={{ color: "red" }}>*</span>
        </label>
        <div className="m-input-row">
          <input
            id="maddr"
            name="maddr"
            value={maddrBase || form.maddr}
            readOnly
            placeholder="주소검색으로 기본주소 자동 입력"
            autoComplete="address-line1"
            required
            className="m-input"
          />
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            className="m-btn ghost sm"
            aria-expanded={showDetail}
            aria-controls="addrDetail"
          >
            상세주소
          </button>
        </div>
        {showDetail && (
          <input
            id="addrDetail"
            ref={detailRef}
            value={maddrDetail}
            onChange={(e) => setMaddrDetail(e.target.value)}
            placeholder="상세주소 (동/호수 등)"
            autoComplete="address-line2"
            className="m-input"
          />
        )}

        <label htmlFor="mnic" className="m-label">닉네임</label>
        <input
          id="mnic"
          name="mnic"
          value={form.mnic}
          onChange={onChange}
          placeholder="닉네임"
          className="m-input"
        />

        {/* 자녀 정보 (선택) */}
        <fieldset className="m-fieldset">
          <legend>자녀 정보 (선택)</legend>

          {(form.children || []).map((c, idx) => (
            <div key={idx} className="m-input-row" style={{ alignItems: "center" }}>
              <input
                name="chname"
                value={c.chname}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((f) => {
                    const arr = [...f.children];
                    arr[idx] = { ...arr[idx], chname: value };
                    return { ...f, children: arr };
                  });
                }}
                placeholder="자녀 이름"
                className="m-input"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  name="chbirth"
                  type="date"
                  value={c.chbirth}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((f) => {
                      const arr = [...f.children];
                      arr[idx] = { ...arr[idx], chbirth: value };
                      return { ...f, children: arr };
                    });
                  }}
                  max={todayStr()}
                  min="2000-01-01"
                  className="m-input"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removeChild(idx)} className="m-btn ghost sm">
                  삭제
                </button>
              </div>
            </div>
          ))}

          <div className="m-inline-actions" style={{ marginTop: 8 }}>
            <button type="button" onClick={addChild} className="m-btn ghost sm">
              입력칸 추가
            </button>
          </div>
        </fieldset>

        {msg && (
          <p className="m-error" aria-live="polite" aria-atomic="true">
            {msg}
          </p>
        )}

        {/* 하단 버튼: 50:50 가로 배치 */}
        <div className="m-actions split">
          <button
            type="button"
            onClick={() => navigate("/login")}
            disabled={loading}
            className="m-btn ghost"
          >
            로그인으로
          </button>
          <button type="submit" disabled={loading} className="m-btn">
            {loading ? "처리 중..." : "가입하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
