/* ========================================================
   BITCOIN PRICE TICKER (15-SECOND REFRESH)
   Using CoinGecko (Reliable, No CORS Issues)
======================================================== */

async function fetchBTCPrice() {
    try {
        const res = await fetch(
            "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
        );

        const data = await res.json();

        const price = data.market_data.current_price.usd;
        const change24 = data.market_data.price_change_percentage_24h;

        const priceElement = document.getElementById("btc-price");
        const arrowElement = document.getElementById("btc-arrow");
        const changeElement = document.getElementById("btc-change");

        if (!priceElement) return;

        // Previous price for arrow direction
        let last = parseFloat(priceElement.getAttribute("data-last")) || price;
        priceElement.setAttribute("data-last", price);

        // Update price text
        priceElement.textContent = `$${price.toLocaleString()}`;

        // Arrow logic
        if (price > last) {
            arrowElement.textContent = "↑";
            arrowElement.style.color = "green";
        } else if (price < last) {
            arrowElement.textContent = "↓";
            arrowElement.style.color = "red";
        } else {
            arrowElement.textContent = "→";
            arrowElement.style.color = "#777";
        }

        // 24H % CHANGE
        const formattedChange = change24.toFixed(2);
        changeElement.textContent = `${formattedChange}%`;

        changeElement.style.color = change24 >= 0 ? "green" : "red";

    } catch (error) {
        console.log("BTC price fetch error:", error);
    }
}

// Update every 15 seconds
fetchBTCPrice();
setInterval(fetchBTCPrice, 15000);



/* ========================================================
   DCA CALCULATOR
======================================================== */

