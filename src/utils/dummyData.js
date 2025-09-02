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

// 유틸리티 함수들
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