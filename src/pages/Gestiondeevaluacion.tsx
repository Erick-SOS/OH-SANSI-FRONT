import { useEffect, useMemo, useState } from "react";

/** ========= Tipos ========= */
type PhaseStatus = "EN_CURSO" | "CERRADA" | "PUBLICADA";

interface PhaseWindow {
  start?: number; // epoch ms
  end?: number;   // epoch ms
}

interface HistoryItem {
  id: string;
  timestamp: number;
  user: string;
  action: "Abrir fase" | "Cerrar fase" | "Publicar resultados";
  statusAfter: PhaseStatus;
}

interface GradeRecord {
  id: string;
  studentId: string;
  score: number;
  timestamp: number;
}

interface NotificationItem {
  id: string;
  timestamp: number;
  subject: string;
  body: string;
  recipients: string[];
}

/** ========= Claves de storage ========= */
const LS = {
  STATUS: "phase.status",
  WINDOW: "phase.window",
  HISTORY: "phase.history",
  GRADES: "phase.grades",
  NOTIFS: "phase.notifications",
};

/** ========= Utilidades ========= */
const fmt = (t: number) =>
  new Date(t).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusLabel = (s: PhaseStatus) =>
  s === "EN_CURSO" ? "En curso" : s === "CERRADA" ? "Cerrada" : "Publicada";

const badge = (s: PhaseStatus) =>
  s === "EN_CURSO" ? "badge green" : s === "CERRADA" ? "badge gray" : "badge blue";

