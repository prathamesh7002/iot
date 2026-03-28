import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../Pages/Home/HomePage";
import HistoryPage from "../Pages/History/HistoryPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
