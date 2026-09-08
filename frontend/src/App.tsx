import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectListPage } from "./pages/ProjectListPage";

function App() {
  return (
    // Routes: adres cubugundaki yola gore bu Route'lardan sadece biri
    // ayni anda render edilir.
    <Routes>
      {/* Kok adrese ("/") gelen kullanici hicbir sayfa gormeden
          dogrudan login'e yonlendirilir. */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login sayfasi - herkese acik, koruma yok. */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard'a girmeden once ProtectedRoute araya girer:
          token yoksa DashboardPage hic render edilmeden /login'e atilir. */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Proje listesi - Dashboard ile ayni sekilde ProtectedRoute ile sarili. */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectListPage />
          </ProtectedRoute>
        }
      />

      {/* Proje detay sayfasi - ":id" URL'den okunup ProjectDetailPage icinde
          useParams ile alinacak, o projenin kendisini ve gorevlerini getirir. */}
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