/** ========= Componente principal ========= */
export default function Gestiondeevaluacion({ adminUser }: { adminUser: string }) {
  const [status, setStatus] = useState<PhaseStatus>(() => {
    const raw = localStorage.getItem(LS.STATUS);
    return (raw as PhaseStatus) || "CERRADA";
  });
  const [windowPhase, setWindowPhase] = useState<PhaseWindow>(() => {
    const raw = localStorage.getItem(LS.WINDOW);
    return raw ? (JSON.parse(raw) as PhaseWindow) : {};
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const raw = localStorage.getItem(LS.HISTORY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  });
  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    const raw = localStorage.getItem(LS.GRADES);
    return raw ? (JSON.parse(raw) as GradeRecord[]) : [];
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const raw = localStorage.getItem(LS.NOTIFS);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : [];
  });

  // Listas simuladas (solo UI; sin envíos reales)
  const evaluadores = useMemo(
    () => ["eva1@org.com", "eva2@org.com", "eva3@org.com"],
    []
  );
  const responsables = useMemo(() => ["resp1@org.com", "resp2@org.com"], []);

  /** Persistencia */
  useEffect(() => localStorage.setItem(LS.STATUS, status), [status]);
  useEffect(
    () => localStorage.setItem(LS.WINDOW, JSON.stringify(windowPhase)),
    [windowPhase]
  );
  useEffect(
    () => localStorage.setItem(LS.HISTORY, JSON.stringify(history)),
    [history]
  );
  useEffect(
    () => localStorage.setItem(LS.GRADES, JSON.stringify(grades)),
    [grades]
  );
  useEffect(
    () => localStorage.setItem(LS.NOTIFS, JSON.stringify(notifications)),
    [notifications]
  );

  /** Reglas de ventana abierta */
  const isOpenNow = useMemo(() => {
    if (status !== "EN_CURSO") return false;
    const now = Date.now();
    if (windowPhase.start && now < windowPhase.start) return false;
    if (windowPhase.end && now > windowPhase.end) return false;
    return true;
  }, [status, windowPhase]);

  /** Helpers */
  const addHistory = (p: Omit<HistoryItem, "id" | "timestamp">) =>
    setHistory((h) => [
      { id: crypto.randomUUID(), timestamp: Date.now(), ...p },
      ...h,
    ]);

  const addNotif = (n: Omit<NotificationItem, "id" | "timestamp">) =>
    setNotifications((ns) => [
      { id: crypto.randomUUID(), timestamp: Date.now(), ...n },
      ...ns,
    ]);

  /** Acciones */
  const abrirFase = () => {
    if (status === "EN_CURSO") return;
    const now = Date.now();
    setStatus("EN_CURSO");
    setWindowPhase({ start: now, end: undefined });
    addHistory({ user: adminUser, action: "Abrir fase", statusAfter: "EN_CURSO" });
    addNotif({
      subject: "Se abrió la fase de calificaciones",
      body: `La fase se abrió el ${fmt(now)}. Ya pueden subir calificaciones dentro del periodo.`,
      recipients: [...evaluadores, ...responsables],
    });
    alert("Fase abierta (simulación sin backend).");
  };

  const cerrarFase = () => {
    if (status === "CERRADA") return;
    const now = Date.now();
    setStatus("CERRADA");
    setWindowPhase((w) => ({ ...w, end: now }));
    addHistory({ user: adminUser, action: "Cerrar fase", statusAfter: "CERRADA" });
    addNotif({
      subject: "Se cerró la fase de calificaciones",
      body: `La fase se cerró el ${fmt(now)}. Ya no se permiten registros.`,
      recipients: [...evaluadores, ...responsables],
    });
    alert("Fase cerrada (simulación sin backend).");
  };

  const publicar = () => {
    if (status === "PUBLICADA") return;
    setStatus("PUBLICADA");
    addHistory({
      user: adminUser,
      action: "Publicar resultados",
      statusAfter: "PUBLICADA",
    });
    addNotif({
      subject: "Resultados publicados",
      body: `Se publicaron los resultados el ${fmt(Date.now())}.`,
      recipients: [...evaluadores, ...responsables],
    });
    alert("Resultados publicados (simulación sin backend).");
  };

  /** Registro de calificaciones (bloqueado fuera de fase) */
  const registrarNota = (studentId: string, score: number) => {
    if (!isOpenNow) {
      alert("⛔ No se pueden registrar calificaciones: la fase no está abierta.");
      return;
    }
    setGrades((g) => [
      { id: crypto.randomUUID(), studentId, score, timestamp: Date.now() },
      ...g,
    ]);
    alert("Calificación registrada.");
  };

  /** UI */
  return (
    <div className="wrap">
      <header className="header">
        <h1>Gestión de Fases de Evaluación</h1>
        <div className="current">
          <span>Estado actual:</span>
          <span className={badge(status)}>{statusLabel(status)}</span>
          {status === "EN_CURSO" && windowPhase.start && (
            <small className="hint">Abierta desde {fmt(windowPhase.start)}</small>
          )}
          {windowPhase.end && (
            <small className="hint">Cerrada el {fmt(windowPhase.end)}</small>
          )}
        </div>
        <div className="actions">
          <button className="btn success" onClick={abrirFase} disabled={status === "EN_CURSO"}>
            Abrir Fase
          </button>
          <button className="btn danger" onClick={cerrarFase} disabled={status === "CERRADA"}>
            Cerrar Fase
          </button>
          <button className="btn primary" onClick={publicar} disabled={status === "PUBLICADA"}>
            Publicar Resultados
          </button>
        </div>
      </header>

      <section className="panel">
        <h2>Registro de Calificaciones (demo, sin backend)</h2>
        <p className="muted">
          Solo disponible cuando la fase está <strong>En curso</strong> y dentro del periodo.
        </p>
        <GradeForm disabled={!isOpenNow} onSubmit={registrarNota} />
        <ul className="grade-list">
          {grades.length === 0 ? (
            <li className="empty">Sin calificaciones registradas.</li>
          ) : (
            grades.map((r) => (
              <li className="grade-item" key={r.id}>
                <span>Estudiante: {r.studentId}</span>
                <span>Nota: {r.score}</span>
                <span>{fmt(r.timestamp)}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Historial de Cambios de Fase</h2>
          <input
            className="search"
            placeholder="Buscar en historial…"
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              const rows = document.querySelectorAll<HTMLTableRowElement>(
                "table.history tbody tr"
              );
              rows.forEach((tr) => (tr.style.display = tr.innerText.toLowerCase().includes(q) ? "" : "none"));
            }}
          />
        </div>
        <table className="history">
          <thead>
            <tr>
              <th>#</th>
              <th>Acción</th>
              <th>Fecha y hora</th>
              <th>Usuario</th>
              <th>Estado resultante</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">Aún no hay cambios.</td>
              </tr>
            ) : (
              history.map((h, i) => (
                <tr key={h.id}>
                  <td>{history.length - i}</td>
                  <td>{h.action}</td>
                  <td>{fmt(h.timestamp)}</td>
                  <td>{h.user}</td>
                  <td><span className={badge(h.statusAfter)}>{statusLabel(h.statusAfter)}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Bandeja de Notificaciones (simuladas)</h2>
        <ul className="notif-list">
          {notifications.length === 0 ? (
            <li className="empty">Sin notificaciones.</li>
          ) : (
            notifications.map((n) => (
              <li key={n.id} className="notif-item">
                <div className="notif-head">
                  <strong>{n.subject}</strong>
                  <span className="muted">{fmt(n.timestamp)}</span>
                </div>
                <div className="notif-body">{n.body}</div>
                <div className="notif-to">
                  <span className="muted">Para:</span> {n.recipients.join(", ")}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <style>{css}</style>
    </div>
  );
}

/** ========= Formulario de calificaciones ========= */
function GradeForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (studentId: string, score: number) => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [score, setScore] = useState<number | "">("");

  return (
    <form
      className="grade-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled) return;
        if (!studentId.trim()) return alert("Ingresa el ID del estudiante.");
        const val = typeof score === "string" ? NaN : score;
        if (isNaN(val) || val < 0 || val > 100) return alert("Nota entre 0 y 100.");
        onSubmit(studentId.trim(), val);
        setStudentId("");
        setScore("");
      }}
    >
      <input
        placeholder="ID estudiante"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        disabled={disabled}
      />
      <input
        type="number"
        placeholder="Nota (0–100)"
        min={0}
        max={100}
        value={score}
        onChange={(e) => setScore(e.target.value === "" ? "" : +e.target.value)}
        disabled={disabled}
      />
      <button className="btn success" disabled={disabled}>Registrar</button>
      {disabled && <span className="locked">⛔ Bloqueado: fase no abierta.</span>}
    </form>
  );
}

/** ========= Estilos base (inline) ========= */
const css = `
:root {
  --bg:#0b0c10; --panel:#111319; --muted:#9aa4b2; --text:#e6e8ee;
  --green:#10b981; --blue:#3b82f6; --red:#ef4444; --gray:#6b7280;
  --border:#232837;
}
*{box-sizing:border-box} body{background:var(--bg);color:var(--text);font-family:Inter,system-ui,Segoe UI,Roboto,Arial}
.wrap{max-width:1100px;margin:24px auto;padding:12px}
.header{background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:16px;display:grid;gap:12px}
.header h1{margin:0;font-size:20px}
.current{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.hint{color:var(--muted)}
.actions{display:flex;gap:8px;flex-wrap:wrap}
.btn{border:1px solid transparent;background:#1f2433;color:var(--text);padding:10px 14px;border-radius:12px;cursor:pointer;font-weight:600}
.btn:hover{filter:brightness(1.1)} .btn:disabled{opacity:.5;cursor:not-allowed}
.btn.success{background:#0e2a22;border-color:#134e4a}
.btn.primary{background:#10223d;border-color:#1f3b77}
.btn.danger{background:#2a1212;border-color:#7f1d1d}
.badge{padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700}
.badge.green{background:#052e26;color:#34d399;border:1px solid #134e4a}
.badge.blue{background:#0b2247;color:#60a5fa;border:1px solid #1d4ed8}
.badge.gray{background:#1f2430;color:#cbd5e1;border:1px solid #334155}
.panel{background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:16px;margin-top:16px}
.panel h2{margin:0 0 8px 0;font-size:18px}
.panel .muted{color:var(--muted);margin:0 0 12px}
.panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
.search{background:#0b0d14;color:var(--text);border:1px solid var(--border);padding:8px 10px;border-radius:10px;min-width:260px}
.history{width:100%;border-collapse:collapse;font-size:14px}
.history th,.history td{border-top:1px solid var(--border);padding:10px 8px;text-align:left}
.history thead th{border-top:none;color:#cbd5e1;font-weight:700;background:#111522}
.empty{color:var(--muted);text-align:center}
.grade-form{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.grade-form input{background:#0b0d14;color:var(--text);border:1px solid var(--border);padding:8px 10px;border-radius:10px}
.grade-list{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:6px}
.grade-item{display:flex;gap:12px;background:#0b0d14;padding:10px;border-radius:12px;border:1px solid var(--border)}
.locked{color:#fca5a5;font-weight:600}
.notif-list{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.notif-item{background:#0b0d14;border:1px solid var(--border);border-radius:12px;padding:12px}
.notif-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:6px}
.notif-to{color:#cbd5e1;font-size:13px;margin-top:6px}
`;
