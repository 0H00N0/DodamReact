/**
 * 장난감 쇼핑몰용 더미 데이터
 */

// 카테고리 정의
export const categories = [
  { id: 'dolls', name: '인형', icon: '🧸' },
  { id: 'blocks', name: '블록', icon: '🧱' },
  { id: 'educational', name: '교육완구', icon: '🎓' },
  { id: 'rc', name: 'RC카', icon: '🚗' },
  { id: 'board', name: '보드게임', icon: '🎲' },
  { id: 'arts', name: '미술놀이', icon: '🎨' },
  { id: 'outdoor', name: '야외놀이', icon: '⚽' }
];

// 더미 상품 데이터 (15개)
export const products = [
  {
    id: 'toy-001',
    name: '소프트 베어 인형',
    category: 'dolls',
    price: 35000,
    discountPrice: 28000,
    discountRate: 20,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=소프트+베어',
    rating: 4.8,
    reviewCount: 124,
    description: '부드럽고 포근한 베어 인형입니다. 아이들이 안고 자기 좋은 크기로 만들어졌습니다.',
    features: ['안전한 소재', '세탁 가능', '3세 이상'],
    options: {
      colors: ['브라운', '화이트', '핑크'],
      sizes: ['S (30cm)', 'M (45cm)', 'L (60cm)']
    },
    stock: 15,
    isNew: true
  },
  {
    id: 'toy-002',
    name: '창의력 블록 세트',
    category: 'blocks',
    price: 89000,
    discountPrice: 71200,
    discountRate: 20,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=블록+세트',
    rating: 4.9,
    reviewCount: 89,
    description: '500개 피스로 구성된 창의력 발달 블록 세트입니다.',
    features: ['500개 피스', '무독성 플라스틱', '설명서 포함'],
    options: {
      types: ['기본형', '프리미엄형', '메가형']
    },
    stock: 8,
    isNew: false
  },
  {
    id: 'toy-003',
    name: '학습용 태블릿',
    category: 'educational',
    price: 129000,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=학습+태블릿',
    rating: 4.6,
    reviewCount: 67,
    description: '한글, 영어, 수학을 재미있게 배울 수 있는 교육용 태블릿입니다.',
    features: ['다국어 지원', '터치스크린', '오디오 기능'],
    options: {
      languages: ['한국어', '영어', '중국어']
    },
    stock: 12,
    isNew: true
  },
  {
    id: 'toy-004',
    name: '고속 RC 스포츠카',
    category: 'rc',
    price: 159000,
    discountPrice: 143100,
    discountRate: 10,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=RC+스포츠카',
    rating: 4.7,
    reviewCount: 156,
    description: '최고 시속 30km/h의 고속 RC카입니다. 실내외 모두 사용 가능합니다.',
    features: ['2.4GHz 무선', '충전식 배터리', '방수 기능'],
    options: {
      colors: ['레드', '블루', '그린', '옐로우']
    },
    stock: 6,
    isNew: false
  },
  {
    id: 'toy-005',
    name: '가족 보드게임 컬렉션',
    category: 'board',
    price: 75000,
    discountPrice: 60000,
    discountRate: 20,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=보드게임',
    rating: 4.5,
    reviewCount: 201,
    description: '온 가족이 함께 즐길 수 있는 5가지 보드게임이 들어있습니다.',
    features: ['5가지 게임', '2-6인용', '한국어 설명서'],
    options: {
      editions: ['스탠다드', '디럭스']
    },
    stock: 20,
    isNew: false
  },
  {
    id: 'toy-006',
    name: '크레용 미술 세트',
    category: 'arts',
    price: 45000,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=미술+세트',
    rating: 4.4,
    reviewCount: 88,
    description: '48색 크레용과 스케치북이 포함된 미술 세트입니다.',
    features: ['48색 크레용', '스케치북 포함', '무독성 안료'],
    options: {
      types: ['기본형 (48색)', '프리미엄형 (72색)']
    },
    stock: 25,
    isNew: false
  },
  {
    id: 'toy-007',
    name: '점프 로프',
    category: 'outdoor',
    price: 25000,
    discountPrice: 20000,
    discountRate: 20,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=점프+로프',
    rating: 4.3,
    reviewCount: 145,
    description: '길이 조절이 가능한 어린이용 점프 로프입니다.',
    features: ['길이 조절 가능', '미끄럼 방지 손잡이', '실내외 사용'],
    options: {
      colors: ['핑크', '블루', '그린']
    },
    stock: 30,
    isNew: false
  },
  {
    id: 'toy-008',
    name: '프린세스 드레스업 세트',
    category: 'dolls',
    price: 65000,
    discountPrice: 52000,
    discountRate: 20,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=드레스업',
    rating: 4.6,
    reviewCount: 93,
    description: '프린세스가 되어보는 드레스업 세트입니다. 드레스, 왕관, 목걸이가 포함되어 있습니다.',
    features: ['드레스 3벌', '액세서리 세트', '안전한 소재'],
    options: {
      sizes: ['S (4-6세)', 'M (7-9세)', 'L (10-12세)']
    },
    stock: 18,
    isNew: true
  },
  {
    id: 'toy-009',
    name: '자석 블록 세트',
    category: 'blocks',
    price: 120000,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=자석+블록',
    rating: 4.8,
    reviewCount: 167,
    description: '강력한 자석으로 쉽게 조립할 수 있는 블록 세트입니다.',
    features: ['강력한 네오디뮴 자석', '100개 피스', 'STEM 교육'],
    options: {
      sets: ['스타터 (50피스)', '베이직 (100피스)', '프로 (200피스)']
    },
    stock: 14,
    isNew: false
  },
  {
    id: 'toy-010',
    name: '과학 실험 키트',
    category: 'educational',
    price: 95000,
    discountPrice: 76000,
    discountRate: 20,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=과학+키트',
    rating: 4.7,
    reviewCount: 112,
    description: '20가지 안전한 과학 실험을 할 수 있는 키트입니다.',
    features: ['20가지 실험', '안전한 재료', '실험 가이드북'],
    options: {
      levels: ['초급 (8세+)', '중급 (10세+)', '고급 (12세+)']
    },
    stock: 9,
    isNew: true
  },
  {
    id: 'toy-011',
    name: '드론 레이싱 세트',
    category: 'rc',
    price: 199000,
    discountPrice: 159200,
    discountRate: 20,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=드론+세트',
    rating: 4.5,
    reviewCount: 78,
    description: '초보자도 쉽게 조종할 수 있는 드론 레이싱 세트입니다.',
    features: ['자동 호버링', 'HD 카메라', '원터치 이착륙'],
    options: {
      models: ['스탠다드', '프로']
    },
    stock: 5,
    isNew: true
  },
  {
    id: 'toy-012',
    name: '전략 체스 세트',
    category: 'board',
    price: 85000,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=체스+세트',
    rating: 4.4,
    reviewCount: 134,
    description: '고급 원목으로 제작된 체스 세트입니다. 초보자 가이드 포함.',
    features: ['원목 제작', '초보자 가이드', '수납 케이스'],
    options: {
      materials: ['원목', '플라스틱', '메탈']
    },
    stock: 16,
    isNew: false
  },
  {
    id: 'toy-013',
    name: '클레이 아트 키트',
    category: 'arts',
    price: 55000,
    discountPrice: 44000,
    discountRate: 20,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=클레이+키트',
    rating: 4.6,
    reviewCount: 95,
    description: '다양한 색상의 클레이로 작품을 만들 수 있는 아트 키트입니다.',
    features: ['12색 클레이', '조형 도구', '아이디어북'],
    options: {
      types: ['베이직', '디럭스']
    },
    stock: 22,
    isNew: false
  },
  {
    id: 'toy-014',
    name: '미니 축구공 세트',
    category: 'outdoor',
    price: 35000,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=축구공+세트',
    rating: 4.2,
    reviewCount: 187,
    description: '어린이용 미니 축구공과 골대가 포함된 세트입니다.',
    features: ['미니 골대', '축구공 3개', '공기주입기'],
    options: {
      sizes: ['S (3-6세)', 'M (7-10세)']
    },
    stock: 28,
    isNew: false
  },
  {
    id: 'toy-015',
    name: '로봇 친구',
    category: 'educational',
    price: 179000,
    discountPrice: 143200,
    discountRate: 20,
    image: 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=로봇+친구',
    rating: 4.9,
    reviewCount: 56,
    description: '프로그래밍을 배우며 놀 수 있는 교육용 로봇입니다.',
    features: ['블록 코딩', '음성 인식', 'AI 학습'],
    options: {
      colors: ['화이트', '블루']
    },
    stock: 7,
    isNew: true
  }
];

