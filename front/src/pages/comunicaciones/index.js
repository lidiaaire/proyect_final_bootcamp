import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import { getChannelMessages } from "@/api/communications";
import { CHANNELS } from "@/core/constants/channels";
import styles from "@/styles/CommunicationsHome.module.css";

export default function CommunicationsHome() {
  // Recuento real de mensajes por canal (GET /api/communications/:canal,
  // ya usado por la vista de canal) -- no existe concepto de "no
  // leído" en el backend, así que se muestra el total real de mensajes,
  // nunca un número de "nuevos" que no se puede calcular honestamente.
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let activo = true;

    Promise.all(
      CHANNELS.map((ch) =>
        getChannelMessages(ch.id)
          .then((data) => [ch.id, Array.isArray(data) ? data.length : 0])
          .catch(() => [ch.id, null]),
      ),
    ).then((entries) => {
      if (activo) setCounts(Object.fromEntries(entries));
    });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Comunicaciones"
        subtitle="Accede a la información, novedades y comunicados relevantes de cada área."
      />

      <div className={styles.grid}>
        {CHANNELS.map((channel) => {
          const count = counts[channel.id];
          return (
            <Link key={channel.id} href={`/comunicaciones/${channel.id}`} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.icon}>
                  <channel.Icon size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className={styles.title}>{channel.label}</h3>
                  <p className={styles.description}>{channel.description}</p>
                </div>
              </div>

              <div className={styles.footer}>
                <span className={styles.countPill}>
                  <span className={styles.countDot} />
                  {count === undefined ? "Cargando..." : count === null ? "—" : `${count} mensaje${count === 1 ? "" : "s"}`}
                </span>
                <span className={styles.arrow}>
                  <ArrowRight size={15} strokeWidth={2} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
