import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import "./MatchesList.css";
import { generatePDF } from "../../utils/generatePdf";
import ekwiwalenty from "../../data/ekwiwalenty";
import { getRundaSezon } from "../../utils/getRundaSezon";


export default function MatchesList() {
  const [mecze, setMecze] = useState([]);
  const [filteredMecze, setFilteredMecze] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFilters, setShowFilters] = useState(false);

  // FILTERS STATE
  const [filters, setFilters] = useState({
    team: "",
    gospodarz: "",
    gosc: "",
    liga: "",
    sedzia: "",
    dataFrom: "",
    dataTo: "",
    nrMeczu: "",
    zaplacone: "all",
    delegacja: "all",
    runda: "all",
    sezon: "all",
  });

  // SORT STATE
  const [sortBy, setSortBy] = useState("data-desc");

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchMecze = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "mecze"));
        const meczArray = [];
        querySnapshot.forEach((doc) => {
          meczArray.push({ id: doc.id, ...doc.data() });
        });
        setMecze(meczArray);
        applyFiltersAndSort(meczArray, filters, sortBy);
      } catch (error) {
        console.error("Błąd:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMecze();
  }, [user, navigate]);

  // APPLY FILTERS AND SORT
  const applyFiltersAndSort = (data, currentFilters, currentSort) => {
    let filtered = [...data];

    // FILTRY
    if (currentFilters.team) {
      filtered = filtered.filter(
        (m) =>
          m.gospodarz?.toLowerCase().includes(currentFilters.team.toLowerCase()) ||
          m.gosc?.toLowerCase().includes(currentFilters.team.toLowerCase())
      );
    }

    if (currentFilters.gospodarz) {
      filtered = filtered.filter((m) =>
        m.gospodarz?.toLowerCase().includes(currentFilters.gospodarz.toLowerCase())
      );
    }

    if (currentFilters.gosc) {
      filtered = filtered.filter((m) =>
        m.gosc?.toLowerCase().includes(currentFilters.gosc.toLowerCase())
      );
    }

    if (currentFilters.liga) {
      filtered = filtered.filter((m) =>
        m.liga?.toLowerCase().includes(currentFilters.liga.toLowerCase())
      );
    }

    if (currentFilters.sedzia) {
      filtered = filtered.filter((m) =>
        m.glowny?.toLowerCase().includes(currentFilters.sedzia.toLowerCase())
      );
    }

    if (currentFilters.dataFrom) {
      const dateFrom = new Date(currentFilters.dataFrom);
      filtered = filtered.filter((m) => new Date(m.data) >= dateFrom);
    }

    if (currentFilters.dataTo) {
      const dateTo = new Date(currentFilters.dataTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter((m) => new Date(m.data) <= dateTo);
    }

    if (currentFilters.nrMeczu) {
      filtered = filtered.filter((m) =>
        m.numer_meczu?.toString().includes(currentFilters.nrMeczu)
      );
    }

    if (currentFilters.zaplacone !== "all") {
      filtered = filtered.filter((m) => m.zaplacone === currentFilters.zaplacone);
    }

    if (currentFilters.delegacja !== "all") {
      const isDelegacja = currentFilters.delegacja === "delegacja" ? 1 : 0;
      filtered = filtered.filter((m) => m.delegacja === isDelegacja);
    }

    // Filtr rundy – obsługuje mecze starsze (bez pola runda) via getRundaSezon
    if (currentFilters.runda !== "all") {
      filtered = filtered.filter((m) => {
        const r = m.runda || getRundaSezon(m.data).runda;
        return r === currentFilters.runda;
      });
    }

    // Filtr sezonu – obsługuje mecze starsze (bez pola sezon) via getRundaSezon
    if (currentFilters.sezon !== "all") {
      filtered = filtered.filter((m) => {
        const s = m.sezon || getRundaSezon(m.data).sezon;
        return s === currentFilters.sezon;
      });
    }

    // SORTOWANIE
    filtered.sort((a, b) => {
      switch (currentSort) {
        case "data-asc":
          return new Date(a.data) - new Date(b.data);
        case "data-desc":
          return new Date(b.data) - new Date(a.data);
        case "nazwa-asc":
          return `${a.gospodarz} vs ${a.gosc}`.localeCompare(
            `${b.gospodarz} vs ${b.gosc}`
          );
        case "nazwa-desc":
          return `${b.gospodarz} vs ${b.gosc}`.localeCompare(
            `${a.gospodarz} vs ${a.gosc}`
          );
        case "liga-asc":
          return (a.liga || "").localeCompare(b.liga || "");
        case "liga-desc":
          return (b.liga || "").localeCompare(a.liga || "");
        case "kasa-asc":
          return (a.kasa || 0) - (b.kasa || 0);
        case "kasa-desc":
          return (b.kasa || 0) - (a.kasa || 0);
        default:
          return new Date(b.data) - new Date(a.data);
      }
    });

    setFilteredMecze(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFiltersAndSort(mecze, newFilters, sortBy);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    applyFiltersAndSort(mecze, filters, newSort);
  };

  const clearFilters = () => {
    const emptyFilters = {
      team: "",
      gospodarz: "",
      gosc: "",
      liga: "",
      sedzia: "",
      dataFrom: "",
      dataTo: "",
      nrMeczu: "",
      zaplacone: "all",
      delegacja: "all",
      runda: "all",
      sezon: "all",
    };
    setFilters(emptyFilters);
    setSortBy("data-desc");
    applyFiltersAndSort(mecze, emptyFilters, "data-desc");
  };

  const toggleExpanded = (meczId) => {
    if (isMobile) {
      setExpandedId(expandedId === meczId ? null : meczId);
    }
  };

  const handleEditClick = (mecz) => {
    setEditingId(mecz.id);
    setEditData({
      wynikGospodarz: mecz.wynikGospodarz || "",
      wynikGosc: mecz.wynikGosc || "",
      zolteKartkiGospodarz: mecz.zolteKartkiGospodarz || 0,
      zolteKartkiGosc: mecz.zolteKartkiGosc || 0,
      czerwoneKartkiGospodarz: mecz.czerwoneKartkiGospodarz || 0,
      czerwoneKartkiGosc: mecz.czerwoneKartkiGosc || 0,
    });
  };

  const handleSave = async (meczId) => {
    try {
      const meczRef = doc(db, "users", user.uid, "mecze", meczId);
      await updateDoc(meczRef, {
        wynikGospodarz: editData.wynikGospodarz ? parseInt(editData.wynikGospodarz) : null,
        wynikGosc: editData.wynikGosc ? parseInt(editData.wynikGosc) : null,
        zolteKartkiGospodarz: parseInt(editData.zolteKartkiGospodarz) || 0,
        zolteKartkiGosc: parseInt(editData.zolteKartkiGosc) || 0,
        czerwoneKartkiGospodarz: parseInt(editData.czerwoneKartkiGospodarz) || 0,
        czerwoneKartkiGosc: parseInt(editData.czerwoneKartkiGosc) || 0,
      });

      const updatedMecze = mecze.map(m => 
        m.id === meczId 
          ? { ...m, ...editData }
          : m
      );
      setMecze(updatedMecze);
      applyFiltersAndSort(updatedMecze, filters, sortBy);
      setEditingId(null);
      alert("✅ Mecz zaktualizowany!");
    } catch (error) {
      console.error("Błąd:", error);
      alert("❌ Błąd podczas aktualizacji meczu");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleTogglePlacone = async (meczId, currentStatus) => {
    try {
      const meczRef = doc(db, "users", user.uid, "mecze", meczId);
      const newStatus = currentStatus === "T" ? "N" : "T";
      
      await updateDoc(meczRef, {
        zaplacone: newStatus,
      });

      const updatedMecze = mecze.map(m => 
        m.id === meczId 
          ? { ...m, zaplacone: newStatus }
          : m
      );
      setMecze(updatedMecze);
      applyFiltersAndSort(updatedMecze, filters, sortBy);
      
      const statusText = newStatus === "T" ? "Zapłacone" : "Nieopłacone";
      alert(`✅ Status zmieniony na: ${statusText}`);
    } catch (error) {
      console.error("Błąd:", error);
      alert("❌ Błąd podczas zmiany statusu");
    }
  };

  const handleDelete = async (meczId) => {
    if (window.confirm("⚠️ Na pewno chcesz usunąć ten mecz?")) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "mecze", meczId));
        const updatedMecze = mecze.filter(m => m.id !== meczId);
        setMecze(updatedMecze);
        applyFiltersAndSort(updatedMecze, filters, sortBy);
        alert("✅ Mecz usunięty!");
      } catch (error) {
        console.error("Błąd:", error);
        alert("❌ Błąd podczas usuwania meczu");
      }
    }
  };
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

