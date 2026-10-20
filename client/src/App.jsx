import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentsPage from "./pages/StudentsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/students" element={<StudentsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/students" replace />} />
    </Routes>
  );
}

export default App;