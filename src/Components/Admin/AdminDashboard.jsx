import React, { useEffect, useState } from "react";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { signOut } from "firebase/auth";

import { auth, db } from "../../firebase";

import "./AdminDashboard.css";

/*
  WAŻNE:
  Te nazwy muszą być IDENTYCZNE jak w Firebase.

  Jeśli masz:
  public / druzyny / info
  zmień:
  const TEAMS_DOCUMENT = "druzyny";
*/

const TEAMS_DOCUMENT = "druzyny";
const LEAGUES_DOCUMENT = "poziom";
const REFEREES_DOCUMENT = "sedziowie";

function AdminDashboard() {
  // ==========================================
  // AKTYWNA ZAKŁADKA
  // ==========================================

  const [activeTab, setActiveTab] = useState("druzyny");

  // ==========================================
  // DANE FIREBASE
  // ==========================================

  const [druzyny, setDruzyny] = useState([]);
  const [poziomy, setPoziomy] = useState([]);
  const [sedziowie, setSedziowie] = useState([]);

  // ==========================================
  // WYSZUKIWANIE
  // ==========================================

  const [teamSearch, setTeamSearch] = useState("");
  const [refereeSearch, setRefereeSearch] = useState("");
  const [leagueSearch, setLeagueSearch] = useState("");

  // ==========================================
  // DRUŻYNA - FORMULARZ
  // ==========================================

  const [teamForm, setTeamForm] = useState({
    nazwa: "",
    platnosc: "",
  });

  const [editingTeamId, setEditingTeamId] = useState(null);

  // ==========================================
  // SĘDZIA - FORMULARZ
  // ==========================================

  const [refereeForm, setRefereeForm] = useState({
    imie: "",
  });

  const [editingRefereeId, setEditingRefereeId] = useState(null);

  // ==========================================
  // LIGA - FORMULARZ
  // ==========================================

  const [leagueForm, setLeagueForm] = useState({
    nazwa: "",
    kasa: "",
    podatek: "",
  });

  const [editingLeagueId, setEditingLeagueId] = useState(null);

  // ==========================================
  // POBIERANIE DANYCH Z FIREBASE
  // ==========================================

  useEffect(() => {
    // =====================
    // DRUŻYNY
    // =====================

    const teamsRef = collection(
      db,
      "public",
      TEAMS_DOCUMENT,
      "info"
    );

    const unsubscribeTeams = onSnapshot(
      teamsRef,
      (snapshot) => {
        const data = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        data.sort((a, b) => {
          const idA = Number(a.id);
          const idB = Number(b.id);

          if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
            return idA - idB;
          }

          return String(a.id).localeCompare(String(b.id));
        });

        console.log("Drużyny:", data);

        setDruzyny(data);
      },
      (error) => {
        console.error("Błąd pobierania drużyn:", error);
      }
    );

    // =====================
    // SĘDZIOWIE
    // =====================

    const refereesRef = collection(
      db,
      "public",
      REFEREES_DOCUMENT,
      "info"
    );

    const unsubscribeReferees = onSnapshot(
      refereesRef,
      (snapshot) => {
        const data = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        data.sort((a, b) => {
          const idA = Number(a.id);
          const idB = Number(b.id);

          if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
            return idA - idB;
          }

          return String(a.id).localeCompare(String(b.id));
        });

        console.log("Sędziowie:", data);

        setSedziowie(data);
      },
      (error) => {
        console.error("Błąd pobierania sędziów:", error);
      }
    );

    // =====================
    // LIGI
    // =====================

    const leaguesRef = collection(
      db,
      "public",
      LEAGUES_DOCUMENT,
      "info"
    );

    const unsubscribeLeagues = onSnapshot(
      leaguesRef,
      (snapshot) => {
        const data = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        data.sort((a, b) => {
          const idA = Number(a.id);
          const idB = Number(b.id);

          if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
            return idA - idB;
          }

          return String(a.id).localeCompare(String(b.id));
        });

        console.log("Ligi:", data);

        setPoziomy(data);
      },
      (error) => {
        console.error("Błąd pobierania lig:", error);
      }
    );

    return () => {
      unsubscribeTeams();
      unsubscribeReferees();
      unsubscribeLeagues();
    };
  }, []);

  // ==========================================
  // GENEROWANIE KOLEJNEGO ID
  // ==========================================

  const getNextId = (items) => {
    if (!items || items.length === 0) {
      return "1";
    }

    const numericIds = items
      .map((item) => Number(item.id))
      .filter((id) => !Number.isNaN(id));

    if (numericIds.length === 0) {
      return "1";
    }

    return String(Math.max(...numericIds) + 1);
  };

  // ==========================================
  // WYSZUKIWANIE DRUŻYN
  // ==========================================

  const filteredTeams = druzyny.filter((team) => {
    const search = teamSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      String(team.id || "")
        .toLowerCase()
        .includes(search) ||
      String(team.nazwa || "")
        .toLowerCase()
        .includes(search) ||
      String(team.platnosc || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // ==========================================
  // WYSZUKIWANIE SĘDZIÓW
  // ==========================================

  const filteredReferees = sedziowie.filter((referee) => {
    const search = refereeSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      String(referee.id || "")
        .toLowerCase()
        .includes(search) ||
      String(referee.imie || "")
        .toLowerCase()
        .includes(search) ||
      String(referee.nazwisko || "")
        .toLowerCase()
        .includes(search) ||
      String(referee.email || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // ==========================================
  // WYSZUKIWANIE LIG
  // ==========================================

  const filteredLeagues = poziomy.filter((league) => {
    const search = leagueSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      String(league.id || "")
        .toLowerCase()
        .includes(search) ||
      String(league.nazwa || "")
        .toLowerCase()
        .includes(search) ||
      String(league.kasa || "")
        .toLowerCase()
        .includes(search) ||
      String(league.podatek || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // =========================================================
  // DRUŻYNY
  // =========================================================

  const saveTeam = async (e) => {
    e.preventDefault();

    const nazwa = teamForm.nazwa.trim();

    if (!nazwa) {
      alert("Podaj nazwę drużyny.");
      return;
    }

    if (!teamForm.platnosc) {
      alert("Wybierz sposób płatności.");
      return;
    }

    try {
      const data = {
        nazwa,
        platnosc: teamForm.platnosc,
      };

      // EDYCJA
      if (editingTeamId) {
        const teamRef = doc(
          db,
          "public",
          TEAMS_DOCUMENT,
          "info",
          editingTeamId
        );

        await updateDoc(teamRef, data);
      }

      // DODAWANIE
      else {
        const newId = getNextId(druzyny);

        const teamRef = doc(
          db,
          "public",
          TEAMS_DOCUMENT,
          "info",
          newId
        );

        await setDoc(teamRef, data);
      }

      cancelTeamEditing();
    } catch (error) {
      console.error("Błąd zapisu drużyny:", error);

      alert("Nie udało się zapisać drużyny.");
    }
  };

  const editTeam = (team) => {
    setEditingTeamId(team.id);

    setTeamForm({
      nazwa: team.nazwa || "",
      platnosc: team.platnosc || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelTeamEditing = () => {
    setEditingTeamId(null);

    setTeamForm({
      nazwa: "",
      platnosc: "",
    });
  };

  const removeTeam = async (id) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć tę drużynę?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "public",
          TEAMS_DOCUMENT,
          "info",
          id
        )
      );

      if (editingTeamId === id) {
        cancelTeamEditing();
      }
    } catch (error) {
      console.error("Błąd usuwania drużyny:", error);

      alert("Nie udało się usunąć drużyny.");
    }
  };

  // =========================================================
  // SĘDZIOWIE
  // =========================================================

  const saveReferee = async (e) => {
    e.preventDefault();

    const imie = refereeForm.imie.trim();

    if (!imie) {
      alert("Podaj imię i nazwisko sędziego.");
      return;
    }

    try {
      const data = {
        imie,
      };

      // EDYCJA
      if (editingRefereeId) {
        const refereeRef = doc(
          db,
          "public",
          REFEREES_DOCUMENT,
          "info",
          editingRefereeId
        );

        await updateDoc(refereeRef, data);
      }

      // DODAWANIE
      else {
        const newId = getNextId(sedziowie);

        const refereeRef = doc(
          db,
          "public",
          REFEREES_DOCUMENT,
          "info",
          newId
        );

        await setDoc(refereeRef, data);
      }

      cancelRefereeEditing();
    } catch (error) {
      console.error("Błąd zapisu sędziego:", error);

      alert("Nie udało się zapisać sędziego.");
    }
  };

  const editReferee = (referee) => {
    setEditingRefereeId(referee.id);

    setRefereeForm({
      imie: referee.imie || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelRefereeEditing = () => {
    setEditingRefereeId(null);

    setRefereeForm({
      imie: "",
    });
  };

  const removeReferee = async (id) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć tego sędziego?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "public",
          REFEREES_DOCUMENT,
          "info",
          id
        )
      );

      if (editingRefereeId === id) {
        cancelRefereeEditing();
      }
    } catch (error) {
      console.error("Błąd usuwania sędziego:", error);

      alert("Nie udało się usunąć sędziego.");
    }
  };

  // =========================================================
  // LIGI
  // =========================================================

  const saveLeague = async (e) => {
    e.preventDefault();

    const nazwa = leagueForm.nazwa.trim();

    if (!nazwa) {
      alert("Podaj nazwę ligi.");
      return;
    }

    if (leagueForm.kasa === "") {
      alert("Podaj stawkę.");
      return;
    }

    if (leagueForm.podatek === "") {
      alert("Podaj podatek.");
      return;
    }

    try {
      const data = {
        nazwa,
        kasa: Number(leagueForm.kasa),
        podatek: Number(leagueForm.podatek),
      };

      // EDYCJA
      if (editingLeagueId) {
        const leagueRef = doc(
          db,
          "public",
          LEAGUES_DOCUMENT,
          "info",
          editingLeagueId
        );

        await updateDoc(leagueRef, data);
      }

      // DODAWANIE
      else {
        const newId = getNextId(poziomy);

        const leagueRef = doc(
          db,
          "public",
          LEAGUES_DOCUMENT,
          "info",
          newId
        );

        await setDoc(leagueRef, data);
      }

      cancelLeagueEditing();
    } catch (error) {
      console.error("Błąd zapisu ligi:", error);

      alert("Nie udało się zapisać ligi.");
    }
  };

  const editLeague = (league) => {
    setEditingLeagueId(league.id);

    setLeagueForm({
      nazwa: league.nazwa || "",
      kasa: league.kasa ?? "",
      podatek: league.podatek ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelLeagueEditing = () => {
    setEditingLeagueId(null);

    setLeagueForm({
      nazwa: "",
      kasa: "",
      podatek: "",
    });
  };

  const removeLeague = async (id) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć tę ligę?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "public",
          LEAGUES_DOCUMENT,
          "info",
          id
        )
      );

      if (editingLeagueId === id) {
        cancelLeagueEditing();
      }
    } catch (error) {
      console.error("Błąd usuwania ligi:", error);

      alert("Nie udało się usunąć ligi.");
    }
  };

  // =========================================================
  // WYLOGOWANIE
  // =========================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Błąd wylogowania:", error);

      alert("Nie udało się wylogować.");
    }
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="admin-dashboard">

      {/* ===================================
          SIDEBAR
      =================================== */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-top">

          <div className="admin-logo">
            <span className="admin-logo-icon">⚽</span>

            <div>
              <strong>Panel Admina</strong>
              <small>Aplikacja Sędziego</small>
            </div>
          </div>

          <nav className="admin-menu">

            <button
              className={
                activeTab === "druzyny"
                  ? "admin-menu-button active"
                  : "admin-menu-button"
              }
              onClick={() => setActiveTab("druzyny")}
            >
              <span>🛡️</span>
              Drużyny

              <span className="menu-count">
                {druzyny.length}
              </span>
            </button>

            <button
              className={
                activeTab === "sedziowie"
                  ? "admin-menu-button active"
                  : "admin-menu-button"
              }
              onClick={() => setActiveTab("sedziowie")}
            >
              <span>👤</span>
              Sędziowie

              <span className="menu-count">
                {sedziowie.length}
              </span>
            </button>

            <button
              className={
                activeTab === "ligi"
                  ? "admin-menu-button active"
                  : "admin-menu-button"
              }
              onClick={() => setActiveTab("ligi")}
            >
              <span>🏆</span>
              Ligi i stawki

              <span className="menu-count">
                {poziomy.length}
              </span>
            </button>

          </nav>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span>🚪</span>
          Wyloguj
        </button>

      </aside>

      {/* ===================================
          CONTENT
      =================================== */}

      <main className="admin-main">

        <div className="admin-page-header">
          <div>
            <h1>Panel administratora</h1>

            <p>
              Zarządzaj danymi aplikacji sędziowskiej
            </p>
          </div>
        </div>

        {/* =====================================================
            DRUŻYNY
        ===================================================== */}

        {activeTab === "druzyny" && (
          <section className="admin-section">

            <div className="admin-section-header">

              <div>
                <h2>Drużyny</h2>

                <p>
                  Zarządzaj drużynami i sposobem płatności
                </p>
              </div>

              <div className="admin-counter">
                {druzyny.length} drużyn
              </div>

            </div>

            {/* FORMULARZ */}

            <form
              className="admin-form"
              onSubmit={saveTeam}
            >

              <div className="form-title">

                {editingTeamId
                  ? `Edytujesz drużynę #${editingTeamId}`
                  : "Dodaj nową drużynę"}

              </div>

              <div className="form-fields">

                <div className="form-field">

                  <label>Nazwa drużyny</label>

                  <input
                    type="text"
                    placeholder="np. Karkonosze Jelenia Góra"
                    value={teamForm.nazwa}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        nazwa: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-field">

                  <label>Płatność</label>

                  <select
                    value={teamForm.platnosc}
                    onChange={(e) =>
                      setTeamForm({
                        ...teamForm,
                        platnosc: e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Wybierz płatność
                    </option>

                    <option value="delegacja">
                      Delegacja
                    </option>

                    <option value="edelegacja">
                      eDelegacja
                    </option>

                  </select>

                </div>

                <div className="form-buttons">

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    {editingTeamId
                      ? "Zapisz zmiany"
                      : "Dodaj drużynę"}
                  </button>

                  {editingTeamId && (
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={cancelTeamEditing}
                    >
                      Anuluj
                    </button>
                  )}

                </div>

              </div>

            </form>

            {/* SEARCH */}

            <div className="list-toolbar">

              <div className="admin-search">

                <span className="search-icon">
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Szukaj drużyny..."
                  value={teamSearch}
                  onChange={(e) =>
                    setTeamSearch(e.target.value)
                  }
                />

                {teamSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setTeamSearch("")
                    }
                  >
                    ✕
                  </button>
                )}

              </div>

              <span className="search-results">
                Wyświetlono {filteredTeams.length} z{" "}
                {druzyny.length}
              </span>

            </div>

            {/* TABELA */}

            <div className="admin-table-container">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nazwa drużyny</th>
                    <th>Płatność</th>
                    <th>Akcje</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTeams.length === 0 ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="empty-table"
                      >
                        {teamSearch
                          ? "Nie znaleziono drużyny."
                          : "Brak drużyn."}
                      </td>
                    </tr>

                  ) : (

                    filteredTeams.map((team) => (

                      <tr key={team.id}>

                        <td>
                          <span className="id-badge">
                            {team.id}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {team.nazwa}
                          </strong>
                        </td>

                        <td>
                          <span className="payment-badge">
                            {team.platnosc ||
                              "Brak"}
                          </span>
                        </td>

                        <td>

                          <div className="table-actions">

                            <button
                              className="edit-button"
                              onClick={() =>
                                editTeam(team)
                              }
                            >
                              Edytuj
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                removeTeam(team.id)
                              }
                            >
                              Usuń
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </section>
        )}

        {/* =====================================================
            SĘDZIOWIE
        ===================================================== */}

        {activeTab === "sedziowie" && (
          <section className="admin-section">

            <div className="admin-section-header">

              <div>
                <h2>Sędziowie</h2>

                <p>
                  Zarządzaj listą sędziów
                </p>
              </div>

              <div className="admin-counter">
                {sedziowie.length} sędziów
              </div>

            </div>

            {/* FORMULARZ */}

            <form
              className="admin-form"
              onSubmit={saveReferee}
            >

              <div className="form-title">

                {editingRefereeId
                  ? `Edytujesz sędziego #${editingRefereeId}`
                  : "Dodaj nowego sędziego"}

              </div>

              <div className="form-fields">

                <div className="form-field">

                  <label>Imię i nazwisko</label>

                  <input
                    type="text"
                    placeholder="np. Marcel Żak"
                    value={refereeForm.imie}
                    onChange={(e) =>
                      setRefereeForm({
                        imie: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-buttons">

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    {editingRefereeId
                      ? "Zapisz zmiany"
                      : "Dodaj sędziego"}
                  </button>

                  {editingRefereeId && (
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={cancelRefereeEditing}
                    >
                      Anuluj
                    </button>
                  )}

                </div>

              </div>

            </form>

            {/* SEARCH */}

            <div className="list-toolbar">

              <div className="admin-search">

                <span className="search-icon">
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Szukaj sędziego..."
                  value={refereeSearch}
                  onChange={(e) =>
                    setRefereeSearch(
                      e.target.value
                    )
                  }
                />

                {refereeSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setRefereeSearch("")
                    }
                  >
                    ✕
                  </button>
                )}

              </div>

              <span className="search-results">
                Wyświetlono{" "}
                {filteredReferees.length} z{" "}
                {sedziowie.length}
              </span>

            </div>

            {/* TABELA */}

            <div className="admin-table-container">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sędzia</th>
                    <th>Akcje</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredReferees.length === 0 ? (

                    <tr>
                      <td
                        colSpan="3"
                        className="empty-table"
                      >
                        {refereeSearch
                          ? "Nie znaleziono sędziego."
                          : "Brak sędziów."}
                      </td>
                    </tr>

                  ) : (

                    filteredReferees.map(
                      (referee) => (

                        <tr key={referee.id}>

                          <td>
                            <span className="id-badge">
                              {referee.id}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {referee.imie}
                            </strong>
                          </td>

                          <td>

                            <div className="table-actions">

                              <button
                                className="edit-button"
                                onClick={() =>
                                  editReferee(
                                    referee
                                  )
                                }
                              >
                                Edytuj
                              </button>

                              <button
                                className="delete-button"
                                onClick={() =>
                                  removeReferee(
                                    referee.id
                                  )
                                }
                              >
                                Usuń
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>
        )}

        {/* =====================================================
            LIGI
        ===================================================== */}

        {activeTab === "ligi" && (
          <section className="admin-section">

            <div className="admin-section-header">

              <div>
                <h2>Ligi i stawki</h2>

                <p>
                  Zarządzaj ligami, stawkami i podatkiem
                </p>
              </div>

              <div className="admin-counter">
                {poziomy.length} lig
              </div>

            </div>

            {/* FORMULARZ */}

            <form
              className="admin-form"
              onSubmit={saveLeague}
            >

              <div className="form-title">

                {editingLeagueId
                  ? `Edytujesz ligę #${editingLeagueId}`
                  : "Dodaj nową ligę"}

              </div>

              <div className="form-fields league-fields">

                <div className="form-field">

                  <label>Nazwa ligi</label>

                  <input
                    type="text"
                    placeholder="np. IV liga"
                    value={leagueForm.nazwa}
                    onChange={(e) =>
                      setLeagueForm({
                        ...leagueForm,
                        nazwa: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-field">

                  <label>Stawka</label>

                  <input
                    type="number"
                    placeholder="np. 350"
                    value={leagueForm.kasa}
                    onChange={(e) =>
                      setLeagueForm({
                        ...leagueForm,
                        kasa: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-field">

                  <label>Podatek</label>

                  <input
                    type="number"
                    placeholder="np. 42"
                    value={leagueForm.podatek}
                    onChange={(e) =>
                      setLeagueForm({
                        ...leagueForm,
                        podatek:
                          e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-buttons">

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    {editingLeagueId
                      ? "Zapisz zmiany"
                      : "Dodaj ligę"}
                  </button>

                  {editingLeagueId && (
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={
                        cancelLeagueEditing
                      }
                    >
                      Anuluj
                    </button>
                  )}

                </div>

              </div>

            </form>

            {/* SEARCH */}

            <div className="list-toolbar">

              <div className="admin-search">

                <span className="search-icon">
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Szukaj ligi..."
                  value={leagueSearch}
                  onChange={(e) =>
                    setLeagueSearch(
                      e.target.value
                    )
                  }
                />

                {leagueSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setLeagueSearch("")
                    }
                  >
                    ✕
                  </button>
                )}

              </div>

              <span className="search-results">
                Wyświetlono{" "}
                {filteredLeagues.length} z{" "}
                {poziomy.length}
              </span>

            </div>

            {/* TABELA */}

            <div className="admin-table-container">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Liga</th>
                    <th>Stawka</th>
                    <th>Podatek</th>
                    <th>Akcje</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredLeagues.length === 0 ? (

                    <tr>
                      <td
                        colSpan="5"
                        className="empty-table"
                      >
                        {leagueSearch
                          ? "Nie znaleziono ligi."
                          : "Brak lig."}
                      </td>
                    </tr>

                  ) : (

                    filteredLeagues.map(
                      (league) => (

                        <tr key={league.id}>

                          <td>
                            <span className="id-badge">
                              {league.id}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {league.nazwa}
                            </strong>
                          </td>

                          <td>
                            {league.kasa} zł
                          </td>

                          <td>
                            {league.podatek} zł
                          </td>

                          <td>

                            <div className="table-actions">

                              <button
                                className="edit-button"
                                onClick={() =>
                                  editLeague(
                                    league
                                  )
                                }
                              >
                                Edytuj
                              </button>

                              <button
                                className="delete-button"
                                onClick={() =>
                                  removeLeague(
                                    league.id
                                  )
                                }
                              >
                                Usuń
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default AdminDashboard;