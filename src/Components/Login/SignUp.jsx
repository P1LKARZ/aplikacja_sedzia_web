import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export default function SignUp({ onSwitchForm }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = async () => {
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h2 className="text-center mb-4">Rejestracja</h2>
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

      <button className="btn btn-success w-100 btn-animate mb-3" onClick={register}>
        Zarejestruj
      </button>

      <div className="text-center">
        <button className="btn btn-link p-0" onClick={() => onSwitchForm("login")}>
          Masz już konto? Zaloguj się
        </button>
      </div>
    </>
  );
}
