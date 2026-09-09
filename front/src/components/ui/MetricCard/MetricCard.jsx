import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./MetricCard.module.css";

// KPI genérico (Sprint 2E, jerarquía visual reforzada en 3A): un número
// real + su etiqueta, opcionalmente enlazado. `tone`/`icon` son
// puramente de presentación (asocian el chip a un color semántico ya
// existente en la paleta). `sublabel` es una segunda línea descriptiva
// opcional (p.ej. "Requieren tu revisión") -- mismo dato, más contexto.
// `size="lg"` (pasada visual del dashboard) añade una clase modificadora
// y agranda el icono -- el resto de pantallas sigue con el tamaño md.
export default function MetricCard({ value, label, sublabel, href, icon: Icon, tone = "neutral", size = "md" }) {
  const toneVars = {
    "--tone": `var(--${tone})`,
    "--tone-bg": `var(--${tone}-bg)`,
  };
  const cardClassName = `${styles.card} ${size === "lg" ? styles.lg : ""}`;
  const iconSize = size === "lg" ? 24 : 20;

  const content = (
    <>
      {Icon && (
        <span className={styles.iconChip}>
          <Icon size={iconSize} strokeWidth={1.75} />
        </span>
      )}
      {href && (
        <span className={styles.arrow}>
          <ArrowRight size={14} strokeWidth={2} />
        </span>
      )}
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {sublabel && <div className={styles.sublabel}>{sublabel}</div>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName} style={toneVars}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClassName} style={toneVars}>
      {content}
    </div>
  );
}
