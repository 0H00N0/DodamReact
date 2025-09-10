const Faq = () => {
  const faqs = [
    { id: 1, q: "배송은 얼마나 걸리나요?", a: "보통 결제일 기준 2~3일 소요됩니다." },
    { id: 2, q: "교환/환불은 어떻게 하나요?", a: "고객센터나 1:1 문의를 통해 접수 가능합니다." },
    { id: 3, q: "회원 탈퇴는 어디서 하나요?", a: "마이페이지 > 회원정보 수정에서 가능합니다." }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>❓ FAQ</h1>
      <ul>
        {faqs.map((faq) => (
          <li key={faq.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
            <strong>Q. {faq.q}</strong>
            <p>A. {faq.a}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Faq;