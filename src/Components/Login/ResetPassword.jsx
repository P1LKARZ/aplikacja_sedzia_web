// src/components/ResetPasswordForm.jsx
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

export default function ResetPassword({ onSwitchForm }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Link do resetowania hasła został wysłany na Twój email.");
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setMessage("Nie znaleziono użytkownika o tym email.");
          break;
        case "auth/invalid-email":
          setMessage("Niepoprawny format email.");
          break;
        default:
          setMessage(err.message);
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ minWidth: "300px", maxWidth: "400px" }}>
        <h2 className="card-title text-center mb-4">Resetowanie hasła</h2>

        {message && (
          <div
            className={`alert ${message.includes("wysłany") ? "alert-success" : "alert-danger"}`}
          >
            {message}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Twój email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="btn btn-warning w-100 mb-2" onClick={handleReset}>
          Wyślij link resetujący
        </button>

        <div className="text-center mt-2">
          <button
            className="btn btn-link p-0"
            onClick={() => onSwitchForm("login")}
          >
            Powrót do logowania
          </button>
        </div>
      </div>
    </div>
  );
}
