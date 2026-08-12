import { API_BASE } from '../config/api';

/**
 * Checks for any pending quote token or payload saved in localStorage prior to authentication.
 * Claims the server-saved quote and redirects the newly logged-in user directly to the payment page.
 */
export const processPendingQuoteIfAny = async (token, navigate, toast) => {
  const quoteToken = localStorage.getItem('pending_quote_token');
  const raw = localStorage.getItem('pending_quote_data');

  if (!quoteToken && !raw) return false;

  // Option 1: Claim server-persisted quote via quoteToken
  if (quoteToken) {
    try {
      const res = await fetch(`${API_BASE}/api/requests/claim-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quoteToken })
      });
      const data = await res.json();
      localStorage.removeItem('pending_quote_token');
      localStorage.removeItem('pending_quote_data');

      if (res.ok && data.success && data.request) {
        if (toast) toast.success('Your quote has been linked to your account!');
        navigate(data.redirectUrl || `/payment/${data.request._id}`);
        return true;
      }
    } catch (err) {
      console.error('Failed to claim pending quote via token:', err);
      localStorage.removeItem('pending_quote_token');
    }
  }

  // Option 2: Fallback submission using raw JSON payload
  if (raw) {
    try {
      const data = JSON.parse(raw);

      // 1. Register vehicle for user
      const vehicleRes = await fetch(`${API_BASE}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          make: data.carBrand || 'Toyota',
          model: data.carModel || 'Camry',
          year: parseInt(data.carYear) || 2020,
          VIN: data.vinNumber || '',
          registrationNumber: `DXB-${Math.floor(Math.random() * 90000 + 10000)}`
        })
      });

      const vehicleData = await vehicleRes.json();
      const vehicleId = vehicleData.vehicle?._id || null;

      const serviceTypeMap = {
        oil_change: 'minor_service',
        brake_repair: 'brake_repair',
        battery: 'battery',
        engine: 'other',
        tyre: 'other',
        ac: 'ac_repair',
        full_detailing: 'other',
        towing: 'other',
        other: 'other'
      };
      const serviceTypeCode = serviceTypeMap[data.subCategory] || 'other';

      const requestRes = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId,
          serviceType: serviceTypeCode,
          subCategory: data.subCategory || 'General Service',
          vinNumber: data.vinNumber || '',
          description: data.problemTitle || `Requesting quote for ${data.subCategory || 'general service'}`,
          urgency: data.urgency || 'flexible',
          location: {
            address: `${data.area || ''}, ${data.cityName || ''}`.trim() || 'Dubai',
            lat: 25.2048,
            lng: 55.2708
          },
          garageId: null
        })
      });

      const requestData = await requestRes.json();
      localStorage.removeItem('pending_quote_data');

      if (requestRes.ok && requestData.success) {
        if (toast) toast.success('Your quote request has been saved!');
        if (requestData.request?._id) {
          navigate(`/payment/${requestData.request._id}`);
        } else {
          navigate('/my-requests');
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to submit pending quote fallback:', err);
      localStorage.removeItem('pending_quote_data');
    }
  }

  return false;
};
