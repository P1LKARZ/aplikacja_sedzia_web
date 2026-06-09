import { useState } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../../firebase";

export default function Login({ onSwitchForm }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    setError("");
    try {
      // Ustaw persistence na LOCAL - użytkownik zostanie zalogowany nawet po zamknięciu przeglądarki
      await setPersistence(auth, browserLocalPersistence);
      
      // Zaloguj użytkownika
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h2 className="text-center mb-4">Logowanie</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <input
        type="email"
        className="form-control mb-3 form-input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="form-control mb-3 form-input"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-primary w-100 btn-animate mb-3" onClick={login}>
        Zaloguj
      </button>

      <div className="text-center">
        <button className="btn btn-link p-0" onClick={() => onSwitchForm("signup")}>
          Nie masz konta? Zarejestruj się
        </button>
      </div>
    </>
  );
}