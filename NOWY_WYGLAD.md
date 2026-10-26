# Po gwizdku — nowy wygląd i struktura

Propozycja została wdrożona w kodzie aplikacji. Jasne tło, ciemnozielone menu, delikatne akcenty szałwiowe, proste ikony SVG oraz mniej animacji i gradientów.

## Struktura

- `/` — nowy pulpit: liczba meczów, nieopłacone ekwiwalenty, kartki i średnie, najbliższy mecz, skrót do wyników zegarka oraz cztery mecze od najnowszej daty.
- `/matches` — mecze, filtry, wyniki i rozliczenia.
- `/wyniki-zegarka` — wyniki i historia zdarzeń z zegarka.
- `/garmin` — obsługa PIN-ów.
- `/add-match` — formularz dodawania meczu; zastępuje wcześniejszy formularz na stronie głównej.
- `/mecz?data=...` — dotychczasowy import QR, zachowany.

Menu boczne na komputerze zmienia się w kompaktowe menu u góry na telefonie. Widoczne są aktywna zakładka, ścieżka bieżącej strony i przycisk wylogowania. Statystyki przeniesiono z globalnego nagłówka na pulpit. Formularze, lista meczów, wyniki, PIN-y i logowanie mają wspólną kolorystykę. Formularz ma powiązane etykiety pól i pola ekwiwalentu oraz podatku oznaczone jako tylko do odczytu.

Pulpit odczytuje dane z istniejącej kolekcji użytkownika. Nie używa danych pokazowych. Obsługuje ładowanie, pustą listę i błąd z możliwością ponowienia. Kwota do rozliczenia sumuje pole `kasa` nieopłaconych meczów. Zachowano wcześniejszą stałą 377 historycznych meczów w podpisie sumy kariery; jest wydzielona jako `HISTORICAL_MATCHES` w Dashboard.jsx. Statystyka „Mecze w bazie” pokazuje wyłącznie faktycznie zapisane dokumenty.

## Sprawdzenie

- Kompilacja produkcyjna: `CI=true npm run build`.
- 10 testów: `CI=true npm test -- --watchAll=false --runInBand`.
- Kontrola w przeglądarce na oddzielnej kopii z fikcyjnymi danymi, bez połączenia z Firebase: pulpit na komputerze i telefonie 390 px, formularz na telefonie, lista meczów na telefonie, wyniki zegarka.
- Brak poziomego przepełnienia na sprawdzonych ekranach 390 px.

Pliki podglądu pokazują przykładowe drużyny i kwoty, a nie rzeczywiste dane konta. Kopia demonstracyjna nie jest częścią paczki źródłowej. Nie wdrażano zmian na hosting i nie wykonywano zapisów do działającej bazy ani testów z fizycznym zegarkiem.

Uruchomienie: `npm ci`, następnie `npm start`.
