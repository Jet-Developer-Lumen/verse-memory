# Verse Memory V1

A small local-first Scripture memorization PWA designed as a future free resource from LumenStance.

## Included
- Add your own verse or passage and translation
- Learn mode
- Phrase Builder
- Hide Words (25%, 50%, 75%)
- First Letters
- Test Me with approximate word-by-word scoring
- Again / Almost / Got It review scheduling
- Local browser storage
- JSON backup and restore
- Offline service worker
- Installable PWA manifest
- Starter passage: James 1:21 WEBU

## Important
The starter James 1:21 text should be verified against the exact WEBU wording Janette wants before public distribution.

## Local testing
Serve this folder through a local web server. Service workers do not work reliably by opening index.html directly as a file.
Example:
python -m http.server 8080

Then visit http://localhost:8080

## iPad installation
For a real iPad installation, deploy the folder over HTTPS, open it in Safari, then use Share > Add to Home Screen.
