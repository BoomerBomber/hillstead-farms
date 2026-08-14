# Hillstead Farms — hillsteadfarms website

Static site for Hillstead Farms, a family farm in Cottontown, Tennessee.
No build step — plain HTML/CSS/JS. Open `index.html` or deploy the folder as-is.

Weekly stock shown on the Farm Stand section comes from `inventory.json` —
see [INVENTORY-HOWTO.md](INVENTORY-HOWTO.md) for the 60-second phone routine.
(The fetch needs http(s); opening index.html straight from disk shows the site
without badges, which is also exactly what happens if the JSON ever breaks.)
