<<<<<<< HEAD
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
=======
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { NavLink, Link, useLocation } from "react-router-dom";
import Icon from "../../UI/Icon";
import "./Home.css";

const navigation = [
  { to: "/", label: "Pulpit", icon: "grid" },
  { to: "/matches", label: "Moje mecze", icon: "ball" },
  { to: "/wyniki-zegarka", label: "Wyniki z zegarka", icon: "watch" },
  { to: "/garmin", label: "PIN-y zegarka", icon: "pin" },
];

export default function Home({ user, children }) {
  const [error, setError] = useState("");
  const { pathname } = useLocation();
  const name = user?.email?.split("@")[0] || "Sędzia";
  const title = navigation.find(item => item.to === pathname)?.label || (pathname === "/mecz" ? "Szczegóły meczu" : "Dodaj mecz");
  const logout = async () => {
    try { await signOut(auth); } catch { setError("Nie udało się wylogować. Spróbuj ponownie."); }
  };
  return (
    <div className="referee-app">
      <a className="skip-link" href="#page-content">Przejdź do treści</a>
      <aside className="sidebar">
        <Link className="brand" to="/"><span className="brand-mark"><Icon name="ball" size={25} /></span><span>Po gwizdku<span className="brand-caption">TWÓJ PANEL SĘDZIEGO</span></span></Link>
        <div className="nav-caption">TWOJA PRZESTRZEŃ</div>
        <nav aria-label="Menu główne">
          {navigation.map(item => <NavLink key={item.to} to={item.to} end className={({isActive}) => `side-link${isActive ? ' active' : ''}`}><Icon name={item.icon} /><span>{item.label}</span></NavLink>)}
        </nav>
        <Link className="side-add" to="/add-match"><Icon name="plus" />Dodaj mecz</Link>
        <div className="sidebar-note"><Icon name="watch" size={28} /><strong>Z boiska do panelu.</strong><p>Wyniki i zdarzenia z zegarka, w jednym miejscu.</p><Link to="/wyniki-zegarka">Zobacz wyniki <Icon name="arrow" size={16} /></Link></div>
        <div className="sidebar-account"><span className="avatar">{name.slice(0,1).toUpperCase()}</span><div><strong>{name}</strong><span>Konto sędziego</span></div><button type="button" onClick={logout} aria-label="Wyloguj" title="Wyloguj"><Icon name="logout" /></button></div>
        {error && <p role="alert" className="logout-error">{error}</p>}
      </aside>
      <div className="app-workspace">
        <header className="workspace-header"><span>Panel sędziego <span className="breadcrumb-slash">/</span> <strong>{title}</strong></span><span className="workspace-date"><Icon name="calendar" size={16} />{new Date().toLocaleDateString("pl-PL", {day:"numeric", month:"long", year:"numeric"})}</span></header>
        <div id="page-content" className="page-content" tabIndex={-1}>{children}</div>
        <footer className="workspace-footer">Po gwizdku <span>Twój mecz. Twoje decyzje. Wszystko pod kontrolą.</span></footer>
      </div>
    </div>
  );
}
>>>>>>> 93909dd (panel admina)
