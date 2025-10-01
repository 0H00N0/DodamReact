import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../../utils/dummyData';
import styles from './SearchDropdown.module.css';

const SearchDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([
    '블록',
    '인형',
    '교육완구',
    '보드게임'
  ]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 검색 기록에 추가
      if (!searchHistory.includes(searchQuery.trim())) {
        setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
      // 검색 페이지로 이동
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      onClose();
    }
  };

  const handleHistoryClick = (query) => {
    // 검색 페이지로 이동
    navigate(`/search/${encodeURIComponent(query)}`);
    onClose();
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const handleCategoryClick = (category) => {
    // 카테고리 페이지로 이동
    navigate(`/category/${category.id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div ref={dropdownRef} className={styles.dropdown}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="상품을 검색해보세요"
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </form>

        {searchHistory.length > 0 && (
          <div className={styles.historySection}>
            <div className={styles.historyHeader}>
              <span className={styles.historyTitle}>최근 검색</span>
              <button onClick={clearHistory} className={styles.clearButton}>
                전체 삭제
              </button>
            </div>
            <div className={styles.historyList}>
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(query)}
                  className={styles.historyItem}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                  </svg>
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.quickLinks}>
          <span className={styles.quickTitle}>인기 카테고리</span>
          <div className={styles.quickList}>
            {categories.slice(0, 4).map((category) => (
              <button 
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={styles.quickItem}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDropdown;