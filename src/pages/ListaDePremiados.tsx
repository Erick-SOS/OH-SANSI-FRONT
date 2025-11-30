import React, { useState, useMemo, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import BarraBusquedaOlimpias from "../components/tables/BarraBusquedaOlimpias";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import ModalConfirmacion from "../components/ui/modal/ModalConfirmacion";
import jsPDF from "jspdf";
import { MdDownload, MdFileDownload } from "react-icons/md";

import { api } from "../api";

interface OlimpiaItem {
  id: number;
  nombre: string;
  ci: string;
  areaCompetencia: string;
  nivel: string;
  modalidad: string;
  estado: string;
  nota: number;
  distincion: string;
}

const ListaDePremiados: React.FC = () => {
  const [olimpias, setOlimpias] = useState<OlimpiaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 7;

  const [ordenarPor, setOrdenarPor] = useState<keyof OlimpiaItem | null>(null);
  const [direccionOrden, setDireccionOrden] = useState<"asc" | "desc">("asc");

  const [modalExportarLista, setModalExportarLista] = useState(false);
  const [modalDescargarTodos, setModalDescargarTodos] = useState(false);
  const [modalCertificadoIndividual, setModalCertificadoIndividual] =
    useState<number | null>(null);

  // Logo UMSS en base64 (cargado desde /src/images via images.logoUmss)
  const [logoUMSS, setLogoUMSS] = useState<string | null>(null);

  // =========================
  // 1) Cargar datos del back
  // =========================
  useEffect(() => {
    const cargarOlimpias = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp: any = await api("/premiados?page=1&pageSize=1000", {
          method: "GET",
          // token: auth.token,
        });

        const data = resp.items ?? resp.data ?? resp;

        const mapped: OlimpiaItem[] = (data as any[]).map((item: any) => ({
          id: item.id,
          nombre: item.nombreCompleto ?? item.nombre,
          ci: item.ci,
          areaCompetencia:
            item.areaCompetencia ?? item.area ?? item.area_nombre ?? "",
          nivel: item.nivel ?? item.nivel_nombre ?? "",
          modalidad: item.modalidad ?? "",
          estado: item.estado ?? "",
          nota: item.nota ?? 0,
          distincion: item.distincion ?? "",
        }));

        setOlimpias(mapped);
      } catch (e: any) {
        console.error("Error cargando premiados:", e);
        setError(e.message || "Error al cargar la lista de premiados");
      } finally {
        setLoading(false);
      }
    };

    cargarOlimpias();
  }, []);

  // =========================
  // 2) Cargar logo UMSS
  // =========================
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "/images/LogoUmss/logo-UMSS.png";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      setLogoUMSS(dataUrl);
    };
  }, []);

  // =========================
  // 3) Generación de PDF
  // =========================
  const generarCertificado = (item: OlimpiaItem) => {
    const doc = new jsPDF("l", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const azulAcero = { r: 31, g: 58, b: 96 };   // #1F3A60
    const rojoUMSS = { r: 198, g: 40, b: 40 };   // #C62828
    const fondoSuave = { r: 245, g: 248, b: 255 };

    // ===== FONDO GENERAL =====
    doc.setFillColor(fondoSuave.r, fondoSuave.g, fondoSuave.b);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // ===== BANDA SUPERIOR =====
    doc.setFillColor(azulAcero.r, azulAcero.g, azulAcero.b);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setFillColor(rojoUMSS.r, rojoUMSS.g, rojoUMSS.b);
    doc.rect(0, 28, pageWidth, 1.8, "F");

    const centerX = pageWidth / 2;

    // LOGO EN LA BANDA SUPERIOR (SEPARADO DEL TÍTULO)
    if (logoUMSS) {
      doc.addImage(logoUMSS, "PNG", 12, 4, 15, 22);
    }

    // TEXTO SOBRE LA BANDA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("UNIVERSIDAD MAYOR DE SAN SIMÓN", centerX, 12, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Olimpiadas Científicas OH! SAN SÍ", centerX, 22, { align: "center" });

    // ===== TARJETA CENTRAL =====
    const marginX = 18;
    const marginY = 40;
    const cardWidth = pageWidth - marginX * 2;
    const cardHeight = pageHeight - marginY - 20;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX, marginY, cardWidth, cardHeight, 4, 4, "F");

    doc.setDrawColor(225, 228, 240);
    doc.roundedRect(marginX, marginY, cardWidth, cardHeight, 4, 4, "S");

    let y = marginY + 26;

    // ===== TÍTULO PRINCIPAL =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(azulAcero.r, azulAcero.g, azulAcero.b);
    doc.text("CERTIFICADO DE PREMIO", centerX, y, { align: "center" });

    // Línea roja bajo el título
    y += 4;
    doc.setDrawColor(rojoUMSS.r, rojoUMSS.g, rojoUMSS.b);
    doc.setLineWidth(0.6);
    doc.line(centerX - 35, y, centerX + 35, y);

    y += 18;

    // ===== “OTORGADO A” =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(90, 90, 90);
    doc.text("Otorgado a", centerX, y, { align: "center" });

    y += 12;

    // ===== NOMBRE =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text(item.nombre.toUpperCase(), centerX, y, { align: "center" });

    y += 22;

    // ===== MEDALLA =====
    const colorMedalla = item.distincion.includes("Oro")
      ? [255, 193, 7]
      : item.distincion.includes("Plata")
      ? [158, 158, 158]
      : [205, 127, 50];

    const medallaWidth = 90;
    const medallaX = centerX - medallaWidth / 2;
    const medallaY = y - 8;

    doc.setFillColor(colorMedalla[0], colorMedalla[1], colorMedalla[2]);
    doc.roundedRect(medallaX, medallaY, medallaWidth, 18, 9, 9, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(item.distincion.toUpperCase(), centerX, y + 1, { align: "center" });

    y += 28;

    // ===== TEXTO DESCRIPTIVO =====
    const textoDescripcion = `Por su destacada participación en el área de ${
      item.areaCompetencia
    }, nivel ${item.nivel}, modalidad ${item.modalidad.toUpperCase()}, dentro de las Olimpiadas Científicas.`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(80, 80, 80);

    const textWidth = cardWidth - 46;
    const textoPartido = doc.splitTextToSize(textoDescripcion, textWidth);
    doc.text(textoPartido, centerX, y, { align: "center" });

    y += textoPartido.length * 7 + 20;

    // ===== FECHA =====
    const fechaY = pageHeight - 40;
    const firmaY = pageHeight - 30;

    const fecha = new Date().toLocaleDateString("es-ES");
    doc.setFontSize(11);
    doc.setTextColor(110, 110, 110);
    doc.text(`Cochabamba, ${fecha}`, centerX, fechaY, { align: "center" });

    // ===== FIRMA =====
    doc.setDrawColor(170, 170, 170);
    doc.line(centerX - 40, firmaY - 5, centerX + 40, firmaY - 5);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("Director de Olimpiadas", centerX, firmaY + 2, { align: "center" });

    // ===== DECORACIÓN INFERIOR =====
    const decoY = pageHeight - 12;
    doc.setFillColor(azulAcero.r, azulAcero.g, azulAcero.b);
    doc.rect(marginX + 20, decoY, cardWidth - 40, 1.5, "F");

    doc.setFillColor(rojoUMSS.r, rojoUMSS.g, rojoUMSS.b);
    doc.rect(marginX + 40, decoY + 3, cardWidth - 80, 1.2, "F");

    return doc;
  };


  const handleDownloadCertificado = (id: number) => {
    const item = olimpias.find((i) => i.id === id);
    if (!item) return;
    const doc = generarCertificado(item);
    doc.save(`certificado-${item.nombre.replace(/ /g, "-")}.pdf`);
    setModalCertificadoIndividual(null);
  };

  const handleExportarLista = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(16);
    doc.text("Lista de Premiados", 14, 20);
    doc.setFontSize(12);
    let y = 30;
    sortedData.forEach((item, i) => {
      doc.text(
        `${i + 1}. ${item.nombre} - ${item.distincion} (${item.nota} pts)`,
        14,
        y
      );
      y += 8;
    });
    doc.save("lista-premiados.pdf");
    setModalExportarLista(false);
  };

  const handleDescargarTodos = () => {
    olimpias.forEach((item) => {
      const doc = generarCertificado(item);
      doc.save(`certificado-${item.nombre.replace(/ /g, "-")}.pdf`);
    });
    setModalDescargarTodos(false);
  };

  // === ORDENAMIENTO ===
  const handleOrdenar = (columna: string, direccion: "asc" | "desc") => {
    setOrdenarPor(columna as keyof OlimpiaItem);
    setDireccionOrden(direccion);
  };

  // === FILTRADO Y PAGINACIÓN ===
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return olimpias;
    const term = searchTerm.toLowerCase();
    return olimpias.filter(
      (item) =>
        item.nombre.toLowerCase().includes(term) ||
        item.ci.includes(term) ||
        item.areaCompetencia.toLowerCase().includes(term) ||
        item.nivel.toLowerCase().includes(term) ||
        item.modalidad.toLowerCase().includes(term)
    );
  }, [olimpias, searchTerm]);

  const sortedData = useMemo(() => {
    if (!ordenarPor) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[ordenarPor];
      const valB = b[ordenarPor];
      if (typeof valA === "string" && typeof valB === "string") {
        return direccionOrden === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return direccionOrden === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredData, ordenarPor, direccionOrden]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const columns = [
    {
      clave: "nombre",
      titulo: "Nombre Completo",
      alineacion: "izquierda" as const,
      formatearCelda: (_valor: string, fila: OlimpiaItem) => {
        const iniciales = fila.nombre
          .split(" ")
          .filter((n) => n)
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {iniciales}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {fila.nombre}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CI: {fila.ci}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      clave: "areaCompetencia",
      titulo: "Área",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "nivel",
      titulo: "Nivel",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "modalidad",
      titulo: "Modalidad",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "estado",
      titulo: "Estado",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "nota",
      titulo: "Nota",
      alineacion: "centro" as const,
      ordenable: true,
      formatearCelda: (valor: number) => (
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {valor}
        </span>
      ),
    },
    {
      clave: "distincion",
      titulo: "Distinción",
      alineacion: "izquierda" as const,
      ordenable: true,
      formatearCelda: (valor: string) => (
        <span
          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
            valor.includes("Oro")
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : valor.includes("Plata")
              ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
          }`}
        >
          {valor}
        </span>
      ),
    },
    {
      clave: "acciones",
      titulo: "Certificado",
      alineacion: "centro" as const,
      formatearCelda: (_: unknown, fila: OlimpiaItem) => (
        <button
          onClick={() => setModalCertificadoIndividual(fila.id)}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
          title="Descargar certificado"
        >
          <MdDownload size={20} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Olimpistas Premiados | TailAdmin"
        description="Gestión de premiación y certificados"
      />
      <PageBreadcrumb pageTitle="Olimpistas Premiados" />

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1 max-w-md">
              <BarraBusquedaOlimpias
                terminoBusqueda={searchTerm}
                onBuscarChange={(t) => {
                  setSearchTerm(t);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setModalExportarLista(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#465FFF] rounded-full hover:bg-[#3a4fe6] transition-all"
              >
                <MdFileDownload size={18} />
                Exportar lista
              </button>

              <button
                onClick={() => setModalDescargarTodos(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#465FFF] rounded-full hover:bg-[#3a4fe6] transition-all"
              >
                <MdDownload size={18} />
                Descargar certificados
              </button>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Cargando lista de premiados...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500 mb-4">
              {error}
            </p>
          )}

          {!loading && !error && (
            <>
              {searchTerm && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {filteredData.length} resultados para "{searchTerm}"
                </p>
              )}

              <TablaBase
                datos={paginatedData.map((item, index) => ({
                  ...item,
                  numero: (currentPage - 1) * itemsPerPage + index + 1,
                }))}
                columnas={columns}
                conOrdenamiento={true}
                onOrdenar={handleOrdenar}
                conAcciones={false}
                className="w-full"
              />

              <Paginacion
                paginaActual={currentPage}
                totalPaginas={Math.ceil(filteredData.length / itemsPerPage)}
                totalRegistros={filteredData.length}
                registrosPorPagina={itemsPerPage}
                onPaginaChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      <ModalConfirmacion
        isOpen={modalExportarLista}
        titulo="Exportar lista de premiados"
        mensaje="Se exportará la lista de premiados en formato PDF."
        onConfirmar={handleExportarLista}
        onCancelar={() => setModalExportarLista(false)}
      />

      <ModalConfirmacion
        isOpen={modalDescargarTodos}
        titulo="Descargar todos los certificados"
        mensaje="Se descargarán todos los certificados en formato PDF."
        onConfirmar={handleDescargarTodos}
        onCancelar={() => setModalDescargarTodos(false)}
      />

      <ModalConfirmacion
        isOpen={modalCertificadoIndividual !== null}
        titulo="Descargar certificado"
        mensaje="Se descargará el certificado en formato PDF."
        onConfirmar={() =>
          modalCertificadoIndividual &&
          handleDownloadCertificado(modalCertificadoIndividual)
        }
        onCancelar={() => setModalCertificadoIndividual(null)}
      />
    </>
  );
};

export default ListaDePremiados;
