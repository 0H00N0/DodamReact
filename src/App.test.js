import { render, screen } from '@testing-library/react';
import App from './App';

test('renders 도담도담 header and navigation', () => {
  render(<App />);
  
  // 스킵 링크가 렌더링 되는지 확인
  const skipLink = screen.getByText('메인 콘텐츠로 건너뛰기');
  expect(skipLink).toBeInTheDocument();
  
  // 로고 이미지가 렌더링 되는지 확인
  const logoElement = screen.getByAltText('도담도담');
  expect(logoElement).toBeInTheDocument();
  
  // 네비게이션 메뉴가 렌더링 되는지 확인
  const toysMenu = screen.getByText('장난감');
  expect(toysMenu).toBeInTheDocument();
  
  const ageMenu = screen.getByText('연령별');
  expect(ageMenu).toBeInTheDocument();
  
  // Footer 콘텐츠 확인
  const footerTitle = screen.getByText('도담도담');
  expect(footerTitle).toBeInTheDocument();
});
