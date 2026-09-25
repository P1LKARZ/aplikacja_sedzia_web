import { getRundaSezon } from "./getRundaSezon";

export function filterMatches(data, currentFilters, currentSort) {
  let filtered = [...data];

  // FILTRY
  if (currentFilters.team) {
    filtered = filtered.filter(
      (m) =>
        m.gospodarz
          ?.toLowerCase()
          .includes(currentFilters.team.toLowerCase()) ||
        m.gosc?.toLowerCase().includes(currentFilters.team.toLowerCase()),
    );
  }

  for (const [filter, field] of Object.entries({
    gospodarz: "gospodarz",
    gosc: "gosc",
    liga: "liga",
    sedzia: "glowny",
  })) {
    if (currentFilters[filter]) {
      const value = currentFilters[filter].toLowerCase();
      filtered = filtered.filter((m) =>
        m[field]?.toLowerCase().includes(value),
      );
    }
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
      m.numer_meczu?.toString().includes(currentFilters.nrMeczu),
    );
  }

  if (currentFilters.zaplacone !== "all") {
    filtered = filtered.filter((m) => m.zaplacone === currentFilters.zaplacone);
  }

  if (currentFilters.delegacja !== "all") {
    const isDelegacja = currentFilters.delegacja === "delegacja" ? 1 : 0;
    filtered = filtered.filter((m) => m.delegacja === isDelegacja);
  }

  // Filtr rundy – tablica wybranych rund; pusta = wszystkie
  if (currentFilters.rundy && currentFilters.rundy.length > 0) {
    filtered = filtered.filter((m) => {
      const r = m.runda || getRundaSezon(m.data).runda;
      return currentFilters.rundy.includes(r);
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
          `${b.gospodarz} vs ${b.gosc}`,
        );
      case "nazwa-desc":
        return `${b.gospodarz} vs ${b.gosc}`.localeCompare(
          `${a.gospodarz} vs ${a.gosc}`,
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

  return filtered;
}
