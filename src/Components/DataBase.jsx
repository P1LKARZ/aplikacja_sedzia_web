import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Database() {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState("");

  const user = auth.currentUser;

  // kolekcja tylko dla zalogowanego użytkownika
  const collectionRef = user ? collection(db, "users", user.uid, "items") : null;

  // pobieranie danych
  const fetchData = async () => {
    if (!user) return;
    try {
      const querySnapshot = await getDocs(collectionRef);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setData(items);
    } catch (err) {
      setError("Błąd przy pobieraniu danych: " + err.message);
    }
  };

  // dodawanie nowego itemu
  const addItem = async () => {
    if (!user || !newItem.trim()) return;
    setError("");
    try {
      await addDoc(collectionRef, { name: newItem });
      setNewItem("");
      fetchData();
    } catch (err) {
      setError("Błąd przy dodawaniu itemu: " + err.message);
    }
  };

  // usuwanie itemu
  const deleteItem = async (id) => {
    if (!user) return;
    setError("");
    try {
      await deleteDoc(doc(db, "users", user.uid, "items", id));
      fetchData();
    } catch (err) {
      setError("Błąd przy usuwaniu itemu: " + err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]); // odśwież przy zmianie użytkownika

  if (!user) return <p>Musisz być zalogowany, aby zobaczyć dane.</p>;

  return (
    <div>
      <h2>Twoje dane w Firestore</h2>
      <input
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder="Nowy item"
      />
      <button onClick={addItem}>Dodaj</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {item.name}{" "}
            <button onClick={() => deleteItem(item.id)}>Usuń</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
