import { Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import { ToastContainer } from "react-toastify";
import { Helmet } from "react-helmet";
import GitlabCallback from "./pages/GitlabCallBack";
import MainLayout from "./pages/layouts/MainLayout";
import Project from "./pages/project";
import Commits from "./pages/Commits";
import MergeRequest from "./pages/MergeRequests";
import Enviroments from "./pages/Enviroments";

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
        <Route element={<MainLayout/ >}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Project />} />
          <Route path="/commits" element={<Commits />} />
          <Route path="/merge-requests" element={<MergeRequest />} />
          <Route path="/environments" element={<Enviroments />} />
          <Route path="/auth/gitlab/callback" element={<GitlabCallback />} />
        </Route>
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