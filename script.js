// Global variables
const API_KEY = "245fcd4942bdd6b8c1441e09"; 
const CACHE_KEY = "afrorate_data";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

// DOM Elements
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from-currency");
const toSelect = document.getElementById("to-currency");
const resultInput = document.getElementById("result");
const swapBtn = document.getElementById("swap-button");
const statusText = document.getElementById("status-text");

// Store rates
let rates = {};

// --- 1. STARTUP FUNCTION ---
async function init() {
    updateStatus("Connecting...");

    // A. Check Local Storage
    const cachedData = await getSmartStorage();
    
    // If we have data, use it immediately
    if (cachedData) {
        rates = cachedData.rates;
        convert(); 
        
        // CHECK: Is data fresh? (Less than 24h old)
        if (isFresh(cachedData.timestamp)) {
            // It is fresh, so we show the specific time it was updated
            showTimeStatus(cachedData.timestamp);
            return; 
        }
    }

    // B. If data is old/missing, check internet
    if (navigator.onLine === false) {
        updateStatus("⚠️ Offline Mode (Rates may be old)");
        return;
    }

    // C. Fetch New Data
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
        const data = await response.json();

        if (data.result === "success") {
            rates = data.conversion_rates;
            saveSmartStorage(rates);
            convert();
            updateStatus("Last updated: Just now");
        } else {
            throw new Error("API Error");
        }
    } catch (error) {
        if (Object.keys(rates).length > 0) {
            updateStatus("⚠️ Offline Mode (Using saved rates)");
        } else {
            resultInput.value = "---";
            updateStatus("Connection Error");
        }
    }
}

// --- 2. HELPER: SMART TIME TEXT ---
function showTimeStatus(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if the date is today
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    const timeString = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    if (isToday) {
        updateStatus(`Last updated: Today, ${timeString}`);
    } else {
        updateStatus(`Last updated: Yesterday, ${timeString}`);
    }
}

// --- 3. CONVERSION LOGIC ---
function convert() {
    let amount = parseFloat(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;

    if (isNaN(amount)) {
        resultInput.value = ""; 
        return;
    }

    if (!rates || !rates[from] || !rates[to]) return;

    const baseAmount = amount / rates[from];
    const finalAmount = baseAmount * rates[to];

    resultInput.value = finalAmount.toFixed(2);
}

// --- 4. SWAP BUTTON ---
if (swapBtn) {
    swapBtn.addEventListener("click", () => {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;

        const icon = swapBtn.querySelector("svg");
        if(icon) {
            icon.style.transition = "transform 0.5s ease"; 
            icon.style.transform = "rotate(360deg)";
            setTimeout(() => {
                icon.style.transition = "none";
                icon.style.transform = "rotate(0deg)";
            }, 500);
        }
        convert();
    });
}

// --- 5. STORAGE HELPERS ---
function getSmartStorage() {
    return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get([CACHE_KEY], (result) => {
                resolve(result[CACHE_KEY] || null);
            });
        } else if (window.localStorage) {
            try {
                const json = window.localStorage.getItem(CACHE_KEY);
                resolve(json ? JSON.parse(json) : null);
            } catch (e) {
                window.localStorage.removeItem(CACHE_KEY);
                resolve(null);
            }
        } else {
            resolve(null);
        }
    });
}

function saveSmartStorage(ratesData) {
    const data = { rates: ratesData, timestamp: Date.now() };
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [CACHE_KEY]: data });
    }
    if (window.localStorage) {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    }
}

function isFresh(timestamp) {
    return (Date.now() - timestamp) < CACHE_DURATION;
}

function updateStatus(text) {
    if (statusText) statusText.innerText = text;
}

// --- 6. LISTENERS ---
if (amountInput) amountInput.addEventListener("input", convert);
if (fromSelect) fromSelect.addEventListener("change", convert);
if (toSelect) toSelect.addEventListener("change", convert);

init();