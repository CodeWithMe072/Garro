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
  picked_up: (name) => `Hi ${name}, your vehicle has been picked up and is on the way to the garage.`,
  in_garage: (name) => `Hi ${name}, your vehicle has arrived at the garage. Inspection will begin shortly.`,
  inspection_done: (name) => `Hi ${name}, vehicle inspection is complete. Repair work is about to begin.`,
  repair_in_progress: (name) => `Hi ${name}, your vehicle is being repaired. We will notify you when work is complete.`,
  work_complete: (name) => `Hi ${name}, all repair work is complete! Your vehicle is being prepared for delivery.`,
  ready_for_delivery: (name) => `Hi ${name}, your vehicle is ready for delivery. Our helper will bring it to you shortly.`,
  delivered: (name) => `Hi ${name}, your vehicle has been delivered! Please check and confirm everything is good.`,
  closed: (name, total) => `Hi ${name}, your invoice of AED ${total} is ready. Thank you for choosing Garro!`
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
    case 'closed': message = msgFn(customer.name, data.total); break;
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

  // Fire both in parallel — failure of one does not block the other
  const results = await Promise.allSettled([
    sendEmail(customer.email, subject, html),
    sendWhatsApp(customer.phone, message)
  ]);

  const emailResult = results[0].status === 'fulfilled' ? 'Success/Demo' : `Failed: ${results[0].reason}`;
  const waResult = results[1].status === 'fulfilled' ? 'Success/Demo' : `Failed: ${results[1].reason}`;
  console.log(`[Notification Results] Email status: ${emailResult} | WhatsApp status: ${waResult}`);
};
