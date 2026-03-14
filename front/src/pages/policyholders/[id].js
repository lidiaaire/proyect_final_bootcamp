import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
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

function calculatePolicyTenure(startDate) {
  const today = new Date();
  const start = new Date(startDate);

  let years = today.getFullYear() - start.getFullYear();
  const m = today.getMonth() - start.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < start.getDate())) {
    years--;
  }

  return years;
}

export default function PolicyholderProfile() {
  const router = useRouter();
  const { id } = router.query;

  const policyholder = {
    id: id,
    name: "María López",
    dni: "45034231",
    dateOfBirth: "1983-06-12",
    policyType: "Completa",
    policyStartDate: "2019-03-15",
    phone: "+34 600 123 456",
    email: "maria.lopez@email.com",
    address: "Calle Gran Vía 12, Madrid",
  };

  const age = calculateAge(policyholder.dateOfBirth);
  const tenure = calculatePolicyTenure(policyholder.policyStartDate);

  const [noteInput, setNoteInput] = useState("");

  const [notes, setNotes] = useState([
    {
      id: 1,
      text: "El asegurado llama preguntando estado de la autorización",
      date: "2026-03-12",
      author: "Carlos",
    },
    {
      id: 2,
      text: "Documentación médica solicitada",
      date: "2026-03-11",
      author: "Laura",
    },
  ]);

  function addNote() {
    if (!noteInput.trim()) return;

    const newNote = {
      id: Date.now(),
      text: noteInput,
      date: new Date().toISOString().split("T")[0],
      author: "Gestor",
    };

    setNotes([newNote, ...notes]);
    setNoteInput("");
  }

  const requests = [
    {
      id: "10234",
      policyholderId: "823456",
      service: "Resonancia magnética",
      date: "2025-11-03",
      status: "AUTORIZADA",
    },
    {
      id: "10211",
      policyholderId: "823456",
      service: "Consulta traumatología",
      date: "2025-10-20",
      status: "RECHAZADA",
    },
    {
      id: "10198",
      policyholderId: "823456",
      service: "Fisioterapia",
      date: "2025-09-15",
      status: "AUTORIZADA",
    },
  ];

  const claimsHistory = requests.filter((req) => req.policyholderId === id);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{policyholder.name.charAt(0)}</div>

        <div>
          <h1 className={styles.name}>{policyholder.name}</h1>

          <div className={styles.metaRow}>
            <span>DNI: {policyholder.dni}</span>
            <span>Póliza: {policyholder.id}</span>
            <span>Edad: {age}</span>
            <span>Antigüedad: {tenure} años</span>
            <span>Tipo: {policyholder.policyType}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href={`/requests/new?policyholderId=${policyholder.id}`}>
            <button className={styles.newRequestButton}>
              + Nueva solicitud
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.profileGrid}>
        <div className={styles.card}>
          <h2>Datos del asegurado</h2>

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
          <h2>Notas internas</h2>

          <div className={styles.noteInputRow}>
            <textarea
              placeholder="Añadir nota interna..."
              rows="3"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className={styles.textarea}
            />

            <button className={styles.addNoteButton} onClick={addNote}>
              Añadir
            </button>
          </div>

          <div className={styles.notesTimeline}>
            {notes.map((note) => (
              <div key={note.id} className={styles.noteItem}>
                <div className={styles.noteHeader}>
                  <span>{note.date}</span>
                  <span>{note.author}</span>
                </div>

                <p>{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.claimsSection}>
        <h2>Claims history</h2>

        <table className={styles.claimsTable}>
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
            {claimsHistory.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.id}</td>
                <td>{claim.service}</td>
                <td>{claim.date}</td>
                <td>{claim.status}</td>

                <td>
                  <Link href={`/requests/${claim.id}`}>Ver solicitud</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
