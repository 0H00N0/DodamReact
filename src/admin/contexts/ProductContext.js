import React, { createContext, useReducer, useContext } from 'react';

// 초기 목업 데이터
const initialData = {
  products: [
    {
      productId: 1,
      productName: '레고 클래식 블록',
      imageName: 'lego_classic.jpg',
      price: 29900,
      description: '상상력을 자극하는 다채로운 레고 블록 세트입니다.',
      stockQuantity: 15,
      status: 'ACTIVE',
      category: { categoryId: 1, categoryName: '블록/조립' },
      brand: { brandId: 1, brandName: '레고' },
      createdAt: new Date('2023-01-15T09:30:00'),
      updatedAt: new Date('2023-08-01T14:00:00'),
    },
    {
      productId: 2,
      productName: '뽀로로 코딩 컴퓨터',
      imageName: 'pororo_coding.jpg',
      price: 49900,
      description: '놀면서 배우는 어린이용 코딩 컴퓨터입니다.',
      stockQuantity: 8,
      status: 'ACTIVE',
      category: { categoryId: 2, categoryName: '교육/학습' },
      brand: { brandId: 2, brandName: '아이코닉스' },
      createdAt: new Date('2023-02-20T11:00:00'),
      updatedAt: new Date('2023-07-25T18:30:00'),
    },
    {
      productId: 3,
      productName: '타요 컨트롤 주차타워',
      imageName: 'tayo_tower.jpg',
      price: 59900,
      description: '타요 미니카와 함께하는 신나는 주차타워 놀이!',
      stockQuantity: 0,
      status: 'OUT_OF_STOCK',
      category: { categoryId: 3, categoryName: '자동차/기차' },
      brand: { brandId: 3, brandName: '미미월드' },
      createdAt: new Date('2023-03-10T14:20:00'),
      updatedAt: new Date('2023-08-02T10:10:00'),
    },
    {
        productId: 4,
        productName: '실바니안 패밀리 이층집',
        imageName: 'sylvanian_house.jpg',
        price: 79900,
        description: '아기자기한 소품과 함께하는 인형놀이 세트.',
        stockQuantity: 12,
        status: 'ACTIVE',
        category: { categoryId: 4, categoryName: '인형/소꿉놀이' },
        brand: { brandId: 4, brandName: '실바니안' },
        createdAt: new Date('2023-04-05T10:00:00'),
        updatedAt: new Date('2023-08-01T11:00:00'),
    },
    {
        productId: 5,
        productName: '핑크퐁 아기상어 노래하는 인형',
        imageName: 'pinkfong_shark.jpg',
        price: 25000,
        description: '노래하고 춤추는 인기 만점 아기상어 인형.',
        stockQuantity: 20,
        status: 'ACTIVE',
        category: { categoryId: 4, categoryName: '인형/소꿉놀이' },
        brand: { brandId: 2, brandName: '아이코닉스' },
        createdAt: new Date('2023-05-11T13:45:00'),
        updatedAt: new Date('2023-07-30T13:45:00'),
    },
    {
        productId: 6,
        productName: '또봇V 변신로봇',
        imageName: 'tobot_v.jpg',
        price: 35000,
        description: '자동차에서 로봇으로 변신하는 멋진 또봇.',
        stockQuantity: 5,
        status: 'ACTIVE',
        category: { categoryId: 3, categoryName: '자동차/기차' },
        brand: { brandId: 3, brandName: '미미월드' },
        createdAt: new Date('2023-06-18T18:00:00'),
        updatedAt: new Date('2023-08-03T09:00:00'),
    },
    {
        productId: 7,
        productName: '콩순이 말하는 냉장고',
        imageName: 'kongsuni_fridge.jpg',
        price: 45000,
        description: '재미있는 소리와 함께하는 콩순이 냉장고 놀이.',
        stockQuantity: 0,
        status: 'OUT_OF_STOCK',
        category: { categoryId: 4, categoryName: '인형/소꿉놀이' },
        brand: { brandId: 3, brandName: '미미월드' },
        createdAt: new Date('2023-07-01T09:00:00'),
        updatedAt: new Date('2023-07-28T19:00:00'),
    },
    {
        productId: 8,
        productName: '플레이도우 피자 만들기 세트',
        imageName: 'playdoh_pizza.jpg',
        price: 19900,
        description: '안전한 점토로 나만의 피자를 만들어 보세요.',
        stockQuantity: 30,
        status: 'ACTIVE',
        category: { categoryId: 1, categoryName: '블록/조립' },
        brand: { brandId: 1, brandName: '레고' }, // Assuming Play-Doh is under a major brand umbrella for simplicity
        createdAt: new Date('2023-07-15T11:20:00'),
        updatedAt: new Date('2023-08-02T14:20:00'),
    },
    {
        productId: 9,
        productName: '브루더 벤츠 트럭',
        imageName: 'bruder_truck.jpg',
        price: 89000,
        description: '실제와 똑같은 정교한 디자인의 독일제 트럭 장난감.',
        stockQuantity: 7,
        status: 'INACTIVE',
        category: { categoryId: 3, categoryName: '자동차/기차' },
        brand: { brandId: 4, brandName: '실바니안' }, // Assuming Bruder is under a major brand umbrella for simplicity
        createdAt: new Date('2023-07-22T16:00:00'),
        updatedAt: new Date('2023-07-29T12:00:00'),
    },
    {
        productId: 10,
        productName: '립프로그 100워드북',
        imageName: 'leapfrog_book.jpg',
        price: 32000,
        description: '영어와 한국어를 동시에 배우는 사운드북.',
        stockQuantity: 11,
        status: 'ACTIVE',
        category: { categoryId: 2, categoryName: '교육/학습' },
        brand: { brandId: 2, brandName: '아이코닉스' },
        createdAt: new Date('2023-08-01T10:30:00'),
        updatedAt: new Date('2023-08-03T11:30:00'),
    }
  ],
  categories: [
    { categoryId: 1, categoryName: '블록/조립' },
    { categoryId: 2, categoryName: '교육/학습' },
    { categoryId: 3, categoryName: '자동차/기차' },
    { categoryId: 4, categoryName: '인형/소꿉놀이' },
  ],
  brands: [
    { brandId: 1, brandName: '레고' },
    { brandId: 2, brandName: '아이코닉스' },
    { brandId: 3, brandName: '미미월드' },
    { brandId: 4, brandName: '실바니안' },
  ],
};

