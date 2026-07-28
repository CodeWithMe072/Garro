import { Resend } from 'resend';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const hasResend = !!process.env.RESEND_API_KEY;
const resend = hasResend ? new Resend(process.env.RESEND_API_KEY) : null;

const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
const twilioClient = hasTwilio ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

// Status to customer message map
const STATUS_MESSAGES = {
  assigned: (name, helper) => `Hi ${name}, your service request has been assigned. Helper ${helper} will contact you shortly.`,
  quote_sent: (name, cost) => `Hi ${name}, your quote is ready. Total: AED ${cost}. Please login to approve or reject.`,
  quote_approved: (name) => `Hi ${name}, your quote is approved! Your helper is on the way. Expected in 4-5 hours.`,
  pickup_scheduled: (name, eta) => `Hi ${name}, your helper is scheduled for pickup at ${eta}. Track live in the app.`,
  arrived_at_customer: (name) => `Hi ${name}, your Garro technician/helper has arrived at your location.`,
  picked_up: (name) => `Hi ${name}, your vehicle has been picked up and is on the way to the garage.`,
  in_garage: (name) => `Hi ${name}, your vehicle has arrived at the garage. Inspection will begin shortly.`,
  inspection_done: (name) => `Hi ${name}, vehicle inspection is complete. Repair work is about to begin.`,
  repair_in_progress: (name) => `Hi ${name}, your vehicle is being repaired. We will notify you when work is complete.`,
  work_complete: (name) => `Hi ${name}, all repair work is complete! Your vehicle is being prepared for delivery.`,
  ready_for_delivery: (name) => `Hi ${name}, your vehicle is ready for delivery. Our helper will bring it to you shortly.`,
  delivered: (name) => `Hi ${name}, your vehicle has been delivered! Please check and confirm everything is good.`,
  time_extended: (name, hours) => `Hi ${name}, your service completion estimated time has been extended by ${hours} hour(s).`,
  closed: (name, total) => `Hi ${name}, your invoice of AED ${total} is ready. Thank you for choosing Garro!`,
  complaint_resolved: (name, action) => `Hi ${name}, your complaint has been resolved. Resolution action: ${action.replace(/_/g, ' ')}.`
};

// Send Email via Resend
export const sendEmail = async (to, subject, html) => {
  try {
    if (!hasResend || !resend) {
      console.log(`[Demo Notification] Email to ${to}: [${subject}]`);
      return;
    }
    await resend.emails.send({
      from: 'Garro <official@backcrafter.shop>', // works without domain verification
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Resend error:', err.message);
    // Never throw — notification failure should not break the main flow
  }
};

// Send WhatsApp via Twilio
export const sendWhatsApp = async (to, message) => {
  try {
    if (!hasTwilio || !twilioClient) {
      console.log(`[Demo Notification] WhatsApp to ${to}: ${message}`);
      return;
    }
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: formattedTo,
      body: message
    });
    console.log(`WhatsApp sent to ${to}`);
  } catch (err) {
    console.error('Twilio error:', err.message);
  }
};

// Main notification trigger — call this after every status change
export const notifyCustomer = async (customer, eventType, data = {}) => {
  const msgFn = STATUS_MESSAGES[eventType];
  if (!msgFn) {
    console.log(`[Notification Trigger] No status message template found for eventType: ${eventType}`);
    return;
  }

  let message;
  switch (eventType) {
    case 'assigned': message = msgFn(customer.name, data.helperName); break;
    case 'quote_sent': message = msgFn(customer.name, data.cost); break;
    case 'quote_approved': message = msgFn(customer.name); break;
    case 'time_extended': message = msgFn(customer.name, data.additionalHours); break;
    case 'closed': message = msgFn(customer.name, data.total); break;
    case 'complaint_resolved': message = msgFn(customer.name, data.actionType); break;
    default: message = msgFn(customer.name);
  }

  const baseUrl = process.env.FRONTEND_URL || 'https://garro.ae';
  const targetId = data.jobId || data.requestId || '';
  const trackingUrl = targetId ? `${baseUrl}/track/${targetId}` : `${baseUrl}/dashboard`;

  const subject = `Garro — Service Update: ${eventType.replace(/_/g, ' ')}`;
  const html = `<div style="font-family:sans-serif;padding:20px">
    <h2 style="color:#1a1a2e">Garro Car Service</h2>
    <p>${message}</p>
    <a href="${trackingUrl}" style="background:#185FA5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">Track your service</a>
  </div>`;

  console.log(`[Notification Trigger] Dispatching notifications for customer ${customer.name} (${customer.email}) on event: ${eventType}`);

  // Persist to MongoDB
  try {
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      userId: customer._id || customer.id,
      type: eventType,
      message,
      read: false
    });
    console.log(`Notification persisted to database for user ${customer._id || customer.id}`);
  } catch (dbErr) {
    console.error('Failed to persist notification:', dbErr.message);
  }

  // Fire both in parallel — failure of one does not block the other
  const results = await Promise.allSettled([
    sendEmail(customer.email, subject, html),
    sendWhatsApp(customer.phone, message)
  ]);

  const emailResult = results[0].status === 'fulfilled' ? 'Success/Demo' : `Failed: ${results[0].reason}`;
  const waResult = results[1].status === 'fulfilled' ? 'Success/Demo' : `Failed: ${results[1].reason}`;
  console.log(`[Notification Results] Email status: ${emailResult} | WhatsApp status: ${waResult}`);
};

