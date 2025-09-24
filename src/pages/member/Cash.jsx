//결제수단 조회 페이지
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/member/Cash.css';

const Cash = () => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`
    };      
    useEffect(() => {
        if (!userId || !token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }       

        const fetchPaymentMethods = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/payments/${userId}`, { headers });
                setPaymentMethods(response.data);
                setLoading(false);
            } catch (err) {
                setError('결제수단을 불러오는 중 오류가 발생했습니다.');
                setLoading(false);
            };
        };

        fetchPaymentMethods();
    }, [userId, token, navigate]);

    const handleAddPaymentMethod = () => {
        navigate('/member/add-payment');
    }; 
    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div>Loading...</div>;
    }           
    if (error) {
        return <div>{error}</div>;
    }
    return ( <div className="cash-container">
        <Header />
        <h2>결제수단 조회</h2>
        <button onClick={handleAddPaymentMethod}>결제수단 추가</button>
        <button onClick={handleBack}>뒤로가기</button>
        <ul>
            {paymentMethods.map(method => (
                <li key={method.id}>{method.name}</li>
            ))}
        </ul>
        <Footer />
    </div>);
};

export default Cash;
