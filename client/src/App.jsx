import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentsPage from "./pages/StudentsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentFormPage from "./pages/StudentFormPage";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/students" element={<StudentsPage />} />

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/students/new" element={<StudentFormPage />} />
            <Route path="/students/:id/edit" element={<StudentFormPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/students" replace />} />
    </Routes>
  );
}

export default App;
