import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc,
  updateDoc,
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

  // Stany dla edycji czasu wiersza
  const [editingPinId, setEditingPinId] = useState(null);
  const [editingTimeValue, setEditingTimeValue] = useState("");

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

      // Max 5 pozycji
      setExistingPins(pinsList.slice(0, 5));
    } catch (error) {
      console.error("Błąd podczas pobierania PIN-ów: ", error);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  // Szukanie meczu po numerze
 // Niezawodna funkcja wyszukiwania (działa bez indeksów Firebase)
  const handleSearchMatch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSearchError("");
    setFoundMatch(null);
    setSuccessMessage("");

    const inputTrimmed = matchNumberInput.trim().replace("#", "");

    if (!inputTrimmed) {
      setSearchError("Wpisz numer meczu!");
      return;
    }

    setLoading(true);

    try {
      // 1. Najpierw sprawdzamy w głównej kolekcji "mecze"
      const mainRef = collection(db, "mecze");
      const mainSnap = await getDocs(mainRef);
      
      let matchData = null;
      let matchDocId = null;

      mainSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          String(data.numer_meczu) === inputTrimmed ||
          docSnap.id === inputTrimmed
        ) {
          matchData = data;
          matchDocId = docSnap.id;
        }
      });

      // 2. Jeśli nie ma w głównej, przeszukujemy wszystkie podkolekcje "mecze"
      if (!matchData) {
        const groupRef = collectionGroup(db, "mecze");
        const groupSnap = await getDocs(groupRef);

        groupSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (
            String(data.numer_meczu) === inputTrimmed ||
            docSnap.id === inputTrimmed
          ) {
            matchData = data;
            matchDocId = docSnap.id;
          }
        });
      }

      if (matchData) {
        setFoundMatch({ id: matchDocId, ...matchData });
      } else {
        setSearchError(`Nie znaleziono w bazie meczu o numerze #${inputTrimmed}`);
      }
    } catch (error) {
      console.error("Szczegóły błędu wyszukiwania:", error);
      setSearchError(`Błąd podczas wyszukiwania: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  // Przypisanie meczu z bazy jako PIN
// Przypisanie meczu z bazy jako PIN (bezpieczne dla Firebase)
// Przypisanie meczu z bazy jako PIN (z domyślnym czasem 45)
  const handleAssignDbMatch = async () => {
    if (!foundMatch) return;

    const pinString = String(foundMatch.numer_meczu || foundMatch.id).trim();

    // Jeśli mecz w bazie nie posiada czasu, ustawia "45"
    const pobranyCzas = String(foundMatch.czas || foundMatch.czas_gry || foundMatch.godzina || "").trim();
    const finalCzas = pobranyCzas !== "" ? pobranyCzas : "45";

    try {
      await setDoc(doc(db, "watch_pins", pinString), {
        matchId: foundMatch.id || pinString,
        numer_meczu: foundMatch.numer_meczu || pinString,
        home: String(foundMatch.gospodarz || foundMatch.home || "Brak").toUpperCase().trim(),
        away: String(foundMatch.gosc || foundMatch.away || "Brak").toUpperCase().trim(),
        czas: finalCzas,
        liga: foundMatch.liga || "",
        createdAt: new Date(),
      });

      setSuccessMessage(`Mecz #${pinString} został aktywowany dla zegarka!`);
      setFoundMatch(null);
      setMatchNumberInput("");
      fetchPins();
    } catch (error) {
      console.error("Błąd zapisywania PIN-u:", error);
      alert(`Wystąpił błąd: ${error.message}`);
    }
  };
  // Ręczne generowanie PIN-u
// Ręczne generowanie PIN-u (z domyślnym czasem 45 minut)
  const handleGenerateManualPin = async () => {
    setSuccessMessage("");
    if (!homeTeam || !awayTeam) {
      alert("Wpisz obie drużyny!");
      return;
    }

    // Jeśli użytkownik nie wpisał czasu, używamy domyślnego "45"
    const finalCzas = czasGry.trim() !== "" ? czasGry.trim() : "45";

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
        czas: finalCzas, // Zapisujemy podany czas lub domyślne "45"
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
  // --- NOWE FUNKCJE: USUWANIE I EDYCJA ---

  // Usuwanie meczu
// Bezpieczne usuwanie TYLKO aktywnego PIN-u zegarka (baza głównych meczów zostaje nietknięta)
const handleDeletePin = async (pinId) => {
  if (!window.confirm(`Usuń PIN #${pinId} z zegarka?`)) return;

  try {
    // Odwołujemy się WYŁĄCZNIE do kolekcji "watch_pins"
    await deleteDoc(doc(db, "watch_pins", pinId));
    
    setSuccessMessage(`Usunięto PIN #${pinId} z listy zegarka.`);
    fetchPins(); // Odświeżamy tylko listę PIN-ów
  } catch (error) {
    console.error("Błąd podczas usuwania PIN-u: ", error);
    alert("Błąd podczas usuwania PIN-u.");
  }
};

  // Włączenie trybu edycji dla wybranego wiersza
  const handleStartEdit = (item) => {
    setEditingPinId(item.id);
    setEditingTimeValue(item.czas || "");
  };

  // Zapis zmodyfikowanego czasu do Firebase
  const handleSaveTime = async (pinId) => {
    try {
      const pinRef = doc(db, "watch_pins", pinId);
      await updateDoc(pinRef, {
        czas: editingTimeValue.trim()
      });
      setEditingPinId(null);
      setEditingTimeValue("");
      fetchPins();
    } catch (error) {
      console.error("Błąd podczas aktualizacji czasu: ", error);
      alert("Nie udało się zapisać nowego czasu.");
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

      {/* Lista PIN-ów z możliwością edycji czasu i usuwania */}
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

                {/* Tryb edycji czasu dla tego wiersza */}
                {editingPinId === item.id ? (
                  <div className="garmin-edit-box">
                    <input
                      type="text"
                      className="garmin-input-inline"
                      value={editingTimeValue}
                      placeholder="np. 45'"
                      onChange={(e) => setEditingTimeValue(e.target.value)}
                    />
                    <button className="garmin-btn-icon save" onClick={() => handleSaveTime(item.id)} title="Zapisz">
                      ✓
                    </button>
                    <button className="garmin-btn-icon cancel" onClick={() => setEditingPinId(null)} title="Anuluj">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="garmin-time-wrapper">
                    <span className="garmin-match-time">
                      ⏱️ {item.czas || "Brak czasu"}
                    </span>
                    <button 
                      className="garmin-btn-icon edit" 
                      onClick={() => handleStartEdit(item)}
                      title="Edytuj czas"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>

              <div className="garmin-actions">
                <span className="garmin-badge-pin">
                   {item.id}
                </span>
                <button 
                  className="garmin-btn-icon delete" 
                  onClick={() => handleDeletePin(item.id)}
                  title="Usuń pozycję"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Garmin;