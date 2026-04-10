import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { showError, showSuccess } from "../utils/toast";
import ParticlesBackground from "../components/ParticlesBackground";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));  
  console.log("USER LOCALSTORAGE:", localStorage.getItem("user"));
  const location = useLocation();
  useEffect(() => {
    console.log("Dashboard - State recebido:", location.state);
    if (location.state?.success) {
      showSuccess(location.state.success);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogout = () => {
    // Limpa o token ou dados de sessão se necessário
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <h1>Dashboard </h1>
  );
}