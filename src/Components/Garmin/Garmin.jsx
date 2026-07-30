import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { 
  doc, 
  setDoc, 
  getDoc,
  collection, 
  getDocs, 
  query, 
  where,
  collectionGroup 
} from "firebase/firestore";
import "./Garmin.css";

function Garmin() {
  const [mode, setMode] = useState("db");

  // Szukanie w bazie
  const [matchNumberInput, setMatchNumberInput] = useState("");
  const [foundMatch, setFoundMatch] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ręczne wpisywanie
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [czasGry, setCzasGry] = useState(""); 

  const [existingPins, setExistingPins] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPins = async () => {
    try {
      const pinsSnapshot = await getDocs(collection(db, "watch_pins"));
      const pinsList = pinsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sortowanie po dacie utworzenia (od najnowszych)
      pinsList.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      // Ograniczenie listy do maksymalnie 5 pozycji
      setExistingPins(pinsList.slice(0, 5));
    } catch (error) {
      console.error("Błąd podczas pobierania PIN-ów: ", error);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  // Szukanie meczu po numerze
  const handleSearchMatch = async (e) => {
    e.preventDefault();
    setSearchError("");
    setFoundMatch(null);
    setSuccessMessage("");

    const cleanInput = matchNumberInput.trim().replace("#", "");

    if (!cleanInput) {
      setSearchError("Wpisz numer meczu!");
      return;
    }

    const pinNumber = Number(cleanInput);

    if (isNaN(pinNumber)) {
      setSearchError("Numer meczu musi być liczbą!");
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collectionGroup(db, "mecze"),
        where("numer_meczu", "==", pinNumber)
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSearchError(`Nie znaleziono w bazie meczu o numerze #${cleanInput}`);
      } else {
        const matchDoc = querySnapshot.docs[0];
        setFoundMatch({ id: matchDoc.id, ...matchDoc.data() });
      }
    } catch (error) {
      console.error("Błąd podczas szukania meczu: ", error);
      setSearchError("Błąd podczas wyszukiwania meczu.");
    } finally {
      setLoading(false);
    }
  };

  // Przypisanie meczu z bazy jako PIN
  const handleAssignDbMatch = async () => {
    if (!foundMatch) return;

    const pinString = String(foundMatch.numer_meczu);

    try {
      await setDoc(doc(db, "watch_pins", pinString), {
        matchId: foundMatch.id_mecz || foundMatch.id,
        numer_meczu: foundMatch.numer_meczu,
        home: (foundMatch.gospodarz || "").toUpperCase().trim(),
        away: (foundMatch.gosc || "").toUpperCase().trim(),
        czas: foundMatch.czas || foundMatch.czas_gry || foundMatch.godzina || "",
        liga: foundMatch.liga || "",
        createdAt: new Date(),
      });

      setSuccessMessage(`Mecz #${pinString} został aktywowany dla zegarka!`);
      setFoundMatch(null);
      setMatchNumberInput("");
      fetchPins();
    } catch (error) {
      console.error("Błąd podczas zapisywania PIN-u: ", error);
      alert("Wystąpił błąd podczas aktywacji PIN-u.");
    }
  };

  // Ręczne generowanie PIN-u
  const handleGenerateManualPin = async () => {
    setSuccessMessage("");
    if (!homeTeam || !awayTeam) {
      alert("Wpisz obie drużyny!");
      return;
    }

    let generatedPin;
    let pinExists = true;

    while (pinExists) {
      generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      const pinRef = doc(db, "watch_pins", generatedPin);
      const pinSnap = await getDoc(pinRef);
      if (!pinSnap.exists()) {
        pinExists = false;
      }
    }

    try {
      await setDoc(doc(db, "watch_pins", generatedPin), {
        home: homeTeam.toUpperCase().trim(),
        away: awayTeam.toUpperCase().trim(),
        czas: czasGry.trim(),
        createdAt: new Date(),
      });

      setSuccessMessage(`Wygenerowano PIN: ${generatedPin}`);
      setHomeTeam("");
      setAwayTeam("");
      setCzasGry("");
      fetchPins();
    } catch (error) {
      console.error("Błąd podczas zapisywania PIN-u: ", error);
    }
  };

  return (
    <div className="garmin-container">
      <h2 className="garmin-title">Garmin - Obsługa PIN-ów</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
        <button 
          className="garmin-btn" 
          style={{ backgroundColor: mode === "db" ? "#27ae60" : "#7f8c8d" }}
          onClick={() => { setMode("db"); setSearchError(""); setSuccessMessage(""); }}
        >
          🔍 Pobierz z bazy (nr meczu)
        </button>
        <button 
          className="garmin-btn" 
          style={{ backgroundColor: mode === "manual" ? "#27ae60" : "#7f8c8d" }}
          onClick={() => { setMode("manual"); setSearchError(""); setSuccessMessage(""); }}
        >
          ✏️ Dodaj własny mecz
        </button>
      </div>

      {successMessage && <div className="garmin-alert">{successMessage}</div>}

      {/* TRYB 1: Szukanie po numerze meczu */}
      {mode === "db" && (
        <div>
          <form onSubmit={handleSearchMatch} className="garmin-form">
            <input
              type="text"
              className="garmin-input"
              placeholder="Wpisz numer meczu (np. 4687858)"
              value={matchNumberInput}
              onChange={(e) => setMatchNumberInput(e.target.value)}
            />
            <button type="submit" className="garmin-btn" disabled={loading}>
              {loading ? "Szukam..." : "Znajdź Mecz"}
            </button>
          </form>

          {searchError && <p className="garmin-error" style={{ color: "#e74c3c", marginTop: "10px" }}>{searchError}</p>}

          {foundMatch && (
            <div className="garmin-match-preview" style={{ margin: "20px 0", padding: "15px", border: "1px solid #2ecc71", borderRadius: "8px" }}>
              <h3>Znaleziono mecz #{foundMatch.numer_meczu}</h3>
              <p><strong>Drużyny:</strong> {foundMatch.gospodarz} vs {foundMatch.gosc}</p>
              <p><strong>Liga:</strong> {foundMatch.liga}</p>

              <button 
                className="garmin-btn" 
                style={{ backgroundColor: "#2ecc71", marginTop: "10px" }}
                onClick={handleAssignDbMatch}
              >
                ✓ Aktywuj #{foundMatch.numer_meczu} na zegarek
              </button>
            </div>
          )}
        </div>
      )}

      {/* TRYB 2: Ręczne dodawanie */}
      {mode === "manual" && (
        <div className="garmin-form">
          <input
            type="text"
            className="garmin-input"
            placeholder="Gospodarz"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
          />
          <input
            type="text"
            className="garmin-input"
            placeholder="Gość"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
          />
          <input
            type="text"
            className="garmin-input"
            placeholder="Czas gry (np. 45' lub 15:30)"
            value={czasGry}
            onChange={(e) => setCzasGry(e.target.value)}
          />
          <button className="garmin-btn" onClick={handleGenerateManualPin}>
            Wygeneruj PIN
          </button>
        </div>
      )}

      <hr className="garmin-divider" />

      {/* Lista PIN-ów (max 5) */}
      <h3 className="garmin-subtitle">Ostatnie 5 meczów z PIN-ami:</h3>
      {existingPins.length === 0 ? (
        <p className="garmin-empty">Brak aktywnych PIN-ów.</p>
      ) : (
        <ul className="garmin-list">
          {existingPins.map((item) => (
            <li key={item.id} className="garmin-list-item">
              <div className="garmin-match-info">
                <span className="garmin-teams">
                  <strong>{item.home}</strong> vs <strong>{item.away}</strong>
                </span>
                
                {item.czas && (
                  <span className="garmin-match-time">
                    ⏱️ {item.czas}
                  </span>
                )}
              </div>

              <span className="garmin-badge-pin">
                PIN: {item.id}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Garmin;