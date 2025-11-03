import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import HistorialDeCambios from "./pages/HistorialDeCambios";
import CantidadDeMedallas from "./pages/CantidadDeMedallas";
import FasesDeEvaluacion from "./pages/FasesDeEvaluacion";
import ListaDePremiados from "./pages/ListaDePremiados";
import ResultadosDeCalificaciones from "./pages/ResultadosDeCalificaciones";
import { OlympiansListLocalprueba } from "./pages/OlympiansListlocalprueba";
import ResetPasswordPage from "./pages/AuthPages/ResetPasswordPage";
import VerifyCodePage from "./pages/AuthPages/VerifyCodePage";
import NewPasswordPage from "./pages/AuthPages/NewPasswordPage";
import Areas from "./pages/Areas";
import Niveles from "./pages/Niveles";
import FasesDeCompetencia from "./pages/FasesDeCompetencia";
import GeneracionReportes from "./pages/GeneracionReportes";
import Responsables from "./pages/Responsables.tsx";

import OlimpiasPremios from "./pages/Tables/OlimpiasPremios.tsx";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Rutas públicas */}
            <Route index path="/" element={<Home />} />
            <Route path="/resultados-de-calificaciones" element={<ResultadosDeCalificaciones />} />
            
            {/* Rutas protegidas */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfiles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blank"
              element={
                <ProtectedRoute>
                  <Blank />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historial-de-cambios"
              element={
                <ProtectedRoute>
                  <HistorialDeCambios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cantidad-de-medallas"
              element={
                <ProtectedRoute>
                  <CantidadDeMedallas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lista-de-inscritos"
              element={
                <ProtectedRoute>
                  <OlympiansListLocalprueba />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fases-de-evaluacion"
              element={
                <ProtectedRoute>
                  <FasesDeEvaluacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lista-de-premiados"
              element={
                <ProtectedRoute>
                  <ListaDePremiados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/areas"
              element={
                <ProtectedRoute>
                  <Areas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/niveles"
              element={
                <ProtectedRoute>
                  <Niveles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fases-de-competencia"
              element={
                <ProtectedRoute>
                  <FasesDeCompetencia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <GeneracionReportes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/olimpias-premios"
              element={
                <ProtectedRoute>
                  <OlimpiasPremios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Responsables"
              element={
                <ProtectedRoute>
                  <Responsables />
                </ProtectedRoute>
              }
            />
            {/* Forms */}
            <Route
              path="/form-elements"
              element={
                <ProtectedRoute>
                  <FormElements />
                </ProtectedRoute>
              }
            />
            {/* Tables */}
            <Route
              path="/basic-tables"
              element={
                <ProtectedRoute>
                  <BasicTables />
                </ProtectedRoute>
              }
            />
            {/* Ui Elements */}
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/avatars"
              element={
                <ProtectedRoute>
                  <Avatars />
                </ProtectedRoute>
              }
            />
            <Route
              path="/badge"
              element={
                <ProtectedRoute>
                  <Badges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buttons"
              element={
                <ProtectedRoute>
                  <Buttons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/images"
              element={
                <ProtectedRoute>
                  <Images />
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <ProtectedRoute>
                  <Videos />
                </ProtectedRoute>
              }
            />
            {/* Charts */}
            <Route
              path="/line-chart"
              element={
                <ProtectedRoute>
                  <LineChart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bar-chart"
              element={
                <ProtectedRoute>
                  <BarChart />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/new-password" element={<NewPasswordPage />} />
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}