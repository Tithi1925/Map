import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = secureLocalStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          toast.error('Session expired');
          navigate('/login');
        }
      } catch (error) {
        toast.error('Invalid token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);
};

export default useAuth;
