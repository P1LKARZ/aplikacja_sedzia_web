import { useState } from "react";
import MatchView from "../MatchView/MatchView";
import "./WatchResults.css";

export default function WatchResults() {
  const [refresh, setRefresh] = useState(0);

  return (
    <main className="watch-results">
      <header className="watch-results-header">
        <div>
          <h1>Wyniki z zegarka</h1>
          <p>Zapisane mecze, wyniki, czasy gry i zdarzenia. Wybierz mecz, aby zobaczyć szczegóły.</p>
        </div>
        <button type="button" className="btn-nav-matches" onClick={() => setRefresh(value => value + 1)}>
          Odśwież wyniki
        </button>
      </header>
      <MatchView key={refresh} readOnly />
    </main>
  );
}
