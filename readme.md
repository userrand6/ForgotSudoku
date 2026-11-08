# Unforgettable Games - Dementia Friendly Sudoku
Just a vibe coded page to play sudoku in the familiar style of sudoku.com, but without ads and without penalties for mistakes or forgetting something.

## Live Page
https://userrand6.github.io/ForgotSudoku/

## Versteckte URL-Einstellungen (Schwierigkeit noch leichter machen)
Über URL-Parameter lässt sich der Schwierigkeitsgrad **„Einfach“** (und proportional auch die anderen Stufen) dauerhaft noch leichter einstellen. Die Einstellung wird automatisch im Browser (`localStorage`) gespeichert, sodass sie auch bei Klick auf „Neues Spiel“ oder beim späteren Öffnen erhalten bleibt:

- **Stufe 1 – Leichter (56 vorgegebene Zahlen, nur Naked Singles):**
  `https://userrand6.github.io/ForgotSudoku/?easy=1` (oder `?leicht=1`)
- **Stufe 2 – Sehr leicht (63 vorgegebene Zahlen, nur 18 freie Felder):**
  `https://userrand6.github.io/ForgotSudoku/?easy=2` (oder `?leicht=2`)
- **Stufe 3 – Ultra leicht (70 vorgegebene Zahlen, nur 11 freie Felder):**
  `https://userrand6.github.io/ForgotSudoku/?easy=3` (oder `?leicht=3`)
- **Exakte Anzahl vorgegebener Zahlen festlegen (35 bis 78):**
  `https://userrand6.github.io/ForgotSudoku/?clues=60` (oder `?easy=60` / `?zahlen=60`)
- **Auf Standard zurücksetzen (47 vorgegebene Zahlen):**
  `https://userrand6.github.io/ForgotSudoku/?reset=1` (oder `?easy=0`)
- **Gewinn-Bildschirm direkt testen / anzeigen:**
  `https://userrand6.github.io/ForgotSudoku/?win=1` (oder `?testwin=1`)
