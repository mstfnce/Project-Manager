import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotesPage } from "./pages/NotesPage";
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

      {/* Login sayfasi - herkese acik, koruma yok, Layout'suz (sidebar yok). */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard'a girmeden once ProtectedRoute araya girer:
          token yoksa DashboardPage hic render edilmeden /login'e atilir.
          Layout, ProtectedRoute'un icinde - token yoksa Sidebar bile
          render edilmez, sidebar'daki proje sorgusu bosuna atilmaz. */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Proje listesi - Dashboard ile ayni sekilde ProtectedRoute + Layout ile sarili. */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectListPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Global Notlar sayfasi - tum projelerin notlari bir arada. */}
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Layout>
              <NotesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Proje detay sayfasi - ":id" URL'den okunup ProjectDetailPage icinde
          useParams ile alinacak, o projenin kendisini ve gorevlerini getirir. */}
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
