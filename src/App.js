import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";

import Home from "./Components/Form/Home/Home";
import MeczForm from "./Components/Form/MeczForm/MeczForm";
import AuthPage from "./Components/Login/AuthPage";
import MatchesList from "./Components/MatchesList/MatchesList";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Ładowanie…</p>
      </div>
    );
  }

  return (
    <Router>
      {user ? (
        <>
          <Home />
          <Routes>
            <Route path="/" element={<MeczForm />} />
            <Route path="/matches" element={<MatchesList />} />
            <Route path="/add-match" element={<MeczForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="*" element={<AuthPage />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
