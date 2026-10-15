# 🎾 Pádel Online

Juego de pádel 1 vs 1 en tiempo real (móvil y PC). Modo online con código/QR y modo solo contra bot.
No necesita Claude ni cuenta de nadie: solo un servidor Node.js.

## Probar en tu PC / wifi
    npm install
    npm start
Abre http://localhost:3000. Para jugar desde el móvil en la misma wifi, abre http://IP-DE-TU-PC:3000
(el QR usa la dirección desde la que abras la página).

## Publicarlo en internet (gratis)
1. Sube esta carpeta a un repositorio de GitHub.
2. En Render.com (o Railway / Fly.io): New → Web Service → elige el repo.
   - Build: `npm install`   Start: `npm start`
3. Te dará una URL https. Ábrela, pulsa "Crear partida" y comparte el QR.

Los WebSockets funcionan en esas plataformas sin configuración extra.
