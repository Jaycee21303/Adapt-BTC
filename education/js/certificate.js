
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name');
    const downloadBtn = document.getElementById('download-certificate');

    if (!nameInput || !downloadBtn) return;

    downloadBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const learnerName = (nameInput.value || '').trim() || 'AdaptBTC Learner';
        const completionDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

        const certificateMarkup = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>AdaptBTC Certificate</title>
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; background: #F5F7FF; padding: 40px; }
                    .certificate { max-width: 800px; margin: 0 auto; padding: 40px; background: #fff; border: 2px solid #1C6AEF; border-radius: 16px; box-shadow: 0 10px 24px rgba(0,0,0,0.08); }
                    h1 { color: #1C6AEF; }
                    .name { font-size: 28px; font-weight: 800; margin: 20px 0; }
                    .meta { color: #444; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <h1>AdaptBTC Bitcoin 101 Certificate</h1>
                    <p>This certifies that</p>
                    <div class="name">${learnerName}</div>
                    <p>completed the Bitcoin 101 course and final quiz.</p>
                    <p class="meta">Date: ${completionDate}</p>
                </div>
            </body>
            </html>`;

        const certificateWindow = window.open('', '_blank');
        if (!certificateWindow) return;
        certificateWindow.document.open();
        certificateWindow.document.write(certificateMarkup);
        certificateWindow.document.close();
        certificateWindow.focus();
        certificateWindow.print();
    });
});
