import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Icon from "../UI/Icon";

const money = value => value.toLocaleString("pl-PL", {style:"currency", currency:"PLN", maximumFractionDigits:0});
const dateLabel = value => new Date(value).toLocaleDateString("pl-PL", {day:"numeric", month:"long"});
// Zachowana liczba historycznych meczów z poprzedniej wersji aplikacji.
const HISTORICAL_MATCHES = 377;

export default function Dashboard({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getDocs(collection(db, "users", user.uid, "mecze"))
      .then(snapshot => { if (active) setMatches(snapshot.docs.map(doc => ({...doc.data(), id:doc.id}))); })
      .catch(() => { if (active) setError("Nie udało się pobrać meczów. Spróbuj ponownie."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.uid, retry]);
  const today = new Date(); today.setHours(0,0,0,0);
  const next = [...matches].filter(m => new Date(m.data) >= today).sort((a,b) => new Date(a.data)-new Date(b.data))[0];
  const recent = [...matches].sort((a,b) => new Date(b.data)-new Date(a.data)).slice(0,4);
  const unpaid = matches.filter(m => m.zaplacone !== "T");
  const played = matches.filter(m => m.wynikGospodarz !== null && m.wynikGospodarz !== undefined && m.wynikGospodarz !== "" && m.wynikGosc !== null && m.wynikGosc !== undefined && m.wynikGosc !== "");
  const yellow = matches.reduce((sum,m) => sum+(Number(m.zolteKartkiGospodarz)||0)+(Number(m.zolteKartkiGosc)||0),0);
  const red = matches.reduce((sum,m) => sum+(Number(m.czerwoneKartkiGospodarz)||0)+(Number(m.czerwoneKartkiGosc)||0),0);
  const name = user.email?.split("@")[0] || "Sędzio";
  const stats = [
    {label:"Mecze w bazie", value:matches.length, note:`${matches.length+HISTORICAL_MATCHES} łącznie z historią`, icon:"ball", tone:"green"},
    {label:"Do rozliczenia", value:money(unpaid.reduce((sum,m)=>sum+(Number(m.kasa)||0),0)), note:`Nieopłacone mecze: ${unpaid.length}`, icon:"wallet", tone:"blue"},
    {label:"Żółte kartki", value:yellow, note:`Średnio ${played.length ? (yellow/played.length).toFixed(2) : '0.00'} na mecz z wynikiem`, icon:"card", tone:"yellow"},
    {label:"Czerwone kartki", value:red, note:`Średnio ${played.length ? (red/played.length).toFixed(2) : '0.00'} na mecz z wynikiem`, icon:"card", tone:"red"},
  ];
  return <main className="dashboard">
    <div className="page-heading"><div><p className="eyebrow">DOBRZE CIĘ WIDZIEĆ</p><h1>Cześć, {name}<span className="heading-dot">.</span></h1><p>Wszystko, czego potrzebujesz przed i po meczu.</p></div><Link className="primary-action" to="/add-match"><Icon name="plus" />Dodaj mecz</Link></div>
    {error && <div className="dashboard-error" role="alert">{error} <button onClick={() => setRetry(value=>value+1)}>Ponów</button></div>}
    <section className="dashboard-stats" aria-label="Podsumowanie meczów" aria-busy={loading}>{stats.map(stat=><article className="metric-card" key={stat.label}><div className="metric-top"><span>{stat.label}</span><span className={`metric-icon ${stat.tone}`}><Icon name={stat.icon} /></span></div><strong className="metric-value">{loading || error ? '—' : stat.value}</strong><p>{loading ? 'Ładowanie danych…' : error ? 'Dane niedostępne' : stat.note}</p></article>)}</section>
    <div className="dashboard-feature-grid">
      <section className="next-match"><div className="pitch-art" aria-hidden="true"><i /><b /></div><div className="next-match-content"><span className="hero-badge"><span />TWÓJ NASTĘPNY GWIZDEK</span><h2>{loading ? 'Sprawdzamy terminarz…' : error ? 'Terminarz jest niedostępny' : next ? <>{next.gospodarz}<span className="versus">vs</span>{next.gosc}</> : <>Gotowy na<br />kolejny mecz?</>}</h2><p>{next && !loading && !error ? `${dateLabel(next.data)} · ${next.liga || 'Mecz'} · #${next.numer_meczu || '—'}` : 'Zaplanuj spotkanie. Resztę uporządkujesz tutaj.'}</p><Link to={next ? '/matches' : '/add-match'} className="hero-action">{next ? 'Przejdź do meczów' : 'Dodaj pierwszy lub kolejny mecz'}<Icon name="arrow" size={18} /></Link></div></section>
      <section className="watch-promo"><span className="watch-promo-icon"><Icon name="watch" size={32} /></span><span className="eyebrow">PO OSTATNIM GWIZDKU</span><h2>Zegarek pamięta.<br />Ty masz pełny obraz.</h2><p>Wyniki, kartki i chronologia zdarzeń. Wróć do zapisanych meczów z zegarka.</p><Link to="/wyniki-zegarka">Otwórz wyniki <Icon name="arrow" size={18} /></Link></section>
    </div>
    <section className="recent-panel"><div className="panel-heading"><div><h2>Ostatnio w terminarzu</h2><p>Twoje mecze, od najnowszej daty.</p></div><Link to="/matches">Wszystkie mecze <Icon name="arrow" size={16} /></Link></div>{loading ? <p className="panel-empty">Ładowanie meczów…</p> : error ? <p className="panel-empty">Lista będzie dostępna po ponownym pobraniu danych.</p> : !recent.length ? <div className="panel-empty"><Icon name="calendar" size={28} /><p>Twój terminarz jest jeszcze pusty.</p><Link to="/add-match">Dodaj mecz, aby zacząć</Link></div> : <div className="recent-list">{recent.map(m=><article className="recent-row" key={m.id}><span className="recent-date">{dateLabel(m.data)}</span><div className="recent-teams"><strong>{m.gospodarz} <span>—</span> {m.gosc}</strong><small>{m.liga || 'Mecz'} · #{m.numer_meczu || '—'}</small></div><span className={`payment-label ${m.zaplacone==='T' ? 'paid' : ''}`}>{m.zaplacone==='T' ? 'Rozliczony' : 'Do rozliczenia'}</span><strong className="recent-score">{m.wynikGospodarz ?? '–'} : {m.wynikGosc ?? '–'}</strong></article>)}</div>}</section>
  </main>;
}
