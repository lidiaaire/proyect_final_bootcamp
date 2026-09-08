import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, ClipboardList, Users, MessageSquare } from "lucide-react";
import styles from "./Sidebar.module.css";

// Navegación aprobada en la auditoría UX/UI (Sprint 2B): una sola
// arquitectura de Flowly, adaptada por visibilidad según rol -- no
// cuatro sidebars distintas. "Asegurados" es responsabilidad de gestión
// de pólizas (Prestaciones/Admin); Dirección Médica y Asesoría Jurídica
// revisan casos concretos, no gestionan el listado completo de pólizas.
const NAV_ITEMS = [
  { key: "home", label: "Inicio", href: "/", icon: LayoutDashboard, roles: null },
  { key: "solicitudes", label: "Solicitudes", href: "/solicitudes", icon: ClipboardList, roles: null },
  { key: "asegurados", label: "Asegurados", href: "/policyholders", icon: Users, roles: ["PRESTACIONES", "ADMIN"] },
  { key: "comunicaciones", label: "Comunicaciones", href: "/comunicaciones", icon: MessageSquare, roles: null },
];

const CHANNELS = [
  { id: "avisos-oficiales", name: "Avisos Oficiales" },
  { id: "prestaciones", name: "Prestaciones" },
  { id: "direccion-medica", name: "Dirección Médica" },
  { id: "asesoria-juridica", name: "Asesoría Jurídica" },
  { id: "general", name: "General" },
];

function esRutaActiva(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ rol }) {
  const router = useRouter();

  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(rol));
  const enComunicaciones = router.pathname.startsWith("/comunicaciones");

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        {/* eslint-disable-next-line @next/next/no-img-element -- asset de
            marca oficial (no CSS/redibujado); se sirve tal cual desde
            /public/branding, sin recortar ni alterar sus colores. */}
        <img
          src="/branding/flowly-logo.png"
          alt="Flowly · Gestión de autorizaciones médicas"
          width={2172}
          height={724}
          className={styles.brandLogo}
        />
      </div>

      <nav className={styles.nav}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = esRutaActiva(router.pathname, item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
            >
              <Icon size={19} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {enComunicaciones && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Canales</div>

          <div className={styles.channelList}>
            {CHANNELS.map((ch) => {
              const href = `/comunicaciones/${ch.id}`;
              const active = router.pathname === "/comunicaciones/[channel]" && router.query.channel === ch.id;

              return (
                <Link
                  key={ch.id}
                  href={href}
                  className={`${styles.channelLink} ${active ? styles.channelLinkActive : ""}`}
                >
                  # {ch.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.spacer} />

      {/* Tarjeta de marca al pie (referencia visual del dashboard): es
          contenido puramente decorativo/de marca, no un widget con datos
          -- ocupa el mismo lugar que en la referencia sin implicar
          ninguna funcionalidad que no exista. */}
      <div className={styles.promoCard}>
        <p className={styles.promoText}>
          Cada solicitud acerca a alguien a una mejor salud.
        </p>
        <span className={styles.promoAccent} />
      </div>
    </aside>
  );
}
