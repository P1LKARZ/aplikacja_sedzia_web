import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { auth, db } from "./firebase";

import MatchView from "./Components/MatchView/MatchView";
import Dashboard from "./Components/Dashboard/Dashboard";
import Home from "./Components/Form/Home/Home";
import MeczForm from "./Components/Form/MeczForm/MeczForm";
import AuthPage from "./Components/Login/AuthPage";
import MatchesList from "./Components/MatchesList/MatchesList";
import WatchResults from "./Components/WatchResults/WatchResults";
import Garmin from "./Components/Garmin/Garmin";

import AdminDashboard from "./Components/Admin/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          setRole(userData.role || "referee");
        } else {
          setRole("referee");
        }
      } catch (error) {
        console.error("Błąd pobierania roli użytkownika:", error);
        setRole("referee");
      }

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
        role === "admin" ? (
          // PANEL ADMINA
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />

            <Route
              path="*"
              element={<Navigate to="/admin" replace />}
            />
          </Routes>
        ) : (
          // PANEL SĘDZIEGO
          <Home user={user}>
            <Routes>
              <Route
                path="/"
                element={<Dashboard user={user} />}
              />

              <Route
                path="/matches"
                element={<MatchesList />}
              />

              <Route
                path="/add-match"
                element={<MeczForm />}
              />

              <Route
                path="/mecz"
                element={<MatchView />}
              />

              <Route
                path="/wyniki-zegarka"
                element={<WatchResults />}
              />

              <Route
                path="/garmin"
                element={<Garmin />}
              />

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </Home>
        )
      ) : (
        <Routes>
          <Route
            path="*"
            element={<AuthPage />}
          />
        </Routes>
      )}
    </Router>
  );
}

export default App;