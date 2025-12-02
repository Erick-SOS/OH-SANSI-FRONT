// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ResetPasswordPage from "./pages/AuthPages/ResetPasswordPage";
import VerifyCodePage from "./pages/AuthPages/VerifyCodePage";
import NewPasswordPage from "./pages/AuthPages/NewPasswordPage";

import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";

import AppLayout from "./layout/AppLayout";
import DashboardLayout from "./layout/DashboardLayout";

import { ScrollToTop } from "./components/common/ScrollToTop";

import Home from "./pages/Dashboard/Home";
import DashboardAdmin from "./pages/Dashboard/DashboardAdmin.tsx";
import DashboardResponsable from "./pages/Dashboard/DashboardResponsable.tsx";
import DashboardEvaluador from "./pages/Dashboard/DashboardEvaluador.tsx";

import HistorialDeCambios from "./pages/HistorialDeCambios";
import CantidadDeMedallas from "./pages/CantidadDeMedallas";
import ResultadosDeCalificaciones from "./pages/ResultadosDeCalificaciones";

import Inscripciones from "./pages/InscripcionesCSV.tsx";
import Areas from "./pages/Areas";
import Niveles from "./pages/Niveles";
import FasesDeCompetencia from "./pages/FasesDeCompetencia";
import SeleccionarGestionPage from "./pages/SeleccionarGestionPage.tsx";
import GeneracionReportes from "./pages/GeneracionReportes";
import GestionarCategorias from "./pages/GestionDeCategorias.tsx";

import ListaDePremiados from "./pages/ListaDePremiados.tsx";

import SobreElProyecto from "./pages/PublicInfo/SobreElProyecto";
import AreasPublicas from "./pages/PublicInfo/AreasPublicas";
import FasesEvaluacionPublica from "./pages/PublicInfo/FasesEvaluacionPublica";
import Reglamento from "./pages/PublicInfo/Reglamento";
import ConsultaDePremiados from "./pages/ConsultaDePremiados";

import { OlympiansListLocalprueba } from "./components/importarOlimpista/OlympiansListLocalprueba.tsx";
import ListaInscritosGrupal from "./pages/ListaInscritosGrupal";

import FasesEvaluacionIndividual from "./pages/FasesEvaluacionIndividual";
import FasesEvaluacionGrupal from "./pages/FasesEvaluacionGrupal";

// === IMPORTAMOS LAS DOS PÁGINAS NUEVAS ===
import AprobacionCalificacionesLista from "./pages/AprobacionCalificacionesLista";
import AprobacionCalificacionesDetalle from "./pages/AprobacionCalificacionesDetalle";

// 👇 IMPORT CORRECTO
import GestionEvaluadorPage from "./pages/GestionEvaluadorPage.tsx";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* ================== LAYOUT PÚBLICO ================== */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route
              path="/resultados-de-calificaciones"
              element={<ResultadosDeCalificaciones />}
            />
            <Route path="/sobre-el-proyecto" element={<SobreElProyecto />} />
            <Route path="/areas-publicas" element={<AreasPublicas />} />
            <Route
              path="/fases-evaluacion-publica"
              element={<FasesEvaluacionPublica />}
            />
            <Route path="/reglamento" element={<Reglamento />} />
            <Route path="/consulta-de-premiados" element={<ConsultaDePremiados />} />
          </Route>

          {/* ================== LAYOUT DASHBOARD (con sidebar) ================== */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/dashboard-responsable" element={<DashboardResponsable />} />
            <Route path="/evaluador/dashboard" element={<DashboardEvaluador />} />

            <Route path="/profile" element={<UserProfiles />} />

            <Route
              path="/historial-de-cambios"
              element={<HistorialDeCambios />}
            />
            <Route
              path="/cantidad-de-medallas"
              element={<CantidadDeMedallas />}
            />

            {/* INDIVIDUAL y GRUPAL */}
            <Route
              path="/inscripciones-csv"
              element={<Inscripciones />}
            />
            <Route
              path="/lista-de-inscritos"
              element={<OlympiansListLocalprueba />}
            />
            <Route
              path="/lista-de-inscritos-grupal"
              element={<ListaInscritosGrupal />}
            />
            <Route path="/gestionar-categorias" element={<GestionarCategorias />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/niveles" element={<Niveles />} />
            <Route
             path="/fases-de-competencia"
             element={<SeleccionarGestionPage />}
             />

            <Route
             path="/fases/estado-olimpiada/:gestionId"
             element={<FasesDeCompetencia />}
  />
            <Route path="/reportes" element={<GeneracionReportes />} />
            <Route path="/lista-de-premiados" element={<ListaDePremiados />} />
            <Route path="/fases-de-evaluacion/individual" element={<FasesEvaluacionIndividual />} />
            <Route path="/fases-de-evaluacion/grupal" element={<FasesEvaluacionGrupal />} />

            {/* === RUTAS NUEVAS DE APROBACIÓN DE CALIFICACIONES === */}
            <Route path="/aprobacion-calificaciones" element={<AprobacionCalificacionesLista />} />
            <Route path="/aprobacion-calificaciones/:id" element={<AprobacionCalificacionesDetalle />} />
            <Route
              path="/gestion-evaluador"
              element={<GestionEvaluadorPage />}
            />
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
