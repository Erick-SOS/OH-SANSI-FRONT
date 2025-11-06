// src/utils/exportUtils.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

// TIPO UNIVERSAL OFICIAL DE OH-SANSI 2025
// Aprobado por TIS en pliego CPTIS-1108-2025
export type ExportData = {
  // Historial de Cambios
  nombre?: string;
  fecha?: string;
  olimpistaOGrupo?: string;
  notaAnterior?: string;
  notaNueva?: string;

  // Inscritos, Resultados, Premiación
  estudiante?: string;
  area?: string;
  institucion?: string;
  puntaje?: string;
  posicion?: string;
  premio?: string;

  // Soporte para cualquier reporte futuro
  [key: string]: string | undefined;
};

export const exportarComoPDF = (
  datos: ExportData[],
  terminoBusqueda: string,
  nombreArchivo: string
) => {
  try {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Títulos oficiales según pliego TIS
    const titulos: Record<string, string> = {
      historial: 'Historial de Cambios',
      inscritos: 'Inscritos por Área',
      resultados: 'Resultados Clasificación',
      premiacion: 'Premiación Final',
    };

    const titulo = titulos[nombreArchivo] || 'Reporte OH-SANSI';

    // Encabezado oficial
    doc.setFontSize(20);
    doc.setTextColor(70, 95, 255);
    doc.text('OH-SANSI', 14, 15);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(titulo, 14, 25);

    if (terminoBusqueda) {
      doc.setFontSize(10);
      doc.text(`Filtro aplicado: "${terminoBusqueda}"`, 14, 35);
      doc.text(`Total de registros: ${datos.length}`, 14, 41);
    }

    // Auto-detección inteligente de columnas
    const claves = datos.length > 0
      ? Object.keys(datos[0]).filter(k => datos[0][k] !== undefined)
      : [];

    const mapaTitulos: Record<string, string> = {
      nombre: 'Nombre',
      fecha: 'Fecha y Hora',
      olimpistaOGrupo: 'Olimpiada/Grupo Afectado',
      notaAnterior: 'Nota Anterior',
      notaNueva: 'Nueva Nota',
      estudiante: 'Estudiante',
      area: 'Área',
      institucion: 'Institución',
      puntaje: 'Puntaje',
      posicion: 'Posición',
      premio: 'Premio',
    };

    const encabezados = claves.map(k => mapaTitulos[k] || k);
    const filas = datos.map(item => claves.map(k => item[k] || ''));

    autoTable(doc, {
      head: [encabezados],
      body: filas,
      startY: terminoBusqueda ? 48 : 35,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [70, 95, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 255] },
      columnStyles: { 0: { cellWidth: 30 } },
    });

    // Pie de página oficial
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generado por OH-SANSI - Olimpiadas Científicas 2025`, 14, doc.internal.pageSize.height - 10);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
    }

    doc.save(`${nombreArchivo}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    throw new Error('No se pudo generar el PDF');
  }
};

export const exportarComoXLSX = async (datos: ExportData[], nombreArchivo: string) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    // Auto-detección de columnas
    const claves = datos.length > 0
      ? Object.keys(datos[0]).filter(k => datos[0][k] !== undefined)
      : [];

    const mapaTitulos: Record<string, string> = {
      nombre: 'Nombre',
      fecha: 'Fecha y Hora',
      olimpistaOGrupo: 'Olimpiada/Grupo Asignado',
      notaAnterior: 'Nota Anterior',
      notaNueva: 'Nueva Nota',
      estudiante: 'Estudiante',
      area: 'Área',
      institucion: 'Institución',
      puntaje: 'Puntaje',
      posicion: 'Posición',
      premio: 'Premio',
    };

    worksheet.columns = claves.map(clave => ({
      header: mapaTitulos[clave] || clave,
      key: clave,
      width: clave.length > 15 ? 30 : 20,
    }));

    datos.forEach(item => {
      const fila: Record<string, string> = {};
      claves.forEach(clave => {
        fila[clave] = item[clave] || '';
      });
      worksheet.addRow(fila);
    });

    // Estilo oficial
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF465FFF' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar XLSX:', error);
    throw new Error('No se pudo generar el Excel');
  }
};