// 리듀서 함수
const productReducer = (state, action) => {
  switch (action.type) {
    case 'GET_PRODUCTS':
      return state.products;
    case 'ADD_PRODUCT':
      const newProduct = {
        ...action.payload,
        productId: state.products.length > 0 ? Math.max(...state.products.map(p => p.productId)) + 1 : 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        products: [...state.products, newProduct],
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.productId === action.payload.productId ? { ...p, ...action.payload, updatedAt: new Date() } : p
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.productId !== action.payload),
      };
    default:
      return state;
  }
};

// Context 생성
const ProductContext = createContext();

// ProductProvider 컴포넌트
export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialData);

  const getProducts = () => state.products;
  const getProductById = (id) => state.products.find(p => p.productId === parseInt(id));
  const addProduct = (product) => dispatch({ type: 'ADD_PRODUCT', payload: product });
  const updateProduct = (id, product) => dispatch({ type: 'UPDATE_PRODUCT', payload: { productId: parseInt(id), ...product } });
  const deleteProduct = (id) => dispatch({ type: 'DELETE_PRODUCT', payload: id });
  const getCategories = () => state.categories;
  const getBrands = () => state.brands;

  const value = {
    products: state.products,
    categories: state.categories,
    brands: state.brands,
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    getBrands,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

// useProduct 커스텀 훅
export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};