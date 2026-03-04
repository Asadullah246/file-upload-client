import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminLayout } from "./components/AdminLayout";
import { MaintenanceGuard } from "./components/MaintenanceGuard";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { DownloadPage } from "./pages/Download";
import { Settings } from "./pages/Settings";
import { CloudControls } from "./pages/CloudControls";

function App() {
  return (
    <MaintenanceGuard>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/download/:id" element={<DownloadPage />} />

            {/* Protected Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/cloud-controls" element={<CloudControls />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MaintenanceGuard>
  );
}

export default App;
