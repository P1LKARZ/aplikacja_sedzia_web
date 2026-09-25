import ekwiwalenty from "../data/ekwiwalenty";

const getEkwiwalentByLiga = (liga) => {
  return Object.values(ekwiwalenty).find(
    (e) =>
      e.ligaSkrocona?.toLowerCase() === liga?.toLowerCase() ||
      e.liga?.toLowerCase() === liga?.toLowerCase(),
  );
};

export const mapMeczToPdfData = (mecz) => {
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