function calculateDCA() {
    const amount = parseFloat(document.getElementById("dca-amount").value);
    const frequency = document.getElementById("dca-frequency").value;
    const months = parseFloat(document.getElementById("dca-months").value);
    const currentPrice = parseFloat(document.getElementById("current-btc-price").value);

    if (!amount || !months || !currentPrice) {
        alert("Please complete all DCA fields.");
        return;
    }

    let periods = months;
    if (frequency === "weekly") {
        periods = months * 4.345; // approx weeks per month
    }

    const totalInvested = amount * periods;
    const btcAccumulated = totalInvested / currentPrice;

    document.getElementById("dca-invested").textContent =
        `Total Invested: $${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

    document.getElementById("dca-btc").textContent =
        `Total BTC Accumulated: ${btcAccumulated.toFixed(6)} BTC`;
}


/* ========================================================
   LIGHTNING VS CARD SAVINGS
======================================================== */

function calculateLightningSavings() {
    const volumeInput = document.getElementById("monthly-volume");
    const cardFeeInput = document.getElementById("card-fee");
    const lightningFeeInput = document.getElementById("lightning-fee");
    const hardwareCostInput = document.getElementById("hardware-cost");

    if (!volumeInput || !cardFeeInput || !lightningFeeInput || !hardwareCostInput) return;

    const volume = parseFloat(volumeInput.value);
    const cardFee = parseFloat(cardFeeInput.value);
    const lightningFee = parseFloat(lightningFeeInput.value);
    const hardwareCost = parseFloat(hardwareCostInput.value) || 0;

    if (!volume || !cardFee || !lightningFee) {
        alert("Enter your volume and fee assumptions to model savings.");
        return;
    }

    const cardCost = volume * (cardFee / 100);
    const lightningCost = volume * (lightningFee / 100);
    const savings = cardCost - lightningCost;

    document.getElementById("card-cost").textContent = `$${cardCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    document.getElementById("lightning-cost").textContent = `$${lightningCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    let paybackText = "No hardware spend";
    let noteText = savings >= 0 ? `Saves ~$${savings.toLocaleString(undefined, { maximumFractionDigits: 0 })} per month.` : "Lightning costs exceed card fees with these inputs.";

    if (hardwareCost > 0 && savings > 0) {
        const monthsToPayback = hardwareCost / savings;
        paybackText = `${monthsToPayback.toFixed(1)} months`;
    } else if (hardwareCost > 0 && savings <= 0) {
        paybackText = "Revisit your fee assumptions";
    }

    document.getElementById("payback").textContent = paybackText;
    document.getElementById("savings-note").textContent = noteText;
}


/* ========================================================
   STRIKE INTEGRATION CHECKLIST
======================================================== */

function buildStrikePlan() {
    const planContainer = document.getElementById("strike-plan");
    if (!planContainer) return;

    const businessType = document.getElementById("business-type").value;
    const payout = document.getElementById("payout-cadence").value;
    const split = document.getElementById("settlement-split").value;

    const playbooks = {
        cafe: [
            "Map your busiest hours and set a fallback QR flow for offline moments.",
            "Label staff devices with daily spending limits and auto-lock timers.",
            "Print a single-page laminated SOP for opening/closing the node or POS app."
        ],
        ecommerce: [
            "Add Lightning buttons next to Apple/Google Pay to test conversion uplifts.",
            "Enable webhooks for order status and store invoice IDs in your ERP/CRM.",
            "Spin up a staging store to test refunds and partial shipments." 
        ],
        services: [
            "Issue time-bound Lightning invoices for deposits and milestones.",
            "Offer auto-convert to USD for retainers with a clear FX policy.",
            "Use memos to attach client/project codes for reconciliation." 
        ],
        nonprofit: [
            "Display a static donation QR with on-chain fallback for large gifts.",
            "Publish a transparency page showing BTC held vs converted.",
            "Whitelist hardware wallets for board-level cold storage signers." 
        ]
    };

    const payoutNotes = {
        daily: "Daily payouts keep working capital flexible but create more ledger entries—sync with your accounting tool.",
        weekly: "Weekly payouts balance fiat liquidity with fewer bank transactions.",
        monthly: "Monthly payouts maximize BTC exposure; set thresholds for manual conversions during volatility." 
    };

    const custodyNote = parseInt(split, 10) > 0
        ? `Hold ${split}% in BTC with documented signer roles and a quarterly key check.`
        : "Convert 100% to fiat and audit settlement bank accounts monthly.";

    const tacticalList = playbooks[businessType] || [];

    planContainer.innerHTML = `
        <div class="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p class="text-sm font-semibold text-slate-800">Deployment steps</p>
            <ul class="list-disc list-inside space-y-2 mt-2 text-gray-800">
                ${tacticalList.map(item => `<li>${item}</li>`).join("")}
            </ul>
        </div>
        <div class="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
            <p class="text-sm font-semibold text-indigo-800">Settlement policy</p>
            <ul class="list-disc list-inside space-y-2 mt-2 text-gray-800">
                <li>${payoutNotes[payout]}</li>
                <li>${custodyNote}</li>
                <li>Run a test payout and a test refund before going live.</li>
            </ul>
        </div>
    `;
}


/* ========================================================
   CUSTODY RUNBOOK GENERATOR
======================================================== */

function generateCustodyRunbook() {
    const output = document.getElementById("runbook-output");
    if (!output) return;

    const steps = [
        "Verify latest firmware on all hardware wallets and document serial numbers.",
        "Rotate spending wallet passphrases and ensure backups are in sealed envelopes.",
        "Practice restoring from seed in a clean room device, then wipe it." 
    ];

    if (document.getElementById("multisig").checked) {
        steps.push("Simulate a 2-of-3 (or your quorum) signing with one key offline.");
    }

    if (document.getElementById("travel").checked) {
        steps.push("Create a travel wallet with capped limits and emergency contact tree.");
    }

    if (document.getElementById("incident").checked) {
        steps.push("Run a phishing drill: report, revoke, and re-issue compromised device keys.");
    }

    if (document.getElementById("comms").checked) {
        steps.push("Send an all-hands mock incident update to rehearse finance/legal messaging.");
    }

    output.innerHTML = `
        <div class="p-4 rounded-lg bg-white border border-gray-200">
            <p class="font-semibold text-gray-900">Next tabletop exercise</p>
            <ol class="list-decimal list-inside space-y-2 mt-2 text-gray-800">
                ${steps.map(step => `<li>${step}</li>`).join("")}
            </ol>
        </div>
    `;
}


/* ========================================================
   BITCOIN HALVING COUNTDOWN (Next Halving April 2028)
======================================================== */

function updateHalvingCountdown() {
    const halvingDate = new Date("2028-04-12T00:00:00Z");
    const now = new Date();
    const diff = halvingDate - now;

    if (diff <= 0) {
        document.getElementById("halving-countdown").textContent = "The Halving Has Arrived!";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("halving-countdown").textContent =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateHalvingCountdown, 1000);
updateHalvingCountdown();
