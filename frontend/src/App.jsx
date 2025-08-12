import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [page, setPage] = useState("default");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.slice(1) || "default";
    if (path !== page) {
      navigate(page === "default" ? "/" : `/${page}`);
    }
  }, [page]);

  useEffect(() => {
    const path = location.pathname.slice(1) || "default";
    if (path !== page) {
      setPage(path);
    }
  }, [location.pathname]);

  return (
    <div>
      <Navbar page={page} setPage={setPage} />
    </div>
  );
}

export default AppWrapper;
