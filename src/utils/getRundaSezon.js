/**
 * Wyznacza rundę i sezon na podstawie daty meczu.
 *
 * Logika:
 *  - Runda jesienna: 1 lipca – 31 grudnia
 *  - Runda wiosenna: 1 stycznia – 30 czerwca
 *
 * Sezon rozgrywek obejmuje dwie rundy:
 *  - np. mecz z 09.09.2025 → runda jesienna, sezon 2025/2026
 *  - np. mecz z 15.03.2026 → runda wiosenna, sezon 2025/2026
 *
 * @param {string|Date} dataMeczu  - data meczu (string "YYYY-MM-DD" lub obiekt Date)
 * @returns {{ runda: string, sezon: string }}
 */
export function getRundaSezon(dataMeczu) {
  if (!dataMeczu) return { runda: "", sezon: "" };

  const d = new Date(dataMeczu);
  if (isNaN(d.getTime())) return { runda: "", sezon: "" };

  const month = d.getMonth() + 1; // 1–12
  const year = d.getFullYear();

  // Runda jesienna: lipiec–grudzień (miesiące 7–12)
  if (month >= 7) {
    return {
      runda: "jesienna",
      sezon: `${year}/${year + 1}`,
    };
  }

  // Runda wiosenna: styczeń–czerwiec (miesiące 1–6)
  return {
    runda: "wiosenna",
    sezon: `${year - 1}/${year}`,
  };
}
