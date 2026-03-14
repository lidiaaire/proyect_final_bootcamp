import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../styles/PolicyholderProfile.module.css";

export default function PolicyholdersPage() {
  const [policyholders, setPolicyholders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/policyholders")
      .then((res) => res.json())
      .then(setPolicyholders);

    fetch("http://localhost:4000/requests")
      .then((res) => res.json())
      .then(setRequests);
  }, []);

  const statsByPolicyholder = useMemo(() => {
    const map = {};

    for (const r of requests) {
      if (!map[r.policyholderId]) {
        map[r.policyholderId] = { count: 0, last: null };
      }

      map[r.policyholderId].count += 1;

      if (
        !map[r.policyholderId].last ||
        new Date(r.createdAt) > new Date(map[r.policyholderId].last.createdAt)
      ) {
        map[r.policyholderId].last = r;
      }
    }

    return map;
  }, [requests]);

  const filtered = policyholders.filter((p) => {
    const v = search.toLowerCase();

    return (
      p.name.toLowerCase().includes(v) || p.dni.includes(v) || p.id.includes(v)
    );
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Asegurados</h1>

        <input
          className={styles.search}
          placeholder="Buscar por nombre, DNI o póliza..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Asegurado</th>
              <th>DNI</th>
              <th>Póliza</th>
              <th>Tipo</th>
              <th>Solicitudes</th>
              <th>Último estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const stats = statsByPolicyholder[p.id] || {
                count: 0,
                last: null,
              };

              return (
                <tr key={p.id}>
                  <td className={styles.nameCell}>
                    <div className={styles.avatar}>{p.name.charAt(0)}</div>

                    <div>
                      <div className={styles.name}>{p.name}</div>
                      <div className={styles.sub}>{p.email}</div>
                    </div>
                  </td>

                  <td>{p.dni}</td>

                  <td>{p.id}</td>

                  <td>
                    <span className={styles.badge}>{p.policyType}</span>
                  </td>

                  <td>{stats.count}</td>

                  <td>
                    {stats.last ? (
                      <span
                        className={`${styles.status} ${styles[stats.last.status]}`}
                      >
                        {stats.last.status}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    <Link
                      className={styles.link}
                      href={`/policyholders/${p.id}`}
                    >
                      Ver perfil
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
