// ------- QR CODE ---------

const btcAddress = "bc1qruzxu9vdh7wlh5hnzsufcw8rxt9k6eamel6wmw";

new QRious({
  element: document.getElementById("btcQR"),
  value: btcAddress,
  size: 220
});

function copyAddress() {
  navigator.clipboard.writeText(btcAddress);
  alert("BTC address copied!");
}


// ------- LIVE PAYMENT TRACKING ---------

async function checkMempool() {
  try {
    const res = await fetch(`https://mempool.space/api/address/${btcAddress}`);
    const data = await res.json();

    const statusElement = document.getElementById("status");
    const confirmationsElement = document.getElementById("confirmations");

    const txs = data.chain.concat(data.mempool).reverse();

    if (txs.length === 0) {
      statusElement.textContent = "No incoming transactions detected yet…";
      return;
    }

    const latest = txs[0];

    if (latest.status.confirmed) {
      statusElement.textContent = "Transaction Confirmed ✔";
      confirmationsElement.textContent = `${latest.status.confirmations} confirmations`;
    } else {
      statusElement.textContent = "Payment Detected! Waiting for confirmations…";
      confirmationsElement.textContent = `${latest.status.confirmations || 0} / 3 confirmations`;
    }

  } catch (err) {
    console.error(err);
  }
}

// Poll every 10 seconds
setInterval(checkMempool, 10000);
checkMempool();
