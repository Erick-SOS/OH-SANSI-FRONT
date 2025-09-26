// utils/exportUtils.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportData {
  nombre: string;
  fecha: string;
  olimpistaOGrupo: string;
  notaAnterior: string;
  notaNueva: string;
}

export const exportarComoPDF = (datos: ExportData[], terminoBusqueda: string, nombreArchivo: string) => {
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Historial de Cambios', 14, 15);
    
    if (terminoBusqueda) {
      doc.setFontSize(10);
      doc.text(`Filtro aplicado: "${terminoBusqueda}"`, 14, 25);
      doc.text(`Total de registros: ${datos.length}`, 14, 32);
    }
    
    const datosExportar = datos.map(item => [
      item.nombre,
      item.fecha,
      item.olimpistaOGrupo,
      item.notaAnterior,
      item.notaNueva
    ]);

    autoTable(doc, {
      head: [['Nombre', 'Fecha y Hora', 'Olimpista/Grupo', 'Nota Anterior', 'Nueva Nota']],
      body: datosExportar,
      startY: terminoBusqueda ? 40 : 25,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [70, 95, 255] }
    });

    doc.save(`${nombreArchivo}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    throw new Error('Error al exportar el PDF');
  }
};

export const exportarComoXLSX = (datos: ExportData[], nombreArchivo: string) => {
  try {
    const datosExportar = datos.map(item => ({
      'Nombre': item.nombre,
      'Fecha y Hora': item.fecha,
      'Olimpista/Grupo Asignado': item.olimpistaOGrupo,
      'Nota Anterior': item.notaAnterior,
      'Nueva Nota': item.notaNueva
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosExportar);
    
    const columnWidths = [
      { wch: 20 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Historial de Cambios');
    XLSX.writeFile(wb, `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error al exportar XLSX:', error);
    throw new Error('Error al exportar el Excel');
  }
};