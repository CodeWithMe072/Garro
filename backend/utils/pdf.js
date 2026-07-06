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

// Legacy basic invoice template (kept for backward compatibility)
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
      <div><strong>Invoice #${invoice.invoiceNumber || invoice._id.toString().slice(-6).toUpperCase()}</strong></div>
      <div>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
      <div style="margin-top:8px"><span class="${invoice.status}">${invoice.status.toUpperCase()}</span></div>
    </div>
  </div>

  <h2>Tax Invoice</h2>
  <p><strong>Job Reference:</strong> JC-${job._id.toString().slice(-6).toUpperCase()}</p>
  <p><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>

  <table>
    <tr><th>Description</th><th>Amount (AED)</th></tr>
    <tr><td>Service Amount</td><td>${invoice.subtotal || invoice.amount}</td></tr>
    <tr><td>VAT (${invoice.vatPercent || 5}%)</td><td>${invoice.vatAmount || invoice.vat}</td></tr>
    <tr class="total-row"><td>Total Due</td><td>AED ${invoice.totalAmount || invoice.total}</td></tr>
  </table>

  <div class="footer">Garro Car Services UAE | support@garro.ae | www.garro.ae<br>TRN: 100XXXXXXXX</div>
</body>
</html>`;

/**
 * UAE Tax Invoice — Premium format based on real Dubai invoices (Invygo + Xclusive Auto Repairing)
 * Customer sees: Parts + Labour + VAT only (service fee is internal)
 */
export const generateInvoicePDF = async (invoice, customer, garage, job) => {
  const lineItemsHTML = (invoice.lineItems || []).map((item, i) => `
    <tr>
      <td style="padding:10px 12px;font-size:12px">${i + 1}</td>
      <td style="padding:10px 12px;font-size:12px">${item.description}</td>
      <td style="padding:10px 12px;font-size:12px">${item.qty}</td>
      <td style="padding:10px 12px;font-size:12px">AED ${Number(item.unitPrice).toFixed(2)}</td>
      <td style="padding:10px 12px;font-size:12px;font-weight:600">AED ${Number(item.total).toFixed(2)}</td>
    </tr>
  `).join('');

  const invoiceDate = new Date(invoice.createdAt || new Date())
    .toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const jobRef = `GAR-JOB-${job._id.toString().slice(-6).toUpperCase()}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; font-size: 13px; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
  .logo { font-size: 32px; font-weight: 900; color: #185FA5; letter-spacing: -1px; }
  .company-info { font-size: 11px; color: #666; margin-top: 4px; line-height: 1.6; }
  .invoice-meta { text-align: right; }
  .invoice-meta h1 { font-size: 22px; color: #185FA5; margin-bottom: 8px; }
  .invoice-meta table { margin-left: auto; }
  .invoice-meta td { padding: 2px 8px; font-size: 12px; }
  .invoice-meta td:first-child { color: #888; text-align: right; }
  .invoice-meta td:last-child { font-weight: 600; }

  .divider { border: none; border-top: 2px solid #185FA5; margin: 20px 0; }

  .parties { display: flex; justify-content: space-between; margin: 20px 0; }
  .party-box { width: 48%; }
  .party-box h3 { font-size: 11px; text-transform: uppercase; color: #185FA5; letter-spacing: .05em; margin-bottom: 8px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
  .party-box p { font-size: 12px; line-height: 1.7; color: #333; }
  .party-box strong { font-size: 14px; color: #1a1a2e; display: block; margin-bottom: 4px; }

  .service-badge { background: #f0f7ff; border-left: 3px solid #185FA5; padding: 10px 14px; margin: 16px 0; border-radius: 0 6px 6px 0; }
  .service-badge span { font-size: 11px; color: #185FA5; text-transform: uppercase; letter-spacing: .05em; }
  .service-badge strong { display: block; font-size: 14px; color: #1a1a2e; margin-top: 2px; }

  .items-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .items-table thead tr { background: #185FA5; color: white; }
  .items-table thead th { padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 500; }
  .items-table tbody tr { border-bottom: 1px solid #f0f0f0; }
  .items-table tbody tr:nth-child(even) { background: #fafafa; }

  .totals-wrap { margin-left: auto; width: 280px; margin-top: 16px; }
  .totals-wrap table { width: 100%; border-collapse: collapse; }
  .totals-wrap td { padding: 8px 10px; font-size: 13px; }
  .totals-wrap tr.subtotal td { border-top: 1px solid #e0e0e0; color: #333; }
  .totals-wrap tr.vat-row td { color: #555; font-size: 12px; }
  .totals-wrap tr.grand-total { background: #185FA5; color: white; }
  .totals-wrap tr.grand-total td { padding: 12px 10px; font-size: 16px; font-weight: 700; }

  .paid-stamp { text-align: center; margin: 24px 0 16px; }
  .paid-stamp span {
    display: inline-block;
    border: 3px solid #27ae60;
    color: #27ae60;
    font-size: 20px;
    font-weight: 900;
    padding: 6px 28px;
    border-radius: 6px;
    letter-spacing: 4px;
    transform: rotate(-5deg);
  }

  .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: flex-end; }
  .terms { font-size: 10px; color: #999; max-width: 420px; line-height: 1.7; }
  .terms strong { display: block; margin-bottom: 4px; color: #666; font-size: 11px; }
  .footer-brand { text-align: right; font-size: 11px; color: #888; }
  .footer-brand strong { display: block; color: #185FA5; font-size: 14px; font-weight: 900; margin-bottom: 2px; }

  .trn-badge { display: inline-block; background: #f0f7ff; border: 1px solid #185FA5; color: #185FA5; font-size: 10px; padding: 2px 8px; border-radius: 4px; margin-top: 4px; font-weight: 600; letter-spacing: .05em; }
  .status-paid { color: #27ae60; font-weight: 700; }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="logo">GARRO</div>
      <div class="company-info">
        UAE Car Service Marketplace<br>
        Dubai, United Arab Emirates<br>
        support@garro.ae &nbsp;|&nbsp; www.garro.ae<br>
        <span class="trn-badge">TRN: 100XXXXXXXX</span>
      </div>
    </div>
    <div class="invoice-meta">
      <h1>Tax Invoice</h1>
      <table>
        <tr><td>Invoice No:</td><td>${invoice.invoiceNumber}</td></tr>
        <tr><td>Date:</td><td>${invoiceDate}</td></tr>
        <tr><td>Job Ref:</td><td>${jobRef}</td></tr>
        <tr><td>Status:</td><td class="status-paid">PAID</td></tr>
      </table>
    </div>
  </div>

  <hr class="divider">

  <!-- PARTIES -->
  <div class="parties">
    <div class="party-box">
      <h3>Billed From</h3>
      <strong>Garro Car Services</strong>
      <p>
        ${garage.name || 'Authorized Service Partner'}<br>
        Dubai, United Arab Emirates<br>
        TRN: 100XXXXXXXX
      </p>
    </div>
    <div class="party-box">
      <h3>Billed To</h3>
      <strong>${customer.name || 'Valued Customer'}</strong>
      <p>
        ${customer.email || ''}<br>
        ${customer.phone || ''}<br>
        Dubai, UAE
      </p>
    </div>
  </div>

  <!-- LINE ITEMS TABLE -->
  <table class="items-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemsHTML}
    </tbody>
  </table>

  <!-- TOTALS -->
  <div class="totals-wrap">
    <table>
      <tr class="subtotal">
        <td>Subtotal</td>
        <td style="text-align:right">AED ${Number(invoice.subtotal).toFixed(2)}</td>
      </tr>
      <tr class="vat-row">
        <td>VAT (${invoice.vatPercent || 5}%)</td>
        <td style="text-align:right">AED ${Number(invoice.vatAmount).toFixed(2)}</td>
      </tr>
      <tr class="grand-total">
        <td>Total Amount Due</td>
        <td style="text-align:right">AED ${Number(invoice.totalAmount).toFixed(2)}</td>
      </tr>
    </table>
  </div>

  <!-- PAID STAMP -->
  <div class="paid-stamp">
    <span>✓ PAID</span>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="terms">
      <strong>Terms &amp; Conditions</strong>
      Payment was processed securely via Stripe. This is a computer-generated UAE Tax Invoice
      and is valid without a physical signature. All prices shown include 5% VAT as per UAE Federal
      Decree-Law No. 8 of 2017 on Value Added Tax. For any queries contact support@garro.ae
      within 7 days of the invoice date.
    </div>
    <div class="footer-brand">
      <strong>GARRO</strong>
      UAE Car Service Marketplace<br>
      www.garro.ae<br>
      TRN: 100XXXXXXXX
    </div>
  </div>

</body>
</html>`;

  return generatePDF(html);
};