// 브랜드 정보
export const brands = [
  { id: 'toyland', name: '토이랜드' },
  { id: 'kidsfun', name: '키즈펀' },
  { id: 'playtime', name: '플레이타임' },
  { id: 'smarttoy', name: '스마트토이' },
  { id: 'familygame', name: '패밀리게임' }
];

// 정렬 옵션
export const sortOptions = [
  { value: 'popularity', label: '인기순' },
  { value: 'price-low', label: '낮은 가격순' },
  { value: 'price-high', label: '높은 가격순' },
  { value: 'rating', label: '평점순' },
  { value: 'newest', label: '최신순' },
  { value: 'reviews', label: '리뷰 많은순' }
];

// 가격 필터 옵션
export const priceRanges = [
  { id: 'under-30', label: '3만원 이하', min: 0, max: 30000 },
  { id: '30-50', label: '3-5만원', min: 30000, max: 50000 },
  { id: '50-100', label: '5-10만원', min: 50000, max: 100000 },
  { id: '100-200', label: '10-20만원', min: 100000, max: 200000 },
  { id: 'over-200', label: '20만원 이상', min: 200000, max: Infinity }
];


// 주문 관련 더미 데이터
export const orders = [
    {
        id: 'order-001',
        userId: 'user-101',
        userName: '김도담',
        productName: '창의력 블록 세트',
        productId: 'toy-002',
        rentalStartDate: '2023-03-01',
        rentalEndDate: '2023-03-15',
        status: '승인대기',
        shippingInfo: { address: '서울시 강남구 테헤란로 123', courier: '', trackingNumber: '' }
    },
    {
        id: 'order-002',
        userId: 'user-102',
        userName: '이로운',
        productName: '고속 RC 스포츠카',
        productId: 'toy-004',
        rentalStartDate: '2023-03-02',
        rentalEndDate: '2023-03-16',
        status: '배송중',
        shippingInfo: { address: '부산시 해운대구 마린시티로 456', courier: 'CJ대한통운', trackingNumber: '1234567890' }
    },
    {
        id: 'order-003',
        userId: 'user-103',
        userName: '박하준',
        productName: '과학 실험 키트',
        productId: 'toy-010',
        rentalStartDate: '2023-02-20',
        rentalEndDate: '2023-03-06',
        status: '대여중',
        shippingInfo: { address: '인천시 연수구 송도국제대로 789', courier: 'CJ대한통운', trackingNumber: '0987654321' }
    },
    {
        id: 'order-004',
        userId: 'user-104',
        userName: '최아리',
        productName: '프린세스 드레스업 세트',
        productId: 'toy-008',
        rentalStartDate: '2023-02-15',
        rentalEndDate: '2023-03-01',
        status: '반납완료',
        shippingInfo: { address: '대구시 수성구 달구벌대로 101', courier: 'CJ대한통운', trackingNumber: '1122334455' }
    },
    {
        id: 'order-005',
        userId: 'user-105',
        userName: '정다은',
        productName: '자석 블록 세트',
        productId: 'toy-009',
        rentalStartDate: '2023-02-10',
        rentalEndDate: '2023-02-24',
        status: '연체',
        shippingInfo: { address: '광주시 서구 상무중앙로 202', courier: 'CJ대한통운', trackingNumber: '5566778899' }
    },
    {
        id: 'order-006',
        userId: 'user-106',
        userName: '강지훈',
        productName: '드론 레이싱 세트',
        productId: 'toy-011',
        rentalStartDate: '2023-02-05',
        rentalEndDate: '2023-02-19',
        status: '파손',
        shippingInfo: { address: '대전시 유성구 대학로 303', courier: 'CJ대한통운', trackingNumber: '9988776655' }
    },
    {
        id: 'order-007',
        userId: 'user-107',
        userName: '윤채원',
        productName: '소프트 베어 인형',
        productId: 'toy-001',
        rentalStartDate: '2023-03-05',
        rentalEndDate: '2023-03-19',
        status: '승인대기',
        shippingInfo: { address: '울산시 남구 삼산로 404', courier: '', trackingNumber: '' }
    },
    {
        id: 'order-008',
        userId: 'user-108',
        userName: '임서연',
        productName: '학습용 태블릿',
        productId: 'toy-003',
        rentalStartDate: '2023-03-06',
        rentalEndDate: '2023-03-20',
        status: '승인대기',
        shippingInfo: { address: '수원시 영통구 광교중앙로 150', courier: '', trackingNumber: '' }
    },
    {
        id: 'order-009',
        userId: 'user-109',
        userName: '한지우',
        productName: '가족 보드게임 컬렉션',
        productId: 'toy-005',
        rentalStartDate: '2023-03-08',
        rentalEndDate: '2023-03-22',
        status: '배송중',
        shippingInfo: { address: '용인시 수지구 포은대로 599', courier: '롯데택배', trackingNumber: '2345678901' }
    },
    {
        id: 'order-010',
        userId: 'user-110',
        userName: '신은경',
        productName: '크레용 미술 세트',
        productId: 'toy-006',
        rentalStartDate: '2023-03-10',
        rentalEndDate: '2023-03-24',
        status: '대여중',
        shippingInfo: { address: '성남시 분당구 판교역로 235', courier: '한진택배', trackingNumber: '3456789012' }
    },
    {
        id: 'order-011',
        userId: 'user-111',
        userName: '오지호',
        productName: '점프 로프',
        productId: 'toy-007',
        rentalStartDate: '2023-02-25',
        rentalEndDate: '2023-03-11',
        status: '반납완료',
        shippingInfo: { address: '고양시 일산동구 중앙로 1275', courier: 'CJ대한통운', trackingNumber: '4567890123' }
    },
    {
        id: 'order-012',
        userId: 'user-112',
        userName: '유재석',
        productName: '전략 체스 세트',
        productId: 'toy-012',
        rentalStartDate: '2023-02-18',
        rentalEndDate: '2023-03-04',
        status: '연체',
        shippingInfo: { address: '서울시 마포구 상암산로 76', courier: '우체국택배', trackingNumber: '5678901234' }
    },
    {
        id: 'order-013',
        userId: 'user-113',
        userName: '송지효',
        productName: '클레이 아트 키트',
        productId: 'toy-013',
        rentalStartDate: '2023-02-12',
        rentalEndDate: '2023-02-26',
        status: '파손',
        shippingInfo: { address: '서울시 서초구 서초대로 217', courier: 'CJ대한통운', trackingNumber: '6789012345' }
    },
    {
        id: 'order-014',
        userId: 'user-114',
        userName: '김종국',
        productName: '미니 축구공 세트',
        productId: 'toy-014',
        rentalStartDate: '2023-03-11',
        rentalEndDate: '2023-03-25',
        status: '승인대기',
        shippingInfo: { address: '서울시 강남구 도산대로 420', courier: '', trackingNumber: '' }
    },
    {
        id: 'order-015',
        userId: 'user-115',
        userName: '하동훈',
        productName: '로봇 친구',
        productId: 'toy-015',
        rentalStartDate: '2023-03-12',
        rentalEndDate: '2023-03-26',
        status: '배송중',
        shippingInfo: { address: '서울시 용산구 이태원로 294', courier: '롯데택배', trackingNumber: '7890123456' }
    }
];

