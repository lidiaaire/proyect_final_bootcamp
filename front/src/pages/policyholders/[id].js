import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../styles/PolicyholderProfile.module.css";

export default function PolicyholderProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [policyholder, setPolicyholder] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

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

        const requestsArray =
          requestsData.data || requestsData.solicitudes || requestsData || [];
        console.log("REQUESTS API:", requestsArray);

        const filteredRequests = requestsArray.filter(
          (req) => String(req.poliza) === String(policyholderData.id),
        );

        setPolicyholder(policyholderData);
        setRequests(filteredRequests);

        setNotes(policyholderData.internalNotes || []);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router.isReady, id]);

  function addNote() {
    if (!newNote.trim()) return;

    const note = {
      text: newNote,
      date: new Date().toLocaleDateString(),
      author: "Usuario",
    };

    setNotes([note, ...notes]);
    setNewNote("");
  }

  function calculatePolicyYears(startDate) {
    const start = new Date(startDate);
    const today = new Date();

    let years = today.getFullYear() - start.getFullYear();
    const monthDiff = today.getMonth() - start.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < start.getDate())
    ) {
      years--;
    }

    return years;
  }

  const policyYears = policyholder
    ? calculatePolicyYears(policyholder.policyStartDate)
    : null;

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (!policyholder) return <div>No encontrado</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>{policyholder.name?.charAt(0)}</div>

          <div>
            <h1>{policyholder.name}</h1>
            <div className={styles.meta}>
              DNI: {policyholder.dni} · Póliza: {policyholder.id} · Antigüedad:{" "}
              {policyYears} años · Tipo: {policyholder.policyType}
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Link href={`/requests/new?policyholderId=${policyholder.id}`}>
            <button className={styles.primaryButton}>+ Nueva solicitud</button>
          </Link>
        </div>
      </div>

      <div className={styles.topGrid}>
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

        <div className={styles.card}>
          <h3>Notas internas</h3>

          <div className={styles.notesList}>
            {notes.map((note, index) => (
              <div key={index} className={styles.noteItem}>
                <div className={styles.noteDate}>
                  {note.date} — {note.author}
                </div>
                <div>{note.text}</div>
              </div>
            ))}
          </div>

          <div className={styles.noteInput}>
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Añadir nota interna..."
            />
            <button onClick={addNote}>Añadir</button>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <h3>Historial de solicitudes</h3>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Prueba</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => {
              const requestId = r._id || r.id;

              return (
                <tr key={requestId}>
                  <td>{requestId}</td>
                  <td>{r.nombrePrueba}</td>
                  <td>
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={`${styles.badge} ${
                        r.estadoInterno === "AUTORIZADA"
                          ? styles.badgeAutorizada
                          : r.estadoInterno === "RECHAZADA"
                            ? styles.badgeRechazada
                            : styles.badgePendiente
                      }`}
                    >
                      {r.estadoInterno}
                    </span>
                  </td>

                  <td>
                    <Link href={`/solicitudes/${requestId}`}>
                      <button className={styles.viewButton}>
                        Ver solicitud
                      </button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
