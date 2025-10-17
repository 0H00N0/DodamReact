import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

export default function SignupForm() {
  const navigate = useNavigate();
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
  const [child, setChild] = useState({ chname: "", chbirth: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 카카오 주소검색 스크립트
  useEffect(() => {
    if (!window.daum?.Postcode) {
      const script = document.createElement("script");
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 카카오 주소검색 연동
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      alert("주소 검색 스크립트가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: function (data) {
        setForm(f => ({
          ...f,
          maddr: data.address,
          mpost: data.zonecode
        }));
      }
    }).open();
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onChildChange = (e) => {
    const { name, value } = e.target;
    setChild((c) => ({ ...c, [name]: value }));
  };

  const addChild = () => {
    if (child.chname && child.chbirth) {
      setForm(f => ({
        ...f,
        children: [...f.children, { ...child }]
      }));
      setChild({ chname: "", chbirth: "" });
    }
  };

  const removeChild = idx => {
    setForm(f => ({
      ...f,
      children: f.children.filter((_, i) => i !== idx)
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMsg("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        mid: form.mid.trim(),
        mpw: form.mpw,
        mname: form.mname.trim(),
        mtel: form.mtel.trim(),
        memail: form.memail.trim(),
        maddr: form.maddr.trim(),
        mpost: form.mpost,
        children: form.children,
      };
      await api.post("/member/signup", payload);
      navigate("/", { replace: true });
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
    <div style={styles.wrapper}>
      <form onSubmit={onSubmit} style={styles.form} noValidate>
        <h2>회원가입</h2>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
  <span style={{ color: "red" }}>*</span>는 필수 입력사항입니다.
</div>
        <label htmlFor="mid">아이디<span style={{ color: "red" }}>*</span></label>
        <input
          id="mid"
          name="mid"
          value={form.mid}
          onChange={onChange}
          placeholder="아이디"
          required
          autoComplete="username"
        />

        <label htmlFor="mpw">비밀번호<span style={{ color: "red" }}>*</span></label>
        <input
          id="mpw"
          type="password"
          name="mpw"
          value={form.mpw}
          onChange={onChange}
          placeholder="비밀번호"
          required
          autoComplete="new-password"
        />

        <label htmlFor="mname">이름<span style={{ color: "red" }}>*</span></label>
        <input
          id="mname"
          name="mname"
          value={form.mname}
          onChange={onChange}
          placeholder="이름"
          required
          autoComplete="name"
        />

        <label htmlFor="mtel">전화번호<span style={{ color: "red" }}>*</span></label>
        <input
          id="mtel"
          name="mtel"
          value={form.mtel}
          onChange={onChange}
          placeholder="-없이 숫자만 입력"
          autoComplete="tel"
        />
        <label htmlFor="mbirth">생년월일</label>
          <input
            id="mbirth"
            name="mbirth"
            type="date"
            value={form.mbirth || ""}
            onChange={onChange}
            placeholder="생년월일"
            autoComplete="bday"
          />

        <label htmlFor="memail">이메일 주소</label>
        <input
          id="memail"
          name="memail"
          value={form.memail}
          onChange={onChange}
          placeholder="이메일"
          autoComplete="email"
        />
        <label htmlFor="mpost">우편번호<span style={{ color: "red" }}>*</span></label>
        <input
          id="mpost"
          name="mpost"
          value={form.mpost}
          onChange={onChange}
          placeholder="우편번호"
          autoComplete="postal-code"
        />
        <label htmlFor="maddr">주소</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id="maddr"
            name="maddr"
            value={form.maddr}
            onChange={onChange}
            placeholder="주소"
            style={{ flex: 1 }}
            autoComplete="address-line1"
          />
          <button type="button" onClick={handleAddressSearch} style={styles.linkBtn}>
            주소검색
          </button>
        </div>

        <label htmlFor="mnic">닉네임</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id="mnic"
            name="mnic"
            value={form.mnic}
            onChange={onChange}
            placeholder="닉네임"
          />
        </div>

        {/* 자녀 정보 입력 (선택) */}
        <fieldset style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
          <legend>자녀 정보 (선택)</legend>
          {form.children.map((c, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input
                name="chname"
                value={c.chname}
                onChange={e => {
                  const value = e.target.value;
                  setForm(f => {
                    const arr = [...f.children];
                    arr[idx].chname = value;
                    return { ...f, children: arr };
                  });
                }}
                placeholder="자녀 이름"
                style={{ flex: 1 }}
              />
              <input
                name="chbirth"
                type="date"
                value={c.chbirth}
                onChange={e => {
                  const value = e.target.value;
                  setForm(f => {
                    const arr = [...f.children];
                    arr[idx].chbirth = value;
                    return { ...f, children: arr };
                  });
                }}
                style={{ flex: 1 }}
              />
              <button type="button" onClick={() => removeChild(idx)} style={styles.linkBtn}>
                삭제
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, children: [...f.children, { chname: "", chbirth: "" }] }))}
            style={styles.linkBtn}
          >
            입력칸 추가
          </button>
        </fieldset>

        {msg && <p style={styles.error}>{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            display: "block",
            width: "100%",
            padding: "12px 14px",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            background: "#1f6feb",
            color: "#fff",
          }}
        >
          {loading ? "처리 중..." : "가입하기"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={loading}
          style={styles.linkBtn}
        >
          로그인으로
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f7f7f7",
    padding: "40px",
  },
  form: {
    width: 400,
    display: "grid",
    gap: 12,
    padding: 24,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  error: { color: "#c13030", fontSize: 14, marginTop: 4 },
  linkBtn: { background: "transparent", color: "#333", marginTop: 4, cursor: "pointer" },
};