const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/lead', (req, res) => {
  const { name, email, tripInterest, message } = req.body || {};

  if (!name || !email || !tripInterest || !message) {
    return res.status(400).json({ message: 'Please complete all fields before submitting.' });
  }

  console.log('New safari lead received:', { name, email, tripInterest, message });
  return res.status(200).json({
    message: 'Lead captured successfully.',
    redirect: 'mailto',
  });
});

app.post('/api/paypal/create-order', async (req, res) => {
  const { itemName, total, currency } = req.body || {};

  if (!itemName || !total || !currency) {
    return res.status(400).json({ message: 'Missing PayPal checkout data.' });
  }

  const mockApprovalUrl = `https://www.paypal.com/checkoutnow?token=mock-${Date.now()}`;

  return res.status(200).json({
    message: 'PayPal order created successfully.',
    approvalUrl: mockApprovalUrl,
    orderId: `mock-order-${Date.now()}`,
  });
});

app.listen(port, () => {
  console.log(`Safari template backend running on http://localhost:${port}`);
});
