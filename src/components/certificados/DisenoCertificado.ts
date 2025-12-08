// src/utils/DisenoCertificados.ts

export type ModalidadCategoria = "INDIVIDUAL" | "GRUPAL";
export type TipoMedalla = "ORO" | "PLATA" | "BRONCE" | "MENCION";

export interface PersonaCert {
  ci: string;
  nombre: string;
  unidadEducativa: string;
  medalla: TipoMedalla;
  nota: number;
  modalidad: ModalidadCategoria;
}

export function etiquetaMedalla(m: TipoMedalla): string {
  switch (m) {
    case "ORO":
      return "Oro";
    case "PLATA":
      return "Plata";
    case "BRONCE":
      return "Bronce";
    case "MENCION":
    default:
      return "Mención";
  }
}

export function generarHtmlCertificados(
  personas: PersonaCert[],
  base: {
    area: string;
    nivel: string;
    gestion: number;
    responsable?: string | null;
  }
): string {

  const css = `
  * { box-sizing: border-box; }

  /* 🔹 Forzar orientación horizontal en impresión */
  @page {
    size: A4 landscape;
    margin: 0;
  }

  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    margin: 0;
    padding: 24px;
    background: #f3f4f6;
  }

  /* 🔹 Página en horizontal (29.7cm x 21cm) */
  .page {
    width: 29.7cm;
    min-height: 21cm;
    margin: 0 auto 24px auto;
    padding: 32px 40px;
    background: white;
    border-radius: 24px;
    border: 1px solid #fbbf24;
    position: relative;
  }

  .title { text-align: center; margin-bottom: 12px; }
  .title h1 {
    font-size: 26px;
    margin: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .subtitle {
    text-align: center;
    font-size: 12px;
    color: #4b5563;
    margin-bottom: 24px;
  }
  .name {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .ci {
    text-align: center;
    font-size: 11px;
    color: #4b5563;
    margin-bottom: 4px;
  }
  .ue {
    text-align: center;
    font-size: 11px;
    color: #4b5563;
    margin-bottom: 12px;
  }
  .badge-row { text-align: center; margin-bottom: 16px; }
  .badge {
    display: inline-block;
    border-radius: 999px;
    border: 1px solid #fbbf24;
    background: #fffbeb;
    padding: 4px 14px;
    font-size: 11px;
    font-weight: 600;
    color: #92400e;
    margin-right: 8px;
  }
  .badge-secondary {
    display: inline-block;
    border-radius: 999px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    padding: 4px 14px;
    font-size: 11px;
    font-weight: 500;
    color: #374151;
    margin-right: 6px;
    margin-top: 4px;
  }
  .text {
    font-size: 11px;
    color: #374151;
    text-align: center;
    max-width: 600px;
    margin: 0 auto 20px auto;
  }
  .footer {
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #4b5563;
  }
  .firma { text-align: center; }
  .firma-line {
    height: 1px;
    width: 220px;
    background: #6b7280;
    margin: 0 auto 6px auto;
  }
  .firma-nombre { font-weight: 600; color: #111827; }
  .firma-cargo {
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  @media print {
    body {
      background: white;
      padding: 0;
      margin: 0;
    }
    .page {
      page-break-after: always;
      margin: 0;
      border-radius: 0;
      width: 29.7cm;
      min-height: 21cm;
    }
  }
`;

  const paginas = personas
    .map((p) => {
      const medallaLabel = etiquetaMedalla(p.medalla);
      const textoModalidad =
        p.modalidad === "INDIVIDUAL"
          ? "participación individual"
          : "participación en equipo";

      return `
      <div class="page">
        <div class="title">
          <h1>Certificado de Reconocimiento</h1>
        </div>
        <div class="subtitle">
          Olimpiada Científica – Área ${base.area} – Nivel ${base.nivel} – Gestión ${base.gestion
        }
        </div>
        <div class="name">${p.nombre}</div>
        <div class="ci">Documento de identidad: <strong>${p.ci}</strong></div>
        <div class="ue">Unidad educativa: <strong>${p.unidadEducativa}</strong></div>
        <div class="badge-row">
          <span class="badge">${medallaLabel}</span>
          <span class="badge-secondary">Nota final: ${p.nota.toFixed(2)}</span>
          <span class="badge-secondary">${textoModalidad}</span>
        </div>
        <p class="text">
          En reconocimiento a su destacado desempeño académico en la Olimpiada Científica,
          obteniendo la distinción indicada y demostrando compromiso, esfuerzo y excelencia.
        </p>
        <div class="footer">
          <div></div>
          <div class="firma">
            <div class="firma-line"></div>
            <div class="firma-nombre">${base.responsable || "Responsable de área"
        }</div>
            <div class="firma-cargo">Responsable de la categoría</div>
          </div>
          <div>
            Sistema de Gestión de Olimpiadas<br/>
            Gestión ${base.gestion}
          </div>
        </div>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charSet="utf-8" />
<title>Certificados</title>
<style>${css}</style>
</head>
<body>${paginas}</body>
</html>`;
}
