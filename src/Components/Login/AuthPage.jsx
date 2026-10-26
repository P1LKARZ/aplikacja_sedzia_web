import { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import "./AuthPage.css"; // plik z animacjami i dodatkowymi stylami

export default function AuthPage() {
  const [form, setForm] = useState("login"); // domyślnie login
  const [animating, setAnimating] = useState(false);

  const switchForm = (target) => {
    setAnimating(true);
    setTimeout(() => {
      setForm(target);
      setAnimating(false);
    }, 300); // czas trwania animacji w ms
  };

  return (
    <div className="auth-container d-flex justify-content-center align-items-center vh-100">
      <div className={`auth-card p-5 shadow-lg ${animating ? "fade-out" : "fade-in"}`}>
        {form === "login" && <Login onSwitchForm={switchForm} />}
        {form === "signup" && <SignUp onSwitchForm={switchForm} />}
      </div>
    </div>
  );
}
