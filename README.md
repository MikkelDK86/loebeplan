# Mikkels Løbeplan – PWA v1

En enkel PWA til at have med på løbebåndet.

## Funktioner
- Uge 1–4 program
- Automatisk intervaltimer
- Løb/gang-skift med lyd
- Pause/fortsæt
- Gennemførte pas gemmes lokalt
- Enkel statistik
- Offline-cache efter første indlæsning

## Kør lokalt på Windows
PWA-service workers virker ikke fra `file://`. Start derfor en lille lokal webserver i denne mappe.

Hvis Python er installeret:
`python -m http.server 8000`

Åbn derefter:
`http://localhost:8000`

## På iPhone
For rigtig PWA-installation skal siden ligge på HTTPS (eller være localhost under udvikling).
Åbn siden i Safari → Del → Føj til hjemmeskærm.

Dette er v1. Programmet er bevidst simpelt, så vi kan revidere UI, intervaller og funktioner ud fra din brug på løbebåndet.
