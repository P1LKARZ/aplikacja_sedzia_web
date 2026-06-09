// src/hooks/useMeczFormData.js
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const DRUZYNY_PATH = ["public", "druzyny", "info"];
const SEDZIOWIE_PATH = ["public", "sedziowie", "info"];
const POZIOMY_PATH = ["public", "poziom", "info"];

export function MeczFormData() {
  const [druzyny, setDruzyny] = useState([]);
  const [poziomy, setPoziomy] = useState([]);
  const [sedziowie, setSedziowie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [druzynySnap, sedziowieSnap, poziomySnap] = await Promise.all([
          getDocs(collection(db, ...DRUZYNY_PATH)),
          getDocs(collection(db, ...SEDZIOWIE_PATH)),
          getDocs(collection(db, ...POZIOMY_PATH)),
        ]);

        setDruzyny(druzynySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setSedziowie(sedziowieSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setPoziomy(poziomySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.message || "Błąd podczas ładowania danych");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Funkcja do walidacji i zwracania listy brakujących pól
  const validateForm = (formData) => {
    const emptyFields = [];

    if (!formData.gospodarz) emptyFields.push("Gospodarz");
    if (!formData.gosc) emptyFields.push("Gość");
    if (!formData.liga) emptyFields.push("Liga");
    if (!formData.sedzia) emptyFields.push("Sędzia główny");
    if (!formData.data) emptyFields.push("Data meczu");
    if (!formData.numerMeczu) emptyFields.push("Numer meczu");

    return emptyFields;
  };

  return { druzyny, poziomy, sedziowie, loading, error, validateForm };
}