// 유틸리티 함수들

// 게시판 관련 더미 데이터
export const boards = [
  { id: 'notice', name: '공지사항', description: '중요 공지를 확인하세요.' },
  { id: 'qna', name: 'Q&A', description: '상품 및 서비스에 대해 궁금한 점을 질문하세요.' },
  { id: 'review', name: '이용후기', description: '서비스 이용 후기를 공유해주세요.' },
];

export const posts = [
  // 공지사항
  { id: 'post-001', boardId: 'notice', title: '[안내] 서비스 정기 점검 안내 (매월 첫째주 월요일)', author: '관리자', createdAt: '2023-03-01', views: 1204, content: '보다 나은 서비스 제공을 위해 매월 첫째주 월요일 자정에 정기 점검을 실시합니다. 이용에 참고해주시기 바랍니다.' },
  { id: 'post-002', boardId: 'notice', title: '[이벤트] 신규 가입 회원 대상 웰컴 쿠폰 증정 이벤트', author: '관리자', createdAt: '2023-03-05', views: 2580, content: '지금 가입하시는 모든 분들께 3,000원 할인 쿠폰을 드립니다! 많은 참여 바랍니다.' },

  // Q&A
  { id: 'post-003', boardId: 'qna', title: '배송은 보통 얼마나 걸리나요?', author: '김도담', createdAt: '2023-03-02', views: 58, content: '주문하고 싶은데, 혹시 배송 기간이 어느 정도 소요되는지 알 수 있을까요? 지역은 서울입니다.' },
  { id: 'post-004', boardId: 'qna', title: '대여 상품 파손 시 어떻게 처리되나요?', author: '이로운', createdAt: '2023-03-03', views: 120, content: '아이가 사용하다가 장난감이 부서지면 어떻게 해야 하나요? 변상 규정이 궁금합니다.' },
  { id: 'post-005', boardId: 'qna', title: '구독 플랜 변경은 어떻게 하나요?', author: '박하준', createdAt: '2023-03-06', views: 77, content: '현재 베이직 플랜을 이용 중인데, 프리미엄 플랜으로 변경하고 싶습니다. 절차를 알려주세요.' },

  // 이용후기
  { id: 'post-006', boardId: 'review', title: '창의력 블록 세트, 아이가 정말 좋아해요!', author: '최아리', createdAt: '2023-03-04', views: 95, content: '이번에 대여한 블록 세트 덕분에 아이와 즐거운 시간을 보냈습니다. 장난감 상태도 깨끗하고 배송도 빨랐어요. 추천합니다!' },
  { id: 'post-007', boardId: 'review', title: 'RC카 대여 후기입니다.', author: '정다은', createdAt: '2023-03-07', views: 43, content: '아이가 RC카를 너무 갖고 싶어해서 한번 대여해봤는데, 생각보다 조작도 쉽고 재미있네요. 다음에 다른 상품도 이용해보고 싶어요.' },
];

export const getProductById = (id) => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (categoryId) => {
  return products.filter(product => product.category === categoryId);
};

export const getCategoryById = (id) => {
  return categories.find(category => category.id === id);
};

export const searchProducts = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery)
  );
};

export const filterProductsByPrice = (products, priceRange) => {
  return products.filter(product => {
    const price = product.discountPrice || product.price;
    return price >= priceRange.min && price <= priceRange.max;
  });
};

export const sortProducts = (products, sortBy) => {
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'price-low':
      return sortedProducts.sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;
        return priceA - priceB;
      });
    case 'price-high':
      return sortedProducts.sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;
        return priceB - priceA;
      });
    case 'rating':
      return sortedProducts.sort((a, b) => b.rating - a.rating);
    case 'reviews':
      return sortedProducts.sort((a, b) => b.reviewCount - a.reviewCount);
    case 'newest':
      return sortedProducts.sort((a, b) => b.isNew - a.isNew);
    case 'popularity':
    default:
      return sortedProducts.sort((a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating);
  }
};