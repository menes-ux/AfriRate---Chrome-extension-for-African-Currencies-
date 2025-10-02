// Global state for exchange rates
let exchangeRates = {}; 

const convertButton = document.getElementById("convert-button");
const amountInput = document.getElementById("amount");
const fromCurrencyInput = document.getElementById("from-currency");
const toCurrencyInput = document.getElementById("to-currency");
const toCurrencyOutput = document.getElementById("result");
const apiKey = "245fcd4942bdd6b8c1441e09"; // Your API key

// Utility function for retries with exponential backoff (Crucial for API stability)
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // Throw error to trigger catch block for specific status codes
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (i < retries - 1) {
                // Wait for the calculated delay before retrying
                await new Promise(resolve => setTimeout(resolve, delay * (2 ** i)));
                console.warn(`Fetch attempt ${i + 1} failed, retrying...`);
            } else {
                // Last retry failed, throw the error
                throw error;
            }
        }
    }
}

// Function to fetch rates using the ExchangeRate-API
async function getExchangeRates() {
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    try {
        // Use the retry mechanism for fetching
        const response = await fetchWithRetry(apiUrl);
        const data = await response.json();
        
        // The fix: API rates are under 'conversion_rates'
        return data.conversion_rates; 
    } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        // Using a custom message box instead of alert() for better user experience
        toCurrencyOutput.value = "Error loading rates.";
        return null; // Return null on failure
    }
}

// Main setup function to initialize the app
async function setupConverter() {
    // Disable button and show a loading state
    convertButton.disabled = true; 
    convertButton.textContent = "Loading Rates...";

    exchangeRates = await getExchangeRates();
    
    if (exchangeRates) {
        console.log("Rates loaded successfully!");
        convertButton.disabled = false; // enable once ready
        convertButton.textContent = "Convert";
        // Convert automatically on load with default values
        convertCurrency(); 
    } else {
        convertButton.textContent = "Failed to Load";
    }
}

// Function to perform the currency conversion
function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencyInput.value;
    const toCurrency = toCurrencyInput.value; 

    // Error checking
    if (isNaN(amount) || amount <= 0) {
        toCurrencyOutput.value = "Enter a valid amount";
        return;
    }
    
    // Check if rates for selected currencies exist
    if (!exchangeRates || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
        toCurrencyOutput.value = "Rate data missing.";
        return;
    }
    
    // Conversion logic: Convert FROM currency to USD (using inverse rate), then USD to TO currency
    const fromRate = exchangeRates[fromCurrency]; // How many units of FROM currency per 1 USD
    const toRate = exchangeRates[toCurrency];     // How many units of TO currency per 1 USD
    
    // Formula: (Amount / FromRate) * ToRate
    const convertedAmount = (amount / fromRate) * toRate;

    toCurrencyOutput.value = convertedAmount.toFixed(2);
}

// Attach the event listener to the button
convertButton.addEventListener("click", convertCurrency);

// Also attach event listeners to inputs/selects for automatic updates
amountInput.addEventListener("input", convertCurrency);
fromCurrencyInput.addEventListener("change", convertCurrency);
toCurrencyInput.addEventListener("change", convertCurrency);


// Start the application setup
setupConverter();
