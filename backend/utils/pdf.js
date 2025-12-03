const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const logger = require('../services/logger');

const STORAGE_DIR = path.join(__dirname, '..', 'storage', 'certificates');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const generateCertificate = async ({ userName, courseName }) => {
  const verificationCode = uuidv4();
  const fileName = `${verificationCode}.pdf`;
  const filePath = path.join(STORAGE_DIR, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc
      .fontSize(24)
      .fillColor('#111')
      .text('AdaptBTC Certificate of Completion', { align: 'center' })
      .moveDown(2);

    doc.fontSize(16).text(`This certificate is proudly presented to`, { align: 'center' }).moveDown(0.5);
    doc.fontSize(20).fillColor('#0a84ff').text(userName, { align: 'center', underline: true }).moveDown(1.5);

    doc
      .fontSize(16)
      .fillColor('#111')
      .text(`for successfully completing the course`, { align: 'center' })
      .moveDown(0.5);

    doc.fontSize(18).fillColor('#0a84ff').text(courseName, { align: 'center' }).moveDown(1.5);

    const issuedAt = new Date();
    doc
      .fontSize(12)
      .fillColor('#555')
      .text(`Issued on: ${issuedAt.toDateString()}`, { align: 'center' })
      .moveDown(0.25);
    doc
      .text(`Verification ID: ${verificationCode}`, { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(10)
      .fillColor('#777')
      .text('Verify this certificate at AdaptBTC using the verification ID above.', { align: 'center' });

    doc.end();

    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  }).catch((err) => {
    logger.error('Failed generating certificate PDF', err);
    throw err;
  });

  return { verificationCode, filePath, fileName };
};

module.exports = { generateCertificate, STORAGE_DIR };