const handleGeneratePDF = (mecz) => {
  const pdfData = mapMeczToPdfData(mecz);
  generatePDF(pdfData, () => {});
};

 const totalKasa = filteredMecze.reduce((sum, m) => sum + (parseFloat(m.kasa) || 0), 0);
  const totalPodatek = filteredMecze.reduce((sum, m) => sum + (parseFloat(m.podatek) || 0), 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Ładowanie meczów…</p>
      </div>
    );
  }

  return (
    <div className="matches-list-container">
      
    <div className="list-summary">
          <div className="summary-item">
            <span className="summary-label">💰 Suma kasy:</span>
            <span className="summary-value">{totalKasa.toFixed(2)} zł</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🧾 Suma podatku:</span>
            <span className="summary-value summary-value--tax">{totalPodatek.toFixed(2)} zł</span>
          </div>
         
        </div>
      {mecze.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>Brak meczów</h2>
          <p>Dodaj swój pierwszy mecz aby go tutaj zobaczyć</p>
          <button 
            className="btn-add-match"
            onClick={() => navigate("/add-match")}
          >
            + Dodaj Mecz
          </button>
        </div>
      ) : (
        <>
          {/* FILTERS & SORT SECTION */}
          <div className="filters-sort-container">
            <button 
              className="btn-toggle-filters"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "🔼 Ukryj filtry" : "🔽 Pokaż filtry"}
            </button>

            {showFilters && (
              <div className="filters-panel">
                <div className="filters-grid">
                  <div className="filter-group">
                    <label htmlFor="team">Drużyna:</label>
                    <input
                      type="text"
                      id="team"
                      name="team"
                      value={filters.team}
                      onChange={handleFilterChange}
                      placeholder="Szukaj drużyny..."
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="gospodarz">Gospodarz:</label>
                    <input
                      type="text"
                      id="gospodarz"
                      name="gospodarz"
                      value={filters.gospodarz}
                      onChange={handleFilterChange}
                      placeholder="Szukaj gospodarza..."
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="gosc">Gość:</label>
                    <input
                      type="text"
                      id="gosc"
                      name="gosc"
                      value={filters.gosc}
                      onChange={handleFilterChange}
                      placeholder="Szukaj gościa..."
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="liga">Liga:</label>
                    <input
                      type="text"
                      id="liga"
                      name="liga"
                      value={filters.liga}
                      onChange={handleFilterChange}
                      placeholder="Szukaj ligi..."
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="sedzia">Sędzia:</label>
                    <input
                      type="text"
                      id="sedzia"
                      name="sedzia"
                      value={filters.sedzia}
                      onChange={handleFilterChange}
                      placeholder="Szukaj sędziego..."
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="nrMeczu">Nr meczu:</label>
                    <input
                      type="text"
                      id="nrMeczu"
                      name="nrMeczu"
                      value={filters.nrMeczu}
                      onChange={handleFilterChange}
                      placeholder="Nr meczu..."
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="dataFrom">Data od:</label>
                    <input
                      type="date"
                      id="dataFrom"
                      name="dataFrom"
                      value={filters.dataFrom}
                      onChange={handleFilterChange}
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="dataTo">Data do:</label>
                    <input
                      type="date"
                      id="dataTo"
                      name="dataTo"
                      value={filters.dataTo}
                      onChange={handleFilterChange}
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="zaplacone">Zapłacone:</label>
                    <select
                      id="zaplacone"
                      name="zaplacone"
                      value={filters.zaplacone}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="all">Wszystkie</option>
                      <option value="T">Zapłacone</option>
                      <option value="N">Nieopłacone</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="delegacja">Płatność:</label>
                    <select
                      id="delegacja"
                      name="delegacja"
                      value={filters.delegacja}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="all">Wszystkie</option>
                      <option value="delegacja">Delegacja</option>
                      <option value="edelegacja">Edelegacja</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="runda">Runda:</label>
                    <select
                      id="runda"
                      name="runda"
                      value={filters.runda}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="all">Wszystkie</option>
                      <option value="jesienna">Jesienna</option>
                      <option value="wiosenna">Wiosenna</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="sezon">Sezon:</label>
                    <select
                      id="sezon"
                      name="sezon"
                      value={filters.sezon}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="all">Wszystkie</option>
                      {[...new Set(
                        mecze.map((m) => m.sezon || getRundaSezon(m.data).sezon).filter(Boolean)
                      )].sort().reverse().map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="sortBy">Sortuj:</label>
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={handleSortChange}
                      className="filter-select"
                    >
                      <option value="data-desc">Data (najnowsze)</option>
                      <option value="data-asc">Data (najstarsze)</option>
                      <option value="nazwa-asc">Nazwa (A-Z)</option>
                      <option value="nazwa-desc">Nazwa (Z-A)</option>
                      <option value="liga-asc">Liga (A-Z)</option>
                      <option value="liga-desc">Liga (Z-A)</option>
                      <option value="kasa-asc">Kasa (rosnąco)</option>
                      <option value="kasa-desc">Kasa (malejąco)</option>
                    </select>
                  </div>
                </div>

                <div className="filters-actions">
                  <button className="btn-clear-filters" onClick={clearFilters}>
                    🗑️ Wyczyść filtry
                  </button>
                  <span className="results-count">
                    Wyników: {filteredMecze.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MODAL NA TELEFONIE */}
          {isMobile && expandedId && (
            <div className="expanded-modal">
              <button className="btn-close-modal" onClick={() => toggleExpanded(expandedId)}>
                ✕
              </button>
              <div className="expanded-modal-content match-card expanded-full">
                {filteredMecze.map((mecz) => 
                  expandedId === mecz.id && editingId !== mecz.id ? (
                    <div key={mecz.id}>
                      <div className="match-header">
                        <div className="teams-row">
                          <div className="team">
                            <span className="team-name">{mecz.gospodarz}</span>
                            <span className="team-label">Gospodarz</span>
                          </div>
                          <div className="vs">VS</div>
                          <div className="team">
                            <span className="team-name">{mecz.gosc}</span>
                            <span className="team-label">Gość</span>
                          </div>
                        </div>
                      </div>

                      <div className="match-score">
                        <div className="score-display">
                          <span className="score">{mecz.wynikGospodarz !== null ? mecz.wynikGospodarz : "-"}</span>
                          <span className="score-separator">:</span>
                          <span className="score">{mecz.wynikGosc !== null ? mecz.wynikGosc : "-"}</span>
                        </div>
                      </div>

                      <div className="match-stats">
                        <div className="stats-grid">
                          <div className="stat-column">
                            <span className="stat-header">Żółte <br></br>Kartki</span>
                            <div className="stat-values">
                              <span className="stat-value-yellow">{mecz.zolteKartkiGospodarz || 0}</span>
                              <span className="stat-separator">-</span>
                              <span className="stat-value-yellow">{mecz.zolteKartkiGosc || 0}</span>
                            </div>
                          </div>
                          <div className="stat-column">
                            <span className="stat-header">Czerwone Kartki</span>
                            <div className="stat-values">
                              <span className="stat-value-red">{mecz.czerwoneKartkiGospodarz || 0}</span>
                              <span className="stat-separator">-</span>
                              <span className="stat-value-red">{mecz.czerwoneKartkiGosc || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="match-details">
                        <div className="detail-item">
                          <span className="detail-label">Liga:</span>
                          <span className="detail-value">{mecz.liga}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Sędzia:</span>
                          <span className="detail-value">{mecz.glowny}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Data:</span>
                          <span className="detail-value">
                            {new Date(mecz.data).toLocaleDateString("pl-PL")}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Kasa:</span>
                          <span className="detail-value">{mecz.kasa || "-"} zł</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Nr meczu:</span>
                          <span className="detail-value">{mecz.numer_meczu}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Runda:</span>
                          <span className="detail-value">
                            {mecz.runda || getRundaSezon(mecz.data).runda || "—"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Sezon:</span>
                          <span className="detail-value">
                            {mecz.sezon || getRundaSezon(mecz.data).sezon || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="match-footer">
                        {mecz.delegacja === 1 && (
                          <span className="badge badge-delegacja">Delegacja</span>
                        )}
                        <span className={`badge ${mecz.zaplacone === "T" ? "badge-paid" : "badge-unpaid"}`}>
                          {mecz.zaplacone === "T" ? "✓ Zapłacone" : "○ Nieopłacone"}
                        </span>
                      </div>

                      <div className="match-actions">
                        <button 
                          className="btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(mecz);
                          }}
                        >
                          ✏️ Edytuj
                        </button>
                        <button 
                          className={`btn-payment ${mecz.zaplacone === "T" ? "btn-paid" : "btn-unpaid"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePlacone(mecz.id, mecz.zaplacone);
                          }}
                        >
                          {mecz.zaplacone === "T" ? "✓ Zapłacone" : "○ Nieopłacone"}
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(mecz.id);
                          }}
                        >
                          🗑️ Usuń
                        </button>
                        {mecz.delegacja === 1 && (
                          <button
                            className="btn-pdf"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGeneratePDF(mecz);
                            }}
                          >
                            📄 PDF
  </button>
)}
                      </div>
                    </div>
                  ) : null
                )}

                {expandedId && editingId === expandedId && (
                  <div className="edit-mode">
                    <div className="edit-section">
                      <h4>Wyniki</h4>
                      <div className="edit-row">
                        <div className="edit-group">
                          <label>Gospodarz</label>
                          <input
                            type="number"
                            min="0"
                            value={editData.wynikGospodarz}
                            onChange={(e) => setEditData({...editData, wynikGospodarz: e.target.value})}
                            className="edit-input"
                          />
                        </div>
                        <div className="edit-group">
                          <label>Gość</label>
                          <input
                            type="number"
                            min="0"
                            value={editData.wynikGosc}
                            onChange={(e) => setEditData({...editData, wynikGosc: e.target.value})}
                            className="edit-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="edit-section">
                      <h4>Żółte Kartki</h4>
                      <div className="edit-row">
                        <div className="edit-group">
                          <label>Gospodarz</label>
                          <input
                            type="number"
                            min="0"
                            value={editData.zolteKartkiGospodarz}
                            onChange={(e) => setEditData({...editData, zolteKartkiGospodarz: e.target.value})}
                            className="edit-input yellow-input"
                          />
                        </div>
                        <div className="edit-group">
                          <label>Gość</label>
                          <input
                            type="number"
                            min="0"
                            value={editData.zolteKartkiGosc}
                            onChange={(e) => setEditData({...editData, zolteKartkiGosc: e.target.value})}
                            className="edit-input yellow-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="edit-section">
                      <h4>Czerwone Kartki</h4>
                      <div className="edit-row">
                        <div className="edit-group">
                          <label>Gospodarz</label>
                          <input
                            type="number"
                            min="0"
                            value={editData.czerwoneKartkiGospodarz}
                            onChange={(e) => setEditData({...editData, czerwoneKartkiGospodarz: e.target.value})}
                            className="edit-input red-input"
                          />
                        </div>
                        <div className="edit-group">
                          <label>Gość</label>
                          <input
                            type="number"
                            min="0"
                            value={editData.czerwoneKartkiGosc}
                            onChange={(e) => setEditData({...editData, czerwoneKartkiGosc: e.target.value})}
                            className="edit-input red-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="edit-actions">
                      <button 
                        className="btn-save"
                        onClick={() => handleSave(expandedId)}
                      >
                        ✓ Zapisz
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={handleCancel}
                      >
                        ✕ Anuluj
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GRID Z KAFELKAMI */}
          {filteredMecze.length === 0 ? (
            <div className="no-results">
              <p>Brak wyników dla wybranych filtrów 🔍</p>
              <button className="btn-clear-filters" onClick={clearFilters}>
                Wyczyść filtry
              </button>
            </div>
          ) : (
            <div className="matches-grid">
              {filteredMecze.map((mecz) => (
                <div 
                  key={mecz.id} 
                  className={`match-card ${isMobile ? "match-compact-card" : "match-desktop-expanded"}`}
                >
                  {editingId === mecz.id ? (
                    <div className="edit-mode">
                      <div className="edit-section">
                        <h4>Wyniki</h4>
                        <div className="edit-row">
                          <div className="edit-group">
                            <label>Gospodarz</label>
                            <input
                              type="number"
                              min="0"
                              value={editData.wynikGospodarz}
                              onChange={(e) => setEditData({...editData, wynikGospodarz: e.target.value})}
                              className="edit-input"
                            />
                          </div>
                          <div className="edit-group">
                            <label>Gość</label>
                            <input
                              type="number"
                              min="0"
                              value={editData.wynikGosc}
                              onChange={(e) => setEditData({...editData, wynikGosc: e.target.value})}
                              className="edit-input"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="edit-section">
                        <h4>Żółte Kartki</h4>
                        <div className="edit-row">
                          <div className="edit-group">
                            <label>Gospodarz</label>
                            <input
                              type="number"
                              min="0"
                              value={editData.zolteKartkiGospodarz}
                              onChange={(e) => setEditData({...editData, zolteKartkiGospodarz: e.target.value})}
                              className="edit-input yellow-input"
                            />
                          </div>
                          <div className="edit-group">
                            <label>Gość</label>
                            <input
                              type="number"
                              min="0"
                              value={editData.zolteKartkiGosc}
                              onChange={(e) => setEditData({...editData, zolteKartkiGosc: e.target.value})}
                              className="edit-input yellow-input"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="edit-section">
                        <h4>Czerwone Kartki</h4>
                        <div className="edit-row">
                          <div className="edit-group">
                            <label>Gospodarz</label>
                            <input
                              type="number"
                              min="0"
                              value={editData.czerwoneKartkiGospodarz}
                              onChange={(e) => setEditData({...editData, czerwoneKartkiGospodarz: e.target.value})}
                              className="edit-input red-input"
                            />
                          </div>
                          <div className="edit-group">
                            <label>Gość</label>
                            <input
                              type="number"
                              min="0"
                              value={editData.czerwoneKartkiGosc}
                              onChange={(e) => setEditData({...editData, czerwoneKartkiGosc: e.target.value})}
                              className="edit-input red-input"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="edit-actions">
                        <button 
                          className="btn-save"
                          onClick={() => handleSave(mecz.id)}
                        >
                          ✓ Zapisz
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={handleCancel}
                        >
                          ✕ Anuluj
                        </button>
                      </div>
                    </div>
                  ) : isMobile ? (
                    <div className="match-compact" onClick={() => toggleExpanded(mecz.id)}>
                      <div className="match-compact-content">
                        <div className="compact-teams">
                          <span className="compact-team">{mecz.gospodarz}</span>
                          <span className="compact-vs">vs</span>
                          <span className="compact-team">{mecz.gosc}</span>
                        </div>
                        <div className="compact-meta">
                          <span className="compact-liga">{mecz.liga}</span>
                          <span className="compact-date">{new Date(mecz.data).toLocaleDateString("pl-PL")}</span>
                        </div>
                      </div>
                      <div className="expand-icon">▼</div>
                    </div>
                  ) : (
                    <>
                      <div className="match-header">
                        <div className="teams-row">
                          <div className="team">
                            <span className="team-name">{mecz.gospodarz}</span>
                            <span className="team-label">Gospodarz</span>
                          </div>
                          <div className="vs">VS</div>
                          <div className="team">
                            <span className="team-name">{mecz.gosc}</span>
                            <span className="team-label">Gość</span>
                          </div>
                        </div>
                      </div>

                      <div className="match-score">
                        <div className="score-display">
                          <span className="score">{mecz.wynikGospodarz !== null ? mecz.wynikGospodarz : "-"}</span>
                          <span className="score-separator">:</span>
                          <span className="score">{mecz.wynikGosc !== null ? mecz.wynikGosc : "-"}</span>
                        </div>
                      </div>

                      <div className="match-stats">
                        <div className="stats-grid">
                          <div className="stat-column">
                            <span className="stat-header">Żółte <br></br>Kartki</span>
                            <div className="stat-values">
                              <span className="stat-value-yellow">{mecz.zolteKartkiGospodarz || 0}</span>
                              <span className="stat-separator">-</span>
                              <span className="stat-value-yellow">{mecz.zolteKartkiGosc || 0}</span>
                            </div>
                          </div>
                          <div className="stat-column">
                            <span className="stat-header">Czerwone Kartki</span>
                            <div className="stat-values">
                              <span className="stat-value-red">{mecz.czerwoneKartkiGospodarz || 0}</span>
                              <span className="stat-separator">-</span>
                              <span className="stat-value-red">{mecz.czerwoneKartkiGosc || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="match-details">
                        <div className="detail-item">
                          <span className="detail-label">Liga:</span>
                          <span className="detail-value">{mecz.liga}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Sędzia:</span>
                          <span className="detail-value">{mecz.glowny}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Data:</span>
                          <span className="detail-value">
                            {new Date(mecz.data).toLocaleDateString("pl-PL")}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Kasa:</span>
                          <span className="detail-value">{mecz.kasa || "-"} zł</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Nr meczu:</span>
                          <span className="detail-value">{mecz.numer_meczu}</span>
                        </div>
                        
                      </div>

                      <div className="match-footer">
                        {mecz.delegacja === 1 && (
                          <span className="badge badge-delegacja m-1">Delegacja</span>
                        )}
                        <span className={`badge ${mecz.zaplacone === "T" ? "badge-paid" : "badge-unpaid"}`}>
                          {mecz.zaplacone === "T" ? "✓ Zapłacone" : "○ Nieopłacone"}
                        </span>
                      </div>

                      <div className="match-actions">
                        <button 
                          className="btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(mecz);
                          }}
                        >
                          ✏️ Edytuj
                        </button>
                        <button 
                          className={`btn-payment ${mecz.zaplacone === "T" ? "btn-paid" : "btn-unpaid"} m-1`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePlacone(mecz.id, mecz.zaplacone);
                          }}
                        >
                          {mecz.zaplacone === "T" ? "✓ Zapłacone" : "○ Nieopłacone"}
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(mecz.id);
                          }}
                        >
                          🗑️ Usuń
                        </button>
                        {mecz.delegacja === 1 && (
  <button
    className="btn-pdf"
    onClick={(e) => {
      e.stopPropagation();
      handleGeneratePDF(mecz);
    }}
  >
    📄 PDF
  </button>
)}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <button 
        className="btn-floating-add"
        onClick={() => navigate("/add-match")}
        title="Dodaj nowy mecz"
      >
        +
      </button>
    </div>
  );
}
