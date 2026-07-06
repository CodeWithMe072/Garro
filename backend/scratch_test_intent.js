const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNDRhM2Y4ZTczMmU4NTNjMDk5OGNkNyIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc4MzI1ODQ3MH0.Dh5HFGFFe6R1hlPL_N1KpMbRxslFziC3eJy4YaA0eIM';
const quoteId = '6a4a5daba92a0915f000a985'; // Valid quote ID from earlier test

async function testPaymentIntent() {
  const res = await fetch('http://localhost:5000/api/payments/create-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ quoteId })
  });

  const data = await res.json();
  console.log('Response Status:', res.status);
  console.log('Response Body:', JSON.stringify(data, null, 2));
}

testPaymentIntent().catch(console.error);
