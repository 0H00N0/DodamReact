import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api-config';

const Login = () => {
    const [formData, setFormData] = useState({
        mid: '',           // 아이디
        mpw: ''            // 비밀번호
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // 에러 메시지 클리어
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // 필수 필드 검증
        if (!formData.mid.trim()) {
            newErrors.mid = '아이디를 입력해주세요.';
        }

        if (!formData.mpw.trim()) {
            newErrors.mpw = '비밀번호를 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/member/loginForm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                alert(`환영합니다, ${result.mname}님!`);
                navigate('/'); // 메인 페이지로 이동
            } else {
                // 서버 오류 처리
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || '로그인에 실패했습니다.';
                alert(errorMessage);
            }
            
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupRedirect = () => {
        navigate('/signup');
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem' }}>
            <h2>로그인</h2>
            <form onSubmit={handleSubmit}>
                {/* 아이디 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        아이디 <span style={{ color: 'red' }}>*</span>
                        <input
                            type="text"
                            name="mid"
                            value={formData.mid}
                            onChange={handleChange}
                            placeholder="아이디를 입력하세요"
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: errors.mid ? '1px solid red' : '1px solid #ccc'
                            }}
                        />
                        {errors.mid && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.mid}</span>}
                    </label>
                </div>

                {/* 비밀번호 */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label>
                        비밀번호 <span style={{ color: 'red' }}>*</span>
                        <input
                            type="password"
                            name="mpw"
                            value={formData.mpw}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: errors.mpw ? '1px solid red' : '1px solid #ccc'
                            }}
                        />
                        {errors.mpw && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.mpw}</span>}
                    </label>
                </div>

                {/* 로그인 버튼 */}
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: isLoading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    {isLoading ? '로그인 중...' : '로그인'}
                </button>

                {/* 회원가입 링크 */}
                <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#666' }}>계정이 없으신가요? </span>
                    <button
                        type="button"
                        onClick={handleSignupRedirect}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        회원가입
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;