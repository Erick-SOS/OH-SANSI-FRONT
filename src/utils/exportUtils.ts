// utils/exportUtils.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

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

export const exportarComoXLSX = async (datos: ExportData[], nombreArchivo: string) => {
  try {
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    // Crear una nueva hoja
    const worksheet = workbook.addWorksheet('Historial de Cambios');

    // Definir las columnas con encabezados y anchos
    worksheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Fecha y Hora', key: 'fecha', width: 25 },
      { header: 'Olimpista/Grupo Asignado', key: 'olimpistaOGrupo', width: 25 },
      { header: 'Nota Anterior', key: 'notaAnterior', width: 15 },
      { header: 'Nueva Nota', key: 'notaNueva', width: 15 },
    ];

    // Agregar los datos
    datos.forEach(item => {
      worksheet.addRow({
        nombre: item.nombre,
        fecha: item.fecha,
        olimpistaOGrupo: item.olimpistaOGrupo,
        notaAnterior: item.notaAnterior,
        notaNueva: item.notaNueva,
      });
    });

    // Estilizar el encabezado
    worksheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF465FFF' }, // Color similar al [70, 95, 255] del PDF
      };
      cell.font = { bold: true };
    });

    // Generar un buffer en lugar de escribir en el sistema de archivos
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error al exportar XLSX:', error);
    throw new Error('Error al exportar el Excel');
  }
};