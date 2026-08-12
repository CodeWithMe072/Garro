import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmergencyPickup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/roadside', { replace: true });
  }, [navigate]);

  return null;
};

export default EmergencyPickup;
