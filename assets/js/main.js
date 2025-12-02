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
