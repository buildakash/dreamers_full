
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a coupon code in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const couponCode = urlParams.get('code');
    
    if (couponCode) {
      // Redirect to register page with coupon code
      navigate(`/register?code=${couponCode}`);
    }
  }, [navigate]);

  return <LandingPage />;
};

export default Index;
