# 🎲 Random Points Game

Un semplice giochino da giocare con gli amici! Inserisci i nomi dei giocatori, imposta un totale di punti in palio, premi **Play** e i punti vengono assegnati a caso uno alla volta. La classifica si aggiorna live, con tanto di confetti, flash e suoni a ogni punto.

## Come si gioca

1. Apri il gioco su **https://binco97.github.io/random-points-game/** (oppure in locale, vedi sotto).
2. Aggiungi almeno 2 giocatori inserendo il nome e premendo **➕ Aggiungi**.
3. Imposta i **punti totali in palio** (default 100).
4. Premi **▶️ Play** per iniziare.
5. Ogni volta che scatta il timer, un giocatore a caso riceve un punto: il contatore "punti rimasti" scende di 1 e la classifica si aggiorna live con confetti, flash colorato e un ding sonoro (silenziabile con 🔊/🔇).
6. Il ritmo accelera avvicinandosi alla fine dei punti: si parte da 5s tra un punto e l'altro, poi **4s al 70%** dei punti rimasti, **3s al 40%** e **1s al 15%**.
7. Quando i punti finiscono la partita termina e viene incoronato il vincitore. Usa **⏸ Pausa** per fermare temporaneamente il gioco o **🔄 Nuova partita** per ricominciare da capo.

## Eseguire il progetto

Nessuna installazione richiesta: è HTML, CSS e JavaScript puri, senza dipendenze.

- **In locale**: apri direttamente il file `index.html` nel browser, oppure avvia un piccolo server (es. `python3 -m http.server`) e visita `http://localhost:8000`.
- **Online**: https://binco97.github.io/random-points-game/ — pubblicato automaticamente da GitHub Actions a ogni push su `main`.

## Struttura

- `index.html` — struttura della pagina
- `style.css` — stile grafico
- `script.js` — logica di gioco
