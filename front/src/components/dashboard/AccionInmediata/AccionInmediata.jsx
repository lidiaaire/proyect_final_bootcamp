import styles from "@/styles/AccionInmediata.module.css";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useRouter } from "next/router";

export default function AccionInmediata({ solicitudes }) {
  const router = useRouter();

  const pendientes = solicitudes
    .filter((s) => s.estadoInterno.startsWith("PENDIENTE"))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 3);

  const diasDesde = (fecha) => {
    const diff = new Date() - new Date(fecha);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const nivelUrgencia = (dias) => {
    if (dias > 7) return styles.critico;
    if (dias > 3) return styles.alerta;
    return styles.normal;
  };

  if (pendientes.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Prioridad alta</h3>
          <p className={styles.subtitle}>
            {pendientes.length} solicitudes pendientes más antiguas
          </p>
        </div>
      </div>

      <div className={styles.cardsWrapper}>
        {pendientes.map((s) => {
          const dias = diasDesde(s.createdAt);

          return (
            <div
              key={s._id}
              className={`${styles.card} ${
                s.dias >= 15
                  ? styles.criticoCard
                  : s.dias >= 7
                    ? styles.alertaCard
                    : ""
              }`}
              onClick={() => router.push(`/solicitudes/${s._id}`)}
            >
              <div className={styles.info}>
                <div className={styles.topRow}>
                  <div className={styles.nombreGrupo}>
                    <strong className={styles.nombre}>
                      {s.nombreCompleto}
                    </strong>

                    <StatusBadge status={s.estadoInterno} />
                  </div>

                  <div className={`${styles.days} ${nivelUrgencia(dias)}`}>
                    Hace {dias} días
                  </div>
                </div>

                <div className={styles.detallesCompact}>
                  {s.nombrePrueba} · {s.especialidad}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
