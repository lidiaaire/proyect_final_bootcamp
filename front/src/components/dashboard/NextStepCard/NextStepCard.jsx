import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import buttonStyles from "@/styles/Button.module.css";
import styles from "./NextStepCard.module.css";

// "Siguiente paso" (dashboard, referencia visual contractual): no es un
// widget nuevo con datos propios -- es una lectura de prioridad sobre
// los mismos conteos reales que ya alimentan los KPIs y la bandeja
// (Sprint 2E). `step` es `null` cuando no hay nada pendiente real: en
// ese caso se muestra un estado "al día", nunca un paso inventado.
export default function NextStepCard({ step }) {
  if (!step) {
    return (
      <div className={styles.card}>
        <span className={styles.icon}>
          <CheckCircle2 size={22} strokeWidth={1.75} />
        </span>
        <h4 className={styles.title}>Todo al día</h4>
        <p className={styles.description}>No hay ninguna solicitud que requiera tu atención ahora mismo.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <span className={styles.icon}>
        <step.Icon size={22} strokeWidth={1.75} />
      </span>
      <h4 className={styles.title}>{step.title}</h4>
      <p className={styles.description}>{step.description}</p>
      <Link href={step.href} className={`${buttonStyles.btn} ${buttonStyles.primary} ${styles.cta}`}>
        {step.cta}
        <ArrowRight size={14} strokeWidth={2} />
      </Link>
    </div>
  );
}
