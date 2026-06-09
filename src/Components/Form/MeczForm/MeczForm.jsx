import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { getAuth } from "firebase/auth";
import { MeczFormData } from "../MeczFormData";
import { Team } from "../Team/Team";
import { League } from "../League/League";
import { Details } from "../Details/Details";
import "./MeczForm.css";
import { generatePDF as generatePdfFile } from "../../../utils/generatePdf";
import ekwiwalenty from "../../../data/ekwiwalenty";
import { getRundaSezon } from "../../../utils/getRundaSezon";



export default function MeczForm() {
  const [gospodarz, setGospodarz] = useState("");
  const [gosc, setGosc] = useState("");
  const [liga, setLiga] = useState("");
  const [kasa, setKasa] = useState("");
  const [podatek, setPodatek] = useState("");
  const [sedzia, setSedzia] = useState("");
  const [data, setData] = useState("");
  const [numerMeczu, setNumerMeczu] = useState("");
  const [delegacja, setDelegacja] = useState(0);
  const [zaplacone, setZaplacone] = useState("");
  const [loading, setLoading] = useState(false);

  const { druzyny, poziomy, sedziowie, loading: dataLoading, error, validateForm } = MeczFormData();

  // Ustawienie dzisiejszej daty przy załadowaniu
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;
    setData(todayDate);
  }, []);
const getEkwiwalentByLiga = (liga) => {
  return Object.values(ekwiwalenty).find(
    (e) =>
      e.ligaSkrocona?.toLowerCase() === liga?.toLowerCase() ||
      e.liga?.toLowerCase() === liga?.toLowerCase()
  );
};


const mapMeczToPdfData = (mecz) => {
  const ekw = getEkwiwalentByLiga(mecz.liga);

  return {
    typ: "",
    liga: ekw?.liga?.trim() || mecz.liga,
    gospodarze: mecz.gospodarz,
    goscie: mecz.gosc,
    miejsce: "",
    data: new Date(mecz.data).toLocaleDateString("pl-PL"),
    godz: "",

    ekwiwalentBrutto: ekw?.ekwiwalentBrutto || "",
    koszty: ekw?.koszty || "",
    podstawa: ekw?.podstawa || "",
    podatek: ekw?.podatek || "",
    ekwiwalentNetto: ekw?.ekwiwalentNetto || "",
    odbiorkwoty: ekw?.odbiorkwoty || "",
    slownie: ekw?.slownie || "",
  };
};
  const handleLigaChange = (e) => {
    const value = e.target.value;
    setLiga(value);
    const selected = poziomy.find((p) => p.nazwa === value);
    if (selected) {
      setKasa(selected.kasa ?? "");
      setPodatek(selected.podatek ?? "");
    } else {
      setKasa("");
      setPodatek("");
    }
  };

 const handleGospodarzChange = (e) => {
  const value = e.target.value;
  setGospodarz(value);

  const team = druzyny.find((d) => d.nazwa === value);

  if (team?.platnosc === "delegacja") {
    setDelegacja(1);
    setZaplacone("T");
  } else if (team?.platnosc === "edelegacja") {
    setDelegacja(0);
    setZaplacone("N");
  } else {
    // Jeśli płatność nie jest delegacją, nie generujemy delegacji
    setDelegacja(0);
    setZaplacone(""); 
  }
};

  const resetForm = () => {
    setGospodarz("");
    setGosc("");
    setLiga("");
    setKasa("");
    setPodatek("");
    setSedzia("");
    
    // Ustawienie dzisiejszej daty przy resetowaniu
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;
    setData(todayDate);
    
    setNumerMeczu("");
    setDelegacja(0);
    setZaplacone("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja formularza
    const formData = {
      gospodarz,
      gosc,
      liga,
      sedzia,
      data,
      numerMeczu,
    };

    const emptyFields = validateForm(formData);

    if (emptyFields.length > 0) {
      const fieldsList = emptyFields.join(", ");
      alert(`❌ Wypełnij brakujące pola:\n\n${fieldsList}`);
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("❌ Nie jesteś zalogowany");
      return;
    }

    setLoading(true);

    const { runda, sezon } = getRundaSezon(data);

    const mecz = {
      id_mecz: crypto.randomUUID(),
      gospodarz,
      gosc,
      liga,
      kasa,
      podatek,
      data,
      glowny: sedzia,
      numer_meczu: numerMeczu,
      delegacja,
      zaplacone,
      runda,
      sezon,
      // Pola wyników - puste przy dodawaniu
      wynikGospodarz: null,
      wynikGosc: null,
      zolteKartkiGospodarz: 0,
      zolteKartkiGosc: 0,
      czerwoneKartkiGospodarz: 0,
      czerwoneKartkiGosc: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "users", user.uid, "mecze"), mecz);
      alert("✅ Mecz dodany!");
      const pdfData = mapMeczToPdfData(mecz);
      generatePdfFile(pdfData, () => {});
      resetForm();
    } catch (err) {
      console.error(err);
      alert(`❌ Błąd podczas zapisu meczu:\n${err.message || "Spróbuj ponownie"}`);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Ładowanie danych…</p>
      </div>
    );
  }
const sortedDruzyny = [...druzyny].sort((a, b) =>
  a.nazwa.localeCompare(b.nazwa, "pl")
);
  return (
    <div className="mecz-form-container">
      <div className="form-header">
        <h1 className="form-title">Dodaj Nowy Mecz</h1>
        <p className="form-subtitle">Wypełnij wszystkie sekcje aby dodać mecz do bazy</p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="mecz-form">
        <Team
          druzyny={sortedDruzyny}
          gospodarz={gospodarz}
          gosc={gosc}
          onGospodarzChange={handleGospodarzChange}
          onGoscChange={setGosc}
        />

        <League
          poziomy={poziomy}
          liga={liga}
          kasa={kasa}
          podatek={podatek}
          onLigaChange={handleLigaChange}
        />

        <Details
          sedziowie={sedziowie}
          sedzia={sedzia}
          data={data}
          numerMeczu={numerMeczu}
          delegacja={delegacja}
          zaplacone={zaplacone}
          onSedziaChange={setSedzia}
          onDataChange={setData}
          onNumerMeczuChange={setNumerMeczu}
        />

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            <span>{loading ? "Zapisywanie..." : "💾 Zapisz Mecz"}</span>
            <div className="btn-shimmer"></div>
          </button>
          <button 
            type="button" 
            className="btn-reset"
            onClick={resetForm}
            disabled={loading}
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}
