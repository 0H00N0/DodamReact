import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api-config';

const Signup = () => {
    const [formData, setFormData] = useState({
        mid: '',           // 아이디
        mpw: '',           // 비밀번호
        mname: '',         // 이름
        memail: '',        // 이메일
        mtel: '',          // 전화번호
        maddr: '',         // 주소
        mpost: '',         // 우편번호
        mbirth: '',        // 생년월일
        mnic: ''           // 닉네임
    });
    
    const [confirmPassword, setConfirmPassword] = useState('');
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
        } else if (formData.mid.length < 4) {
            newErrors.mid = '아이디는 4자 이상이어야 합니다.';
        }

        if (!formData.mpw.trim()) {
            newErrors.mpw = '비밀번호를 입력해주세요.';
        } else if (formData.mpw.length < 6) {
            newErrors.mpw = '비밀번호는 6자 이상이어야 합니다.';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        } else if (formData.mpw !== confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        }

        if (!formData.mname.trim()) {
            newErrors.mname = '이름을 입력해주세요.';
        }

        if (!formData.mtel.trim()) {
            newErrors.mtel = '전화번호를 입력해주세요.';
        } else if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(formData.mtel)) {
            newErrors.mtel = '올바른 전화번호 형식이 아닙니다.';
        }

        // 이메일 선택 필드 검증
        if (formData.memail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.memail)) {
            newErrors.memail = '올바른 이메일 형식이 아닙니다.';
        }

        // 우편번호 검증 (숫자만)
        if (formData.mpost && !/^\d+$/.test(formData.mpost)) {
            newErrors.mpost = '우편번호는 숫자만 입력해주세요.';
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
            // 날짜 형식 변환 (YYYY-MM-DD)
            const signupData = {
                ...formData,
                mpost: formData.mpost ? parseInt(formData.mpost) : null,
                mbirth: formData.mbirth || null
            };

            const response = await fetch(`${API_BASE_URL}/member/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(signupData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('회원가입이 완료되었습니다!');
                navigate('/'); // 메인 페이지로 이동
            } else {
                // 서버 오류 처리
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || '회원가입에 실패했습니다.';
                alert(errorMessage);
            }
            
        } catch (error) {
            console.error('회원가입 오류:', error);
            alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem' }}>
            <h2>회원가입</h2>
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
                <div style={{ marginBottom: '1rem' }}>
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

                {/* 비밀번호 확인 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        비밀번호 확인 <span style={{ color: 'red' }}>*</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호를 다시 입력하세요"
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: errors.confirmPassword ? '1px solid red' : '1px solid #ccc'
                            }}
                        />
                        {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.confirmPassword}</span>}
                    </label>
                </div>

                {/* 이름 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        이름 <span style={{ color: 'red' }}>*</span>
                        <input
                            type="text"
                            name="mname"
                            value={formData.mname}
                            onChange={handleChange}
                            placeholder="이름을 입력하세요"
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: errors.mname ? '1px solid red' : '1px solid #ccc'
                            }}
                        />
                        {errors.mname && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.mname}</span>}
                    </label>
                </div>

                {/* 전화번호 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        전화번호 <span style={{ color: 'red' }}>*</span>
                        <input
                            type="tel"
                            name="mtel"
                            value={formData.mtel}
                            onChange={handleChange}
                            placeholder="010-1234-5678"
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: errors.mtel ? '1px solid red' : '1px solid #ccc'
                            }}
                        />
                        {errors.mtel && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.mtel}</span>}
                    </label>
                </div>

                {/* 이메일 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        이메일
                        <input
                            type="email"
                            name="memail"
                            value={formData.memail}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: errors.memail ? '1px solid red' : '1px solid #ccc'
                            }}
                        />
                        {errors.memail && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.memail}</span>}
                    </label>
                </div>

                {/* 닉네임 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        닉네임
                        <input
                            type="text"
                            name="mnic"
                            value={formData.mnic}
                            onChange={handleChange}
                            placeholder="닉네임을 입력하세요"
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: '1px solid #ccc'
                            }}
                        />
                    </label>
                </div>

                {/* 주소 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        주소
                        <input
                            type="text"
                            name="maddr"
                            value={formData.maddr}
                            onChange={handleChange}
                            placeholder="주소를 입력하세요"
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: '1px solid #ccc'
                            }}
                        />
                    </label>
                </div>

                {/* 우편번호 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        우편번호
                        <input
                            type="text"
                            name="mpost"
                            value={formData.mpost}
                            onChange={handleChange}
                            placeholder="12345"
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: errors.mpost ? '1px solid red' : '1px solid #ccc'
                            }}
                        />
                        {errors.mpost && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.mpost}</span>}
                    </label>
                </div>

                {/* 생년월일 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        생년월일
                        <input
                            type="date"
                            name="mbirth"
                            value={formData.mbirth}
                            onChange={handleChange}
                            style={{ 
                                display: 'block', 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: '1px solid #ccc'
                            }}
                        />
                    </label>
                </div>

                {/* 제출 버튼 */}
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
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? '가입 중...' : '회원가입'}
                </button>
            </form>
        </div>
    );
};

export default Signup;