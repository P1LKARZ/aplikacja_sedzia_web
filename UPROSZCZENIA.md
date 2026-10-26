# Uproszczenie aplikacji

Zachowano ekrany logowania, formularz i listę meczów, statystyki, eksport PDF, odczyt QR i obsługę PIN-ów Garmin. Oryginalny ZIP pozostaje bez zmian.

## Zmiany

- Usunięto nieużywany komponent `DataBase.jsx`.
- Wspólne przygotowanie danych do PDF znajduje się w `src/utils/mapMeczToPdfData.js`, zamiast dwóch kopii tej samej logiki.
- Usunięto zapisywanie kopii PDF do IndexedDB: aplikacja nie miała funkcji odczytującej te kopie. Pobieranie PDF pozostaje. Istniejące kopie w przeglądarce nie są kasowane.
- Usunięto pusty callback generowania PDF i nieaktywną aktualizację historii nazw plików.
- Lista meczów wylicza filtrowane dane przez `useMemo`, zamiast utrzymywać drugi stan i aktualizować go w wielu handlerach.
- Wydzielono filtrowanie do `src/utils/filterMatches.js` i połączono powtarzające się filtry tekstowe.
- Domyślne filtry mają jedną definicję, używaną również przy resetowaniu.
- Formularz używa jednej funkcji obliczającej dzisiejszą datę; usunięto zbędny efekt inicjalizacji daty.
- Hook `MeczFormData` przemianowano na `useMeczFormData` zgodnie z konwencją React.
- Dwie funkcje opisujące zdarzenia QR zastąpiono wspólną tabelą typów zdarzeń.
- Uporządkowano formatowanie, usunięto dekoracyjne separatory, nieużywane importy i nieużywany prop `delegacja` w szczegółach formularza.
- Usunięto lokalne pliki Roboto, które nie były importowane ani deklarowane przez `@font-face`. Zachowano czcionkę Tinos wykorzystywaną w PDF.
- Usunięto bezpośrednie zależności `jspdf-autotable`, `web-vitals`, `tailwindcss`, `autoprefixer`, `postcss`, nieużywane bezpośrednio przez aplikację. Zależności wymagane przez narzędzia budowania pozostają w lockfile.

Kod JS/JSX aplikacji, bez pliku czcionki i nowych testów: 3980 → 3265 linii, czyli 715 linii mniej (około 18%). Część redukcji wynika z uporządkowania formatowania.

## Uruchomienie

```sh
npm ci
npm start
```

## Sprawdzenie

```sh
CI=true npm test -- --watchAll=false --runInBand
CI=true npm run build
```

Obie komendy zakończyły się pomyślnie. Dodano 5 testów filtrów: drużyny i tekst, daty i numer meczu, płatności i delegacja, starsze rekordy bez sezonu oraz sortowanie bez modyfikowania danych źródłowych. Dodatkowe porównanie 648 kombinacji filtrowania i sortowania z kodem z oryginalnego ZIP-a dało identyczne wyniki.

Nie wykonywano operacji na działającej bazie Firebase ani testów wymagających zalogowania. Nie weryfikowano interakcji z fizycznym zegarkiem ani pobrania PDF w przeglądarce. Kompilator zgłasza informację o dużym pakiecie JS oraz wieku danych Browserslist.

Archiwum zawiera źródła, konfigurację i istniejący folder `backup`. Pominięto `node_modules`, wynik kompilacji, historię Git, cache Firebase i metadane macOS. Pierwotne notatki w README.md zachowano; nie traktowano ich jako zlecenia dodawania funkcji.
