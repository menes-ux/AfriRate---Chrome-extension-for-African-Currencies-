// Global variables
const API_KEY = "245fcd4942bdd6b8c1441e09"; // Your API Key
const CACHE_KEY = "afrorate_data";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

// Select DOM elements
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from-currency");
const toSelect = document.getElementById("to-currency");
const resultInput = document.getElementById("result");
const swapBtn = document.getElementById("swap-button");
const statusText = document.getElementById("status-text");

// Store rates here
let rates = {};

// --- 1. STARTUP FUNCTION ---
async function init() {
    console.log("AfroRate starting...");
    updateStatus("Loading rates...");

    // A. Check Storage (Hybrid: Works on Localhost & Extension)
    const cachedData = await getSmartStorage();
    
    if (cachedData) {
        rates = cachedData.rates;
        console.log("Loaded from cache.");
        
        // Convert immediately with cached data
        convert();
        
        // If cache is fresh (less than 24h), we stop here.
        if (isFresh(cachedData.timestamp)) {
            updateStatus("Ready (Offline Mode)");
            return; 
        }
    }

    // B. Fetch New Data (Online Mode)
    console.log("Fetching new rates from API...");
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
        const data = await response.json();

        if (data.result === "success") {
            rates = data.conversion_rates;
            
            // Save to storage (Hybrid)
            saveSmartStorage(rates);
            
            console.log("New rates fetched and saved.");
            updateStatus("Rates updated just now");
            
            // Convert again with new data
            convert();
        } else {
            throw new Error("API Error: " + data["error-type"]);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        if (Object.keys(rates).length > 0) {
            updateStatus("Offline Mode (Old Rates)");
        } else {
            updateStatus("Error: Check Internet");
            resultInput.value = "Error";
        }
    }
}

// --- 2. CONVERSION LOGIC ---
function convert() {
    // 1. Get values
    let amount = parseFloat(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;

    // 2. Safety Checks
    if (isNaN(amount)) {
        resultInput.value = ""; 
        return;
    }

    if (!rates[from] || !rates[to]) {
        return;
    }

    // 3. The Math
    const baseAmount = amount / rates[from];
    const finalAmount = baseAmount * rates[to];

    // 4. Update Result
    resultInput.value = finalAmount.toFixed(2);
}

// --- 3. SWAP BUTTON LOGIC ---
if (swapBtn) {
    swapBtn.addEventListener("click", () => {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;

        // Animation
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

// --- 4. HYBRID STORAGE HELPERS (The Magic Part) ---

// Get data (Checks Chrome Storage first, then LocalStorage)
function getSmartStorage() {
    return new Promise((resolve) => {
        // 1. Try Chrome Extension Storage
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get([CACHE_KEY], (result) => {
                resolve(result[CACHE_KEY] || null);
            });
        } 
        // 2. Fallback to Localhost Storage
        else if (window.localStorage) {
            const json = window.localStorage.getItem(CACHE_KEY);
            resolve(json ? JSON.parse(json) : null);
        } else {
            resolve(null);
        }
    });
}

// Save data (Saves to both if possible, covers all bases)
function saveSmartStorage(ratesData) {
    const data = {
        rates: ratesData,
        timestamp: Date.now()
    };

    // 1. Save to Chrome Extension Storage
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [CACHE_KEY]: data });
    }
    
    // 2. Save to Localhost Storage
    if (window.localStorage) {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    }
}

// Check if data is less than 24 hours old
function isFresh(timestamp) {
    return (Date.now() - timestamp) < CACHE_DURATION;
}

// Helper to update status text safely
function updateStatus(text) {
    if (statusText) statusText.innerText = text;
}

// --- 5. EVENT LISTENERS ---
if (amountInput) amountInput.addEventListener("input", convert);
if (fromSelect) fromSelect.addEventListener("change", convert);
if (toSelect) toSelect.addEventListener("change", convert);

// Start the app
init();