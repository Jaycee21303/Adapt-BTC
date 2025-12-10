const donationAddress = 'bc1qadaptbtc4community9support4m4j4l3fxkh8y3h';
const lnurl = 'LNURL1DP68GURN8GHJ7MRWW4EXCTNRDAKJ7MRWW4EXCTNRWQHHXAP0WAHXUE';

const generateInvoice = amount => {
  const nonce = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `lnbc${amount || '100000'}0n1p${nonce}ppadaptbtcsupport`;
};

const renderDonationUI = () => {
  const qrCanvas = document.getElementById('donation-qr');
  if (qrCanvas && window.QRious) {
    new QRious({ element: qrCanvas, value: donationAddress, size: 200 });
  }

  const addressEl = document.getElementById('donation-address');
  if (addressEl) addressEl.textContent = donationAddress;

  const lnurlEl = document.getElementById('lnurl-display');
  if (lnurlEl) lnurlEl.textContent = lnurl;

  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.dataset.copy);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = original), 1200);
      } catch (err) {
        console.error('Copy failed', err);
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
};

document.addEventListener('DOMContentLoaded', renderDonationUI);
