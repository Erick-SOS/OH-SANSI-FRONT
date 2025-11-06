import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import HistorialDeCambios from "./pages/HistorialDeCambios";
import CantidadDeMedallas from "./pages/CantidadDeMedallas";
import FasesDeEvaluacion from "./pages/FasesDeEvaluacion";
import ListaDePremiados from "./pages/ListaDePremiados";
import ResultadosDeCalificaciones from "./pages/ResultadosDeCalificaciones";
import ResetPasswordPage from "./pages/AuthPages/ResetPasswordPage";
import VerifyCodePage from "./pages/AuthPages/VerifyCodePage";
import NewPasswordPage from "./pages/AuthPages/NewPasswordPage";
import Areas from "./pages/Areas";
import Niveles from "./pages/Niveles";
import FasesDeCompetencia from "./pages/FasesDeCompetencia";
import GeneracionReportes from "./pages/GeneracionReportes";
import Responsables from "./pages/Responsables.tsx";
import OlimpiasPremios from "./pages/Tables/OlimpiasPremios.tsx";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import ProtectedLayoutWithSidebar from "./layout/ProtectedLayoutWithSidebar";
import SobreElProyecto from "./pages/PublicInfo/SobreElProyecto";
import AreasPublicas from "./pages/PublicInfo/AreasPublicas";
import FasesEvaluacionPublica from "./pages/PublicInfo/FasesEvaluacionPublica";
import Reglamento from "./pages/PublicInfo/Reglamento";
import { OlympiansListLocalprueba } from "./components/importarOlimpista/OlympiansListLocalprueba.tsx";


export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>

          {/* ================== LAYOUT PÚBLICO ================== */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/resultados-de-calificaciones" element={<ResultadosDeCalificaciones />} />

            <Route path="/sobre-el-proyecto" element={<SobreElProyecto />} />
            <Route path="/areas-publicas" element={<AreasPublicas />} />
            <Route path="/fases-evaluacion-publica" element={<FasesEvaluacionPublica />} />
            <Route path="/reglamento" element={<Reglamento />} />
          </Route>

          {/* ================== LAYOUT PROTEGIDO (con Sidebar) ================== */}
          <Route element={<ProtectedLayoutWithSidebar />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardHome />
                </ProtectedRoute>
              }
            />
            {/* ---- TODAS LAS RUTAS PROTEGIDAS ---- */}
            <Route
              path="/profile"
              element={<ProtectedRoute><UserProfiles /></ProtectedRoute>}
            />
            <Route
              path="/calendar"
              element={<ProtectedRoute><Calendar /></ProtectedRoute>}
            />
            <Route
              path="/blank"
              element={<ProtectedRoute><Blank /></ProtectedRoute>}
            />
            <Route
              path="/historial-de-cambios"
              element={<ProtectedRoute><HistorialDeCambios /></ProtectedRoute>}
            />
            <Route
              path="/cantidad-de-medallas"
              element={<ProtectedRoute><CantidadDeMedallas /></ProtectedRoute>}
            />
            <Route
              path="/lista-de-inscritos"
              element={<ProtectedRoute><OlympiansListLocalprueba /></ProtectedRoute>}
            />
            <Route
              path="/fases-de-evaluacion"
              element={<ProtectedRoute><FasesDeEvaluacion /></ProtectedRoute>}
            />
            <Route
              path="/lista-de-premiados"
              element={<ProtectedRoute><ListaDePremiados /></ProtectedRoute>}
            />
            <Route
              path="/areas"
              element={<ProtectedRoute><Areas /></ProtectedRoute>}
            />
            <Route
              path="/niveles"
              element={<ProtectedRoute><Niveles /></ProtectedRoute>}
            />
            <Route
              path="/fases-de-competencia"
              element={<ProtectedRoute><FasesDeCompetencia /></ProtectedRoute>}
            />
            <Route
              path="/reportes"
              element={<ProtectedRoute><GeneracionReportes /></ProtectedRoute>}
            />
            <Route
              path="/olimpias-premios"
              element={<ProtectedRoute><OlimpiasPremios /></ProtectedRoute>}
            />
            <Route
              path="/Responsables"
              element={<ProtectedRoute><Responsables /></ProtectedRoute>}
            />
            {/* ... UI Elements, Forms, Tables, Charts ... */}
          </Route>

          {/* ================== AUTH ================== */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/new-password" element={<NewPasswordPage />} />

          {/* ================== 404 ================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}