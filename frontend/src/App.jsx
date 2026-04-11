import { Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import { Helmet } from "react-helmet";
import GitlabCallback from "./pages/GitlabCallBack";
import MainLayout from "./pages/layouts/MainLayout";
import Project from "./pages/Project";
import Commits from "./pages/Commits";
import MergeRequest from "./pages/MergeRequests";
import Enviroments from "./pages/Enviroments";
import Profile from "./components/Profile";
import ProjectDetails from "./pages/ProjectDetails";
import FileViewer from "./pages/FileViewer";

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
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/commits" element={<Commits />} />
          <Route path="/merge-requests" element={<MergeRequest />} />
          <Route path="/environments" element={<Enviroments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth/gitlab/callback" element={<GitlabCallback />} />
          <Route path="/project/:id/file" element={<FileViewer />} />
        </Route>
      </Routes>
      
    </>
  );
}

export default App;