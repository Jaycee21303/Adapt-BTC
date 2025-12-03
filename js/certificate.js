import jsPDFModule from './jspdf.umd.min.js';
const { jsPDF } = jsPDFModule;

export function initCertificate(formSelector, courseTitle) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('input[name="name"]').value.trim();
        if (!name) return alert('Enter your name to generate the certificate.');

        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const date = new Date().toLocaleDateString();
        const certId = `ADAPT-${Date.now().toString().slice(-8)}`;

        doc.setFillColor(15, 22, 45);
        doc.rect(0, 0, 842, 595, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.text('AdaptBTC Certification', 80, 90);

        doc.setFontSize(16);
        doc.setTextColor(160, 190, 230);
        doc.text('This certifies that', 80, 150);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.text(name, 80, 190);

        doc.setFontSize(18);
        doc.setTextColor(160, 190, 230);
        doc.text(`has successfully completed ${courseTitle}`, 80, 230);

        doc.setTextColor(200, 220, 255);
        doc.setFontSize(14);
        doc.text(`Date: ${date}`, 80, 270);
        doc.text(`Certificate ID: ${certId}`, 80, 295);

        doc.setTextColor(120, 170, 230);
        doc.setFontSize(12);
        doc.text('AdaptBTC empowers professionals with Bitcoin-native tools and education.', 80, 340);

        doc.setDrawColor(31, 140, 235);
        doc.setLineWidth(3);
        doc.line(80, 360, 340, 360);
        doc.text('Authorized Instructor', 80, 380);

        doc.save(`${courseTitle}-certificate.pdf`);
    });
}
