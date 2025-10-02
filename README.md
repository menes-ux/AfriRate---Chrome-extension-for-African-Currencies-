# AfroRate - African Currency Converter

AfroRate is a lightweight Chrome extension that allows users to convert African currencies into international currencies using real-time exchange rates. It is designed to be fast, simple, and reliable for travelers, business owners, and anyone dealing with African currencies.

---

## Features
- Convert African currencies into USD, EUR, GBP, and more.
- Fetches live exchange rates from a trusted API.
- Clean, ad-free interface focused on usability.
- No personal data collection or tracking.

---

## Installation

1. Clone or download this repository.
2. Open **Google Chrome** and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the project folder.
5. The extension will appear in your toolbar.

---

## Permissions

AfroRate requires access to:

- **`https://v6.exchangerate-api.com/*`**  
  This permission is used solely to fetch exchange rate data.  
  No executable code is loaded from this domain.

---

## Privacy

- AfroRate does not collect, store, or share any personal information.
- All data requests are limited to currency exchange rates from the API.

---

## Project Structure

afrorate-extension/
│── manifest.json
│── popup.html
│── popup.js
│── popup.css
│── icons/
│ ├── icon16.png
│ ├── icon48.png
│ └── icon128.png
│── README.md


---

## Roadmap

- Add support for more African currencies.
- Allow users to set default currencies in options.
- Improve UI/UX with responsive design.

---

## License

This project is licensed under the MIT License.  
You are free to use, modify, and distribute this project with attribution.
