import RequestBar from "./components/RequestBar";
import "./App.css";
import logo from "./assets/Logo.png";
import Signup from "./Signup";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./login";
import Landing from "./Landing";
function ReqLab() {
  const navigate = useNavigate();

  async function handleLogout() {
    const response = await fetch("https://reqlab-backend.onrender.com/api/logout", {
      method: "POST",
      credentials: "include"
    });

    if (response.ok) {
      navigate("/");
    }
  }

  return (
    <>
      <div className="dashboard-header">
        <div className="brand">
          <img src={logo} alt="ReqLab logo" className="logo" />
          <h1 className="app-title">ReqLab</h1>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <RequestBar />
    </>
  );
}
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("https://reqlab-backend.onrender.com/api/me", {
      credentials: "include"
    })
      .then((response) => {
        console.log("ME STATUS:", response.status);

        if (response.ok) {
          setAuthenticated(true);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.log("ME ERROR:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/" />;
  }

  return children;
}
function App() {
  return (
    <div className = "app">

    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <ReqLab />
            </ProtectedRoute>
          }
          />
      </Routes>
    </BrowserRouter>
          </div>
  );
}

export default App;