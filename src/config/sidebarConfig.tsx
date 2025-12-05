import type { Rol } from "../components/auth/authStorage";
import {
  MdOutlineCategory,
  MdHistory,
  MdEmojiEvents,
  MdTimeline,
  MdPeople,
  MdChecklist,
  MdCardGiftcard,
  MdFactCheck,
  MdHome,
  MdHowToReg, 
} from "react-icons/md";

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

export type SidebarConfig = Record<Rol, NavItem[]>;

export const sidebarConfig: SidebarConfig = {
  ADMINISTRADOR: [
    {
      icon: <MdHome className="w-5 h-5" />,
      name: "Dashboard Admin",
      path: "/dashboard-admin",
    },
    {
      icon: <MdOutlineCategory className="w-5 h-5" />,
      name: "Gestión de Áreas y Niveles",
      subItems: [
        { name: "Categorías", path: "/gestionar-categorias" },
        { name: "Áreas", path: "/areas" },
        { name: "Niveles", path: "/niveles" },
      ],
    },
    {
      icon: <MdPeople className="w-5 h-5" />,
      name: "Lista de Inscritos",
      subItems: [
        { name: "Inscripciones", path: "/inscripciones-csv" },
        { name: "Individual", path: "/lista-de-inscritos" },
        { name: "Grupal", path: "/lista-de-inscritos-grupal" },
      ],
    },
    {
      icon: <MdHistory className="w-5 h-5" />,
      name: "Historial de Cambios",
      path: "/historial-de-cambios",
    },
    {
      icon: <MdEmojiEvents className="w-5 h-5" />,
      name: "Cantidad de Medallas",
      path: "/cantidad-de-medallas",
    },
{
      icon: <MdTimeline className="w-5 h-5" />,
      name: "Fases de Competencia",
      path: "/fases-de-competencia",
    },
  ],

  RESPONSABLE: [
    {
      icon: <MdHome className="w-5 h-5" />,
      name: "Dashboard Responsable",
      path: "/dashboard-responsable",
    },
    {
      icon: <MdCardGiftcard className="w-5 h-5" />,
      name: "Premiación y Certificados",
      path: "/olimpias-premios",
    },
    {
      icon: <MdFactCheck className="w-5 h-5" />,
      name: "Aprobación de Calificaciones",
      path: "/aprobacion-calificaciones",
    },
   
    {
      icon: <MdHowToReg className="w-5 h-5" />, 
      name: "Gestionar Evaluadores",
      
      subItems: [
        {
          name: "Habilitar Evaluador",
          path: "/habilitar-evaluador", 
        },
        {
          name: "Designar Evaluador",
          path: "/designar-evaluador",  
        },
      ],
    },
  ],

  EVALUADOR: [
    {
      icon: <MdHome className="w-5 h-5" />,
      name: "Panel de Control del Evaluador",
      path: "/evaluador/dashboard",
    },
    {
      icon: <MdChecklist className="w-5 h-5" />,
      name: "Evaluar Participantes",
      subItems: [
        {
          name: "Evaluación Individual",
          path: "/fases-de-evaluacion/individual",
        },
        {
          name: "Evaluación Grupal",
          path: "/fases-de-evaluacion/grupal",
        },
      ],
    },
  ],
};