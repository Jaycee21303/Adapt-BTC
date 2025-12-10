import { copyTextFromElement } from '../utils/copy.js';

const donationAddress = 'bc1qadaptbtc4community9support4m4j4l3fxkh8y3h';
const lnurl = 'LNURL1DP68GURN8GHJ7MRWW4EXCTNRDAKJ7MRWW4EXCTNRWQHHXAP0WAHXUE';

function generateInvoice(amount) {
  const nonce = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `lnbc${amount || '100000'}0n1p${nonce}ppadaptbtcsupport`;
}

function renderDonationUI() {
  const qrCanvas = document.getElementById('donation-qr');
  if (qrCanvas && window.QRious) {
    new QRious({ element: qrCanvas, value: donationAddress, size: 200 });
  }
  const addressEl = document.getElementById('donation-address');
  if (addressEl) addressEl.textContent = donationAddress;
  const lnurlEl = document.getElementById('lnurl-display');
  if (lnurlEl) lnurlEl.textContent = lnurl;

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = btn.getAttribute('data-copy');
      const success = await copyTextFromElement(target);
      if (success) {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = original), 1200);
      }
    });
  });

  const invoiceBtn = document.getElementById('generate-invoice');
  const invoiceField = document.getElementById('invoice-field');
  const invoiceAmount = document.getElementById('invoice-amount');
  if (invoiceBtn && invoiceField) {
    invoiceBtn.addEventListener('click', () => {
      const sats = invoiceAmount?.value || '1000';
      const invoice = generateInvoice(sats);
      invoiceField.textContent = invoice;
    });
  }
}

document.addEventListener('DOMContentLoaded', renderDonationUI);
