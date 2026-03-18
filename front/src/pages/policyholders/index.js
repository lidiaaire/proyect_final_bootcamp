// Esta página representa la vista principal de la sección de asegurados, donde se muestra una lista de todos los asegurados registrados en el sistema. Utiliza el hook useEffect para cargar los datos de los asegurados desde la API al montar el componente, y el hook useState para manejar el estado de los asegurados, la búsqueda y la carga. La página también incluye un campo de búsqueda que permite filtrar los asegurados por nombre, DNI o número de póliza, lo que facilita a los usuarios encontrar rápidamente el asegurado que están buscando. Asegúrate de que los campos utilizados en esta página coincidan con los campos definidos en el backend para garantizar una correcta visualización de la información de los asegurados.
// La página utiliza estilos definidos en Policyholders.module.css para darle una apariencia atractiva y organizada a la lista de asegurados. La información de cada asegurado se muestra en una tabla con columnas para el nombre, DNI, número de póliza y un enlace para ver el perfil del asegurado. Asegúrate de que los estilos estén correctamente aplicados para mejorar la experiencia del usuario al navegar por la sección de asegurados y facilitar la identificación rápida de cada asegurado en la lista.

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

        const array =
          data.policyholders || data.data || data.results || data || [];

        setPolicyholders(Array.isArray(array) ? array : []);
      } catch (error) {
        console.error("Error cargando asegurados:", error);
        setPolicyholders([]);
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
