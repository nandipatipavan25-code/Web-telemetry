const fs = require('fs');
const code = fs.readFileSync('gawebtelemetry_bundle.js', 'utf8');

const storageMatches = code.match(/localStorage\.(getItem|setItem)\(['"][^'"]+['"]/g);
console.log('localStorage keys:', [...new Set(storageMatches)]);

// Find initial state or default website objects
const defaultSiteMatch = code.match(/\[\{[^\]]*url:[^\]]*\}\]/);
if (defaultSiteMatch) {
  console.log('Matched default sites array:', defaultSiteMatch[0].slice(0, 500));
}

// Let's search for "websites" state initialization in web_tele_frontend-main
