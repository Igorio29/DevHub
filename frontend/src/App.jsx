import { Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import { ToastContainer } from "react-toastify";
import { Helmet } from "react-helmet";
import GitlabCallback from "./pages/GitlabCallBack";

function App() {
  return (
    <>
      <>
        <Helmet>
          <title>DevHub</title>
        </Helmet>
      </>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth/gitlab/callback" element={<GitlabCallback />} />
      </Routes>
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;