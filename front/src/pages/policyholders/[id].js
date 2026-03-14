import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../styles/PolicyholderProfile.module.css";

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default function PolicyholderProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [policyholder, setPolicyholder] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    async function loadData() {
      try {
        const resPolicyholder = await fetch(
          `http://localhost:4000/policyholders/${id}`,
        );
        const policyholderData = await resPolicyholder.json();

        const resRequests = await fetch(
          "http://localhost:4000/api/solicitudes",
        );
        const requestsData = await resRequests.json();

        const filteredRequests = requestsData.filter(
          (req) => String(req.policyholderId) === String(id),
        );

        setPolicyholder(policyholderData);
        setRequests(filteredRequests);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router.isReady, id]);

  function statusClass(status) {
    if (!status) return styles.badge;
    const s = status.toLowerCase();
    if (s.includes("autoriz")) return styles.badgeApproved;
    if (s.includes("rechaz")) return styles.badgeRejected;
    if (s.includes("doc")) return styles.badgeDocs;
    return styles.badge;
  }

  if (loading) return <div className={styles.loading}>Cargando perfil...</div>;
  if (!policyholder) return <div className={styles.loading}>No encontrado</div>;

  const age = calculateAge(policyholder.dateOfBirth);

  const total = requests.length;
  const approved = requests.filter((r) =>
    r.status?.toLowerCase().includes("autoriz"),
  ).length;
  const rejected = requests.filter((r) =>
    r.status?.toLowerCase().includes("rechaz"),
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>{policyholder.name.charAt(0)}</div>

        <div>
          <h1>{policyholder.name}</h1>
          <div className={styles.meta}>
            DNI: {policyholder.dni} · Póliza: {policyholder.id} · Edad: {age} ·
            Tipo: {policyholder.policyType}
          </div>
        </div>

        <Link href={`/requests/new?policyholderId=${policyholder.id}`}>
          <button className={styles.newButton}>+ Nueva solicitud</button>
        </Link>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statNumber}>{total}</div>
          <div className={styles.statLabel}>Solicitudes</div>
        </div>

        <div className={styles.stat}>
          <div className={styles.statNumber}>{approved}</div>
          <div className={styles.statLabel}>Autorizadas</div>
        </div>

        <div className={styles.stat}>
          <div className={styles.statNumber}>{rejected}</div>
          <div className={styles.statLabel}>Rechazadas</div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Datos del asegurado</h3>
          <p>
            <strong>Teléfono:</strong> {policyholder.phone}
          </p>
          <p>
            <strong>Email:</strong> {policyholder.email}
          </p>
          <p>
            <strong>Dirección:</strong> {policyholder.address}
          </p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <h3>Historial de solicitudes</h3>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => (
              <tr key={r._id || r.id}>
                <td>{r._id || r.id}</td>
                <td>{r.service}</td>
                <td>{r.date}</td>

                <td>
                  <span className={statusClass(r.status)}>{r.status}</span>
                </td>

                <td>
                  <Link href={`/solicitudes/${r._id || r.id}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
