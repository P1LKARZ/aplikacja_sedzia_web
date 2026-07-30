import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Home.css";

export default function Home() {
  const [user, setUser] = useState(null);
  const [statsVisible, setStatsVisible] = useState(true);
  const [stats, setStats] = useState({
    avgZolte: null,
    avgCzerwone: null,
    totalZolte: null,
    totalCzerwone: null,
    totalMecze: null,
    wszystkieMecze: null,
    wszystkieLacznie: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchStats(currentUser.uid);
      } else {
        setStats({
          avgZolte: null,
          avgCzerwone: null,
          totalZolte: null,
          totalCzerwone: null,
          totalMecze: null,
          wszystkieMecze: null,
          wszystkieLacznie: null,
        });
      }
    });
    return () => unsub();
  }, []);

  const fetchStats = async (uid) => {
    try {
      const querySnapshot = await getDocs(collection(db, "users", uid, "mecze"));
      const mecze = [];
      querySnapshot.forEach((doc) => mecze.push(doc.data()));

      const meczZWynikiem = mecze.filter(
        (m) =>
          m.wynikGospodarz !== null && m.wynikGospodarz !== undefined &&
          m.wynikGosc !== null && m.wynikGosc !== undefined
      );

      if (meczZWynikiem.length === 0) {
        setStats({
          avgZolte: 0,
          avgCzerwone: 0,
          totalZolte: 0,
          totalCzerwone: 0,
          totalMecze: 0,
          wszystkieMecze: mecze.length,
          wszystkieLacznie: mecze.length + 377,
        });
        return;
      }

      const totalZolte = meczZWynikiem.reduce(
        (sum, m) => sum + (m.zolteKartkiGospodarz || 0) + (m.zolteKartkiGosc || 0), 0
      );
      const totalCzerwone = meczZWynikiem.reduce(
        (sum, m) => sum + (m.czerwoneKartkiGospodarz || 0) + (m.czerwoneKartkiGosc || 0), 0
      );

      setStats({
        avgZolte: (totalZolte / meczZWynikiem.length).toFixed(2),
        avgCzerwone: (totalCzerwone / meczZWynikiem.length).toFixed(2),
        totalZolte,
        totalCzerwone,
        totalMecze: meczZWynikiem.length,
        wszystkieMecze: mecze.length,
        wszystkieLacznie: mecze.length + 377,
      });
    } catch (error) {
      console.error("Błąd pobierania statystyk:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="modern-navbar">
      <div className="navbar-content">

        <div className="navbar-top-row">
          <div className="navbar-left">
            {user ? (
              <h5 className="mb-0 fw-bold gradient-user-text">
                Witaj, <span className="gradient-user-text">{user.email.split('@')[0]}</span>
              </h5>
            ) : (
              <h5 className="mb-0 text-white fw-bold">🔐 Nie jesteś zalogowany</h5>
            )}
          </div>
          <div className="navbar-right">
            {user && (
              <>
                <button onClick={() => navigate("/matches")} className="btn-nav-matches">
                  Moje Mecze
                </button>
                <button onClick={() => navigate("/garmin")} className="btn-nav-matches">
                  PIN
                </button>
                <button onClick={handleLogout} className="btn-modern-logout position-relative overflow-hidden">
                  <span className="btn-text">Wyloguj</span>
                  <div className="btn-glow-effect"></div>
                </button>
              </>
            )}
          </div>
        </div>

        {user && stats.avgZolte !== null && (
          <>
            <div
              className="navbar-stats-toggle"
              onClick={() => setStatsVisible(!statsVisible)}
            >
              <span className="toggle-label">📊 Statystyki</span>
              <span className="toggle-icon">{statsVisible ? "▲" : "▼"}</span>
            </div>

            {statsVisible && (
              <div className="navbar-stats">

                <div className="navbar-stat-group stat-kariera">
                  <span className="navbar-stat-group-label">Kariera</span>
                  <div className="navbar-stat-row">
                    <div className="navbar-stat-item">
                      <span className="navbar-stat-icon">🏆</span>
                      <span className="navbar-stat-value">{stats.wszystkieLacznie}</span>
                    </div>
                  </div>
                </div>

                <div className="navbar-stats-separator" />

                <div className="navbar-stat-group stat-runda">
                  <span className="navbar-stat-group-label">Ilość w rundzie</span>
                  <div className="navbar-stat-row">
                    <div className="navbar-stat-item">
                      <span className="navbar-stat-icon">📋</span>
                      <span className="navbar-stat-value">{stats.wszystkieMecze}</span>
                    </div>
                  </div>
                </div>

                <div className="navbar-stats-separator" />

                <div className="navbar-stat-group stat-glowny">
                  <span className="navbar-stat-group-label">Sędzia Główny</span>
                  <div className="navbar-stat-row">
                    <div className="navbar-stat-item">
                      <span className="navbar-stat-icon">⚽</span>
                      <span className="navbar-stat-value">{stats.totalMecze}</span>
                    </div>
                  </div>
                </div>

                <div className="navbar-stats-separator" />

                <div className="navbar-stat-group stat-srednia">
                  <span className="navbar-stat-group-label">Średnia / mecz</span>
                  <div className="navbar-stat-row">
                    <div className="navbar-stat-item">
                      <span className="navbar-stat-icon">🟨</span>
                      <span className="navbar-stat-value">{stats.avgZolte}</span>
                    </div>
                    <div className="navbar-stat-divider" />
                    <div className="navbar-stat-item">
                      <span className="navbar-stat-icon">🟥</span>
                      <span className="navbar-stat-value">{stats.avgCzerwone}</span>
                    </div>
                  </div>
                </div>

                <div className="navbar-stats-separator" />

                <div className="navbar-stat-group stat-lacznie">
                  <span className="navbar-stat-group-label">Łącznie</span>
                  <div className="navbar-stat-row">
                    <div className="navbar-stat-item">
                      <span className="navbar-stat-icon">🟨</span>
                      <span className="navbar-stat-value">{stats.totalZolte}</span>
                    </div>
                    <div className="navbar-stat-divider" />
                    <div className="navbar-stat-item">
                      <span className="navbar-stat-icon">🟥</span>
                      <span className="navbar-stat-value">{stats.totalCzerwone}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}