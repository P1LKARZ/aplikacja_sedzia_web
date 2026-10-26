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
