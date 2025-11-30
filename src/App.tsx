import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
import SobreElProyecto from "./pages/PublicInfo/SobreElProyecto";
import AreasPublicas from "./pages/PublicInfo/AreasPublicas";
import FasesEvaluacionPublica from "./pages/PublicInfo/FasesEvaluacionPublica";
import Reglamento from "./pages/PublicInfo/Reglamento";
import { OlympiansListLocalprueba } from "./components/importarOlimpista/OlympiansListLocalprueba.tsx";
import FasesEvaluacionIndividual from "./pages/FasesEvaluacionIndividual";
import FasesEvaluacionGrupal from "./pages/FasesEvaluacionGrupal";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardAdmin from "./pages/Dashboard/DashboardAdmin.tsx";
import DashboardResponsable from "./pages/Dashboard/DashboardResponsable.tsx";
import DashboardEvaluador from "./pages/Dashboard/DashboardEvaluador.tsx";

// === IMPORTAMOS LAS DOS PÁGINAS NUEVAS ===
import AprobacionCalificacionesLista from "./pages/AprobacionCalificacionesLista";
import AprobacionCalificacionesDetalle from "./pages/AprobacionCalificacionesDetalle";

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

          {/* ================== LAYOUT DASHBOARD (con sidebar) ================== */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/dashboard-responsable" element={<DashboardResponsable />} />
            <Route path="/evaluador/dashboard" element={<DashboardEvaluador />} />

            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/historial-de-cambios" element={<HistorialDeCambios />} />
            <Route path="/cantidad-de-medallas" element={<CantidadDeMedallas />} />
            <Route path="/lista-de-inscritos" element={<OlympiansListLocalprueba />} />
            <Route path="/lista-de-premiados" element={<ListaDePremiados />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/niveles" element={<Niveles />} />
            <Route path="/fases-de-competencia" element={<FasesDeCompetencia />} />
            <Route path="/reportes" element={<GeneracionReportes />} />
            <Route path="/olimpias-premios" element={<OlimpiasPremios />} />
            <Route path="/Responsables" element={<Responsables />} />
            <Route path="/fases-de-evaluacion/individual" element={<FasesEvaluacionIndividual />} />
            <Route path="/fases-de-evaluacion/grupal" element={<FasesEvaluacionGrupal />} />

            {/* === RUTAS NUEVAS DE APROBACIÓN DE CALIFICACIONES === */}
            <Route path="/aprobacion-calificaciones" element={<AprobacionCalificacionesLista />} />
            <Route path="/aprobacion-calificaciones/:id" element={<AprobacionCalificacionesDetalle />} />
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