/**
 * Send payment confirmation to customer — WhatsApp + Email with PDF invoice link
 */
export const notifyPayment = async (customer, invoice, pdfUrl) => {
  const amountStr = Number(invoice.totalAmount).toFixed(2);
  const vatStr    = Number(invoice.vatAmount).toFixed(2);
  const dateStr   = new Date().toLocaleDateString('en-AE');

  const waMessage =
    `✅ Payment Confirmed!\n\n` +
    `Hi ${customer.name},\n\n` +
    `Your payment of AED ${amountStr} has been received.\n\n` +
    `📄 Invoice No: ${invoice.invoiceNumber}\n` +
    `📅 Date: ${dateStr}\n\n` +
    `Download your UAE Tax Invoice:\n${pdfUrl}\n\n` +
    `Thank you for choosing Garro! 🚗\nsupport@garro.ae`;

  const emailHtml = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f5f5f5">
  <div style="background:#185FA5;padding:24px 28px;border-radius:10px 10px 0 0;text-align:center">
    <h1 style="color:white;margin:0;font-size:28px;font-weight:900;letter-spacing:-1px">GARRO</h1>
    <p style="color:#a8d4f5;margin:4px 0 0;font-size:13px">UAE Car Service Marketplace</p>
  </div>
  <div style="background:#ffffff;padding:28px;border-radius:0 0 10px 10px;border:1px solid #e0e0e0">
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#f0fff4;border:2px solid #27ae60;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px">✅</div>
      <h2 style="color:#27ae60;margin:10px 0 4px;font-size:20px">Payment Confirmed</h2>
      <p style="color:#888;margin:0;font-size:13px">Your UAE Tax Invoice is ready</p>
    </div>

    <p style="color:#333;margin:0 0 16px">Hi <strong>${customer.name}</strong>,</p>
    <p style="color:#555;margin:0 0 20px;font-size:14px">
      Your payment has been successfully processed and your car service invoice is ready to download.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border-radius:8px;overflow:hidden">
      <tr style="background:#f8fafc">
        <td style="padding:10px 14px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Invoice Number</td>
        <td style="padding:10px 14px;font-weight:700;font-size:13px;border-bottom:1px solid #f0f0f0">${invoice.invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Amount Paid</td>
        <td style="padding:10px 14px;font-weight:700;font-size:18px;color:#185FA5;border-bottom:1px solid #f0f0f0">AED ${amountStr}</td>
      </tr>
      <tr style="background:#f8fafc">
        <td style="padding:10px 14px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">VAT (5%)</td>
        <td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #f0f0f0">AED ${vatStr}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;color:#888;font-size:13px">Payment Date</td>
        <td style="padding:10px 14px;font-size:13px">${dateStr}</td>
      </tr>
    </table>

    <div style="text-align:center;margin:24px 0">
      <a href="${pdfUrl}"
         style="background:#185FA5;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        📄 Download Tax Invoice
      </a>
    </div>

    <p style="font-size:11px;color:#aaa;text-align:center;margin:16px 0 0">
      This is a computer-generated UAE Tax Invoice. Valid without physical signature.<br>
      All prices include 5% VAT as per UAE Federal Decree-Law No. 8 of 2017.
    </p>
  </div>
  <p style="text-align:center;font-size:11px;color:#999;margin-top:12px">
    Garro UAE | support@garro.ae | www.garro.ae
  </p>
</div>`;

  console.log(`[Payment Notification] Sending invoice ${invoice.invoiceNumber} to ${customer.email}`);

  // Persist to MongoDB
  try {
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      userId: customer._id || customer.id,
      type: 'payment_success',
      message: `Payment Confirmed! Your payment of AED ${amountStr} has been received. Tax Invoice ${invoice.invoiceNumber || ''} is ready.`,
      read: false
    });
    console.log(`Payment notification persisted to database for user ${customer._id || customer.id}`);
  } catch (dbErr) {
    console.error('Failed to persist notification:', dbErr.message);
  }

  await Promise.allSettled([
    sendEmail(
      customer.email,
      `Garro — Invoice ${invoice.invoiceNumber} | AED ${amountStr} — Payment Confirmed`,
      emailHtml
    ),
    sendWhatsApp(customer.phone, waMessage)
  ]);
};

/**
 * Notify garage when a new job is assigned to them
 */
export const notifyGarage = async (garage, job, request) => {
  try {
    if (!garage || !garage.email) {
      console.log('[notifyGarage] No garage email — skipping notification');
      return;
    }

    const customerName  = request?.userId?.name  || 'Customer';
    const vehicleMake   = request?.vehicleId?.make  || '';
    const vehicleModel  = request?.vehicleId?.model || '';
    const vehicleYear   = request?.vehicleId?.year  || '';
    const vehicleLabel  = [vehicleYear, vehicleMake, vehicleModel].filter(Boolean).join(' ') || 'Vehicle';
    const serviceType   = (request?.serviceType || 'Service').replace(/_/g, ' ');
    const jobId         = job?._id?.toString()?.slice(-6)?.toUpperCase() || 'N/A';
    const scheduledDate = request?.scheduledArrivalDate
      ? new Date(request.scheduledArrivalDate).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })
      : 'TBC';

    const waMessage =
      `🔧 New Job Assigned — Garro\n\n` +
      `Job ID: #${jobId}\n` +
      `Customer: ${customerName}\n` +
      `Vehicle: ${vehicleLabel}\n` +
      `Service: ${serviceType}\n` +
      `Scheduled: ${scheduledDate}\n\n` +
      `Log in to your Garro Garage Portal to view details.\n` +
      `support@garro.ae`;

    const emailHtml = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f5f5f5">
  <div style="background:#185FA5;padding:24px 28px;border-radius:10px 10px 0 0;text-align:center">
    <h1 style="color:white;margin:0;font-size:28px;font-weight:900">GARRO</h1>
    <p style="color:#a8d4f5;margin:4px 0 0;font-size:13px">UAE Car Service Marketplace</p>
  </div>
  <div style="background:#ffffff;padding:28px;border-radius:0 0 10px 10px;border:1px solid #e0e0e0">
    <h2 style="color:#0f172a;margin:0 0 16px;font-size:18px">🔧 New Job Assigned</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px">A new service job has been assigned to your garage.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr style="background:#f8fafc">
        <td style="padding:10px 14px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Job ID</td>
        <td style="padding:10px 14px;font-weight:700;font-size:13px;border-bottom:1px solid #f0f0f0">#${jobId}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Customer</td>
        <td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #f0f0f0">${customerName}</td>
      </tr>
      <tr style="background:#f8fafc">
        <td style="padding:10px 14px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Vehicle</td>
        <td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #f0f0f0">${vehicleLabel}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Service</td>
        <td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #f0f0f0">${serviceType}</td>
      </tr>
      <tr style="background:#f8fafc">
        <td style="padding:10px 14px;color:#888;font-size:13px">Scheduled</td>
        <td style="padding:10px 14px;font-size:13px">${scheduledDate}</td>
      </tr>
    </table>
    <div style="text-align:center;margin:24px 0">
      <a href="${process.env.FRONTEND_URL || 'https://garro.ae'}/garage-portal"
         style="background:#185FA5;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        View in Garage Portal
      </a>
    </div>
    <p style="font-size:11px;color:#aaa;text-align:center;margin:16px 0 0">
      Garro UAE | support@garro.ae | www.garro.ae
    </p>
  </div>
</div>`;

    console.log(`[notifyGarage] Notifying garage ${garage.name || garage.email} of job #${jobId}`);
    await Promise.allSettled([
      sendEmail(garage.email, `Garro — New Job #${jobId} Assigned | ${vehicleLabel}`, emailHtml),
      garage.phone ? sendWhatsApp(garage.phone, waMessage) : Promise.resolve()
    ]);
  } catch (err) {
    console.error('[notifyGarage] Failed:', err.message);
    // Never throw — notification failures must not break main flow
  }
};
