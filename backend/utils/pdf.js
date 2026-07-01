import puppeteer from 'puppeteer';

export const generatePDF = async (html) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page    = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer  = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
  await browser.close();
  return buffer;
};

export const quoteTemplate = (quote, request, garage) => `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #185FA5; padding-bottom: 20px; }
  .logo { font-size: 28px; font-weight: bold; color: #185FA5; }
  h2 { color: #185FA5; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #185FA5; color: white; padding: 10px; text-align: left; }
  td { padding: 10px; border-bottom: 1px solid #eee; }
  .total-row { font-weight: bold; font-size: 16px; background: #f0f7ff; }
  .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
  .valid { color: #e74c3c; font-size: 13px; margin-top: 10px; }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="logo">GARRO</div>
      <div>UAE Car Service Marketplace</div>
    </div>
    <div style="text-align:right">
      <div><strong>Quote #${quote._id.toString().slice(-6).toUpperCase()}</strong></div>
      <div>Date: ${new Date(quote.createdAt).toLocaleDateString()}</div>
    </div>
  </div>

  <h2>Service Quote</h2>
  <p><strong>Garage:</strong> ${garage.name}</p>
  <p><strong>Service Type:</strong> ${request.serviceType.replace(/_/g, ' ')}</p>
  <p><strong>Description:</strong> ${request.description}</p>

  <table>
    <tr><th>Item</th><th>Amount (AED)</th></tr>
    <tr><td>Parts Cost</td><td>${quote.partsCost}</td></tr>
    <tr><td>Labor Cost</td><td>${quote.laborCost}</td></tr>
    <tr><td>Subtotal</td><td>${quote.subtotal}</td></tr>
    <tr><td>Service Fee (10%)</td><td>${quote.serviceFee}</td></tr>
    <tr><td>VAT (5%)</td><td>${quote.vat}</td></tr>
    <tr class="total-row"><td>Total Amount Due</td><td>AED ${quote.customerTotal}</td></tr>
  </table>

  <p class="valid">⚠ This quote is valid until ${new Date(quote.validUntil).toLocaleString()}</p>
  <div class="footer">Garro Car Services UAE | support@garro.ae | www.garro.ae</div>
</body>
</html>`;

export const invoiceTemplate = (invoice, job, quote) => `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #185FA5; padding-bottom: 20px; }
  .logo { font-size: 28px; font-weight: bold; color: #185FA5; }
  .paid { background: #27ae60; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; }
  .pending { background: #e74c3c; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #185FA5; color: white; padding: 10px; text-align: left; }
  td { padding: 10px; border-bottom: 1px solid #eee; }
  .total-row { font-weight: bold; font-size: 16px; background: #f0f7ff; }
  .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="logo">GARRO</div>
      <div>UAE Car Service Marketplace</div>
    </div>
    <div style="text-align:right">
      <div><strong>Invoice #${invoice._id.toString().slice(-6).toUpperCase()}</strong></div>
      <div>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
      <div style="margin-top:8px"><span class="${invoice.status}">${invoice.status.toUpperCase()}</span></div>
    </div>
  </div>

  <h2>Tax Invoice</h2>
  <p><strong>Job Reference:</strong> JC-${job._id.toString().slice(-6).toUpperCase()}</p>
  <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>

  <table>
    <tr><th>Description</th><th>Amount (AED)</th></tr>
    <tr><td>Service Amount</td><td>${invoice.amount}</td></tr>
    <tr><td>VAT (5%)</td><td>${invoice.vat}</td></tr>
    <tr class="total-row"><td>Total Due</td><td>AED ${invoice.total}</td></tr>
  </table>

  <div class="footer">Garro Car Services UAE | support@garro.ae | www.garro.ae<br>TRN: 100XXXXXXXX</div>
</body>
</html>`;
