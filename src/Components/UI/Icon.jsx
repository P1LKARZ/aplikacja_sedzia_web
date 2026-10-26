const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  ball: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 8l4 3-2 5h-4l-2-5z M12 3v5 M3.5 9l4.5 2 M6 19l4-3 M18 19l-4-3 M20.5 9l-4.5 2',
  watch: 'M8 6V2h8v4 M8 18v4h8v-4 M7 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2 M12 9v3l2 1',
  pin: 'M8 3H5v18h3 M16 3h3v18h-3 M9 8h6 M9 12h6 M9 16h6',
  plus: 'M12 5v14 M5 12h14',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
  logout: 'M9 4H4v16h5 M9 12h12 M17 8l4 4-4 4',
  calendar: 'M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1 M8 2v6 M16 2v6 M4 10h16',
  card: 'M7 3h10v18H7z',
  wallet: 'M3 6h17v14H3z M3 6V3h14v3 M15 11h6v5h-6z',
};
export default function Icon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.ball} /></svg>;
}
