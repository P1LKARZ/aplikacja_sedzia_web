# Wyniki z zegarka

Nowa podstrona: `/wyniki-zegarka`, dostępna po zalogowaniu przez przycisk „Wyniki z zegarka”.

Wyświetla zapisane mecze z istniejącej kolekcji `matches_qr_code`: wynik, drużyny, czasy połów oraz zdarzenia. Najnowszy mecz jest wybierany domyślnie. Starsze mecze można wybierać z historii. Przycisk „Odśwież wyniki” ponownie pobiera dane, również po błędzie połączenia.

Podstrona korzysta z istniejącego komponentu MatchView w trybie odczytu. Nie zapisuje danych z parametrów URL. Dotychczasowy import QR pod `/mecz?data=...` pozostaje dostępny. Wyniki pojawiają się po zapisaniu ich w Firebase, np. przez dotychczasowy import QR; nie dodano bezpośredniego połączenia Bluetooth ani zmian oprogramowania zegarka.

Poprawiono wyświetlanie łącznego czasu zapisanych meczów oraz odczyt dat Firebase Timestamp. Menu zawija przyciski na wąskich ekranach.

Weryfikacja: 8 testów zakończonych pomyślnie (w tym 3 nowe testy odczytu, wyboru meczu, odświeżenia, pustej listy i błędu). Kompilacja produkcyjna zakończona pomyślnie. Testy nowej podstrony używają symulowanych odpowiedzi Firebase; nie przeprowadzono testu z fizycznym zegarkiem ani zalogowanym kontem.

Uruchomienie: `npm ci`, następnie `npm start`.
