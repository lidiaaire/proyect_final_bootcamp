import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../styles/Policyholders.module.css";

export default function PolicyholdersPage() {
  const [policyholders, setPolicyholders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPolicyholders() {
      try {
        const res = await fetch("http://localhost:4000/policyholders");
        const data = await res.json();
        setPolicyholders(data);
      } catch (error) {
        console.error("Error cargando asegurados:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPolicyholders();
  }, []);

  const filtered = policyholders.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.dni.includes(search) ||
      String(p.id).includes(search),
  );

  if (loading) {
    return <div className={styles.loading}>Cargando asegurados...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Asegurados</h1>

        <input
          type="text"
          placeholder="Buscar por nombre, DNI o póliza..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Asegurado</th>
              <th>DNI</th>
              <th>Póliza</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>{p.name.charAt(0)}</div>
                    <div>
                      <div className={styles.name}>{p.name}</div>
                      <div className={styles.email}>{p.email}</div>
                    </div>
                  </div>
                </td>

                <td>{p.dni}</td>
                <td>{p.id}</td>

                <td>
                  <Link href={`/policyholders/${p.id}`} className={styles.link}>
                    Ver perfil
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
