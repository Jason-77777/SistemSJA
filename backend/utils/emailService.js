const sgMail = require('@sendgrid/mail');
const { generateInvoiceHTML } = require('./invoiceTemplate');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendSuccessEmail = async (pendaftaran) => {
  console.log('[EMAIL_DEBUG] Mencoba mengirim email...');
  console.log(`[EMAIL_DEBUG] Sender Email dari .env: ${process.env.SENDER_EMAIL}`);

  if (!pendaftaran || !pendaftaran.customerId || !pendaftaran.paketId || !pendaftaran.instrukturId) {
    console.error('[EMAIL_ERROR] Data pendaftaran tidak lengkap. Email tidak dikirim.');
    return;
  }

  const customer = pendaftaran.customerId;
  const emailHTML = generateInvoiceHTML(pendaftaran);

  const msg = {
    to: customer.email,
    from: 'sjadrivinglesson@gmail.com',
    subject: `Invoice Lunas - Pendaftaran Kursus di CV. Sumatera Jaya Abadi`,
    html: emailHTML,
  };

  console.log(`[EMAIL_DEBUG] Objek email yang akan dikirim:`, JSON.stringify(msg, null, 2));

  try {
    await sgMail.send(msg);
    console.log(`[EMAIL_SUCCESS] Email berhasil dikirim ke ${customer.email} melalui SendGrid.`);
  } catch (error) {
    console.error('--- SENDGRID ERROR START ---');
    console.error(`[EMAIL_FATAL] Gagal mengirim email ke ${customer.email}.`);
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}`);
    if (error.response) {
      console.error('Full SendGrid Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    console.error('--- SENDGRID ERROR END ---');
  }
};

module.exports = { sendSuccessEmail };