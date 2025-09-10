const Event = () => {
  // 이벤트 샘플 데이터
  const events = [
    {
      id: 1,
      title: "신규 회원 가입 이벤트 🎉",
      date: "2025-09-01",
      content: "신규 회원 가입 시 첫 구매 20% 할인 쿠폰을 드립니다."
    },
    {
      id: 2,
      title: "친구 초대 이벤트 👯",
      date: "2025-09-03",
      content: "친구를 초대하면 초대한 분과 친구 모두 5,000 포인트를 적립해 드립니다."
    },
    {
      id: 3,
      title: "가을맞이 무료배송 🍂",
      date: "2025-09-07",
      content: "9월 한 달간 전 상품 무료배송 이벤트를 진행합니다."
    }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎁 이벤트</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
            <h2>{event.title}</h2>
            <p style={{ color: "gray", fontSize: "14px" }}>{event.date}</p>
            <p>{event.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Event;