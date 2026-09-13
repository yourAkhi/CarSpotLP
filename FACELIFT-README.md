# CarSpot - Facelift

Die Startseite basiert wieder auf dem originalen Auftritt von carspot.gg: dunkler Hintergrund, Blau-Mint-Akzente, Original-Logo, Claim, App-Screenshot, Downloads und Kontakt.

## Gestaltung

- Ruhigere Hintergrundfarben, feinere Rahmen und einheitliche Typografie.
- Desktop: Text und Downloads neben dem Original-Screenshot. Mobil: Text, Screenshot und Downloads untereinander.
- Gemeinsame Gestaltung von Startseite, Releases und Rechtstexten durch facelift.css.
- Android-Download und bestehende iOS-Installationsanleitung bleiben erhalten. iOS ist als Web-App gekennzeichnet.
- Normales Seitenscrolling, Tastatur-Fokusmarkierungen und reduzierte Bewegung werden unterstuetzt.

## Vorschau

index.html im Browser oeffnen oder `python -m http.server 8080 --bind 127.0.0.1` starten und http://127.0.0.1:8080 aufrufen. Keine Installation und kein Build erforderlich. Die statische Vercel-Struktur bleibt erhalten.

Der vorherige Entwurf in premium.css und premium.js ist nicht mehr eingebunden. Bestehende Basisstile und Dialogskripte werden weiterverwendet.

## Validierung

Lokale Ressourcen, Sprungmarken, eindeutige HTML-IDs und JavaScript-Syntax geprueft. Keine visuelle Browserpruefung durchgefuehrt. Nicht veroeffentlicht.

Die Navigation besteht aus rechtsbuendig angeordneten Links zu Releases und Kontakt. Es gibt kein Seitenmenue. Die Features-Seite wurde entfernt. Der Hintergrund kombiniert die urspruengliche dunkelblaue Farbwelt mit einem groesseren weissen Verlauf hinter der App.
