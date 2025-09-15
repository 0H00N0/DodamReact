import React, { useState } from "react";

const Faq = () => {
  const faqs = [
    { id: 1, q: "배송은 얼마나 걸리나요?", a: "보통 결제일 기준 2~3일 소요됩니다." },
    { id: 2, q: "교환/환불은 어떻게 하나요?", a: "고객센터나 1:1 문의를 통해 접수 가능합니다." },
    { id: 3, q: "회원 탈퇴는 어디서 하나요?", a: "마이페이지 > 회원정보 수정에서 가능합니다." }
  ];

  const [openId, setOpenId] = useState(null); // 열려 있는 질문 id 저장

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id); // 같은 걸 누르면 닫기, 아니면 열기
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>❓ FAQ</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {faqs.map((faq) => (
          <li 
            key={faq.id} 
            style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}
          >
            {/* 질문 클릭 영역 */}
            <div 
              onClick={() => toggleFaq(faq.id)}
              style={{ cursor: "pointer", fontWeight: "bold" }}
            >
              Q. {faq.q}
            </div>

            {/* 열렸을 때만 답변 표시 */}
            {openId === faq.id && (
              <p style={{ marginTop: "5px" }}>A. {faq.a}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Faq;