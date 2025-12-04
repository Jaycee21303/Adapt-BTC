import { sessionGuard, loadProgress, saveProgress } from './portal-auth.js';

function drawBaseCertificate(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f7fbff');
  gradient.addColorStop(1, '#e5f1ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1e88e5';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.strokeStyle = '#d0deef';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.fillStyle = '#1e88e5';
  ctx.font = 'bold 42px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('AdaptBTC Certificate', canvas.width / 2, 140);

  ctx.fillStyle = '#2d2d2d';
  ctx.font = '22px Inter';
  ctx.fillText('Awarded to', canvas.width / 2, 200);
}

async function initCertificate() {
  await sessionGuard('learning');
  const form = document.getElementById('certificate-form');
  const canvas = document.getElementById('certCanvas');
  const ctx = canvas.getContext('2d');
  const { username } = await fetch('/api/learning/session').then((r) => r.json());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = form.certType.value;
    const lesson = form.lesson.value;
    await renderCertificate(ctx, canvas, username, type, lesson);
    const progress = await loadProgress();
    progress.certificates = progress.certificates || [];
    progress.certificates.push({ type, lesson, date: new Date().toISOString() });
    await saveProgress(progress);
  });
}

async function renderCertificate(ctx, canvas, username, type, lesson) {
  drawBaseCertificate(ctx, canvas);
  ctx.fillStyle = '#1e88e5';
  ctx.font = 'bold 34px Inter';
  ctx.fillText(username, canvas.width / 2, 250);

  ctx.fillStyle = '#2d2d2d';
  ctx.font = '22px Inter';
  const label = type === 'course' ? 'Bitcoin Education Track'
    : type === 'lesson' ? `Lesson ${lesson}`
    : `Quiz ${lesson}`;
  ctx.fillText(label, canvas.width / 2, 290);
  ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, canvas.width / 2, 330);

  ctx.font = '18px Inter';
  const certID = Math.random().toString(36).substring(2, 10).toUpperCase();
  ctx.fillText(`Certificate ID: ${certID}`, canvas.width / 2, 370);

  // Divider lines
  ctx.strokeStyle = '#d0deef';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 390);
  ctx.lineTo(canvas.width - 120, 390);
  ctx.stroke();

  ctx.font = '16px Inter';
  ctx.fillStyle = '#555';
  ctx.fillText('Signed: AdaptBTC Learning', canvas.width / 2, 430);

  const link = document.createElement('a');
  link.download = `AdaptBTC-${type}-certificate.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

document.addEventListener('DOMContentLoaded', initCertificate);
