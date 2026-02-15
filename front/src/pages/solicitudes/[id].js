import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { changeEstado } from "../../api/solicitudes";

const userRole = "PRESTACIONES";

export default function SolicitudDetalle() {
  const router = useRouter();
  const { id } = router.query;

  const [solicitud, setSolicitud] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchSolicitud = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/solicitudes/${id}`,
          {
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OTE5Y2RjNTY4MDA5ZWY4YzRjODUxOCIsInJvbGUiOiJESVJFQ0NJT05fTUVESUNBIiwiaWF0IjoxNzcxMTUzMjgzLCJleHAiOjE3NzExODIwODN9.3ArSfMJBNix3y6xYx0uvjlfNc2y7YdN_n52IDmxjPIQ",
            },
          },
        );

        const data = await response.json();
        setSolicitud(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSolicitud();
  }, [id]);

  if (!solicitud) return <p>Cargando...</p>;

  const handleCambio = async (nuevoEstado) => {
    try {
      await changeEstado(
        id,
        nuevoEstado,
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OTE5Y2RjNTY4MDA5ZWY4YzRjODUxOCIsInJvbGUiOiJESVJFQ0NJT05fTUVESUNBIiwiaWF0IjoxNzcxMTUzMjgzLCJleHAiOjE3NzExODIwODN9.3ArSfMJBNix3y6xYx0uvjlfNc2y7YdN_n52IDmxjPIQ",
      );
      router.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <h1>Detalle de Solicitud</h1>
      <p>Nombre: {solicitud.nombreCompleto}</p>
      <p>Estado: {solicitud.estadoInterno}</p>
      <p>Poliza: {solicitud.numeroPoliza}</p>
      <p>DNI: {solicitud.dni}</p>
      <p>Prueba: {solicitud.nombrePrueba}</p>
      <p>Especialidad: {solicitud.especialidad}</p>
      <p>Centro: {solicitud.centroMedico}</p>

      {solicitud.currentDepartment === userRole &&
        solicitud.estadoInterno !== "AUTORIZADA" &&
        solicitud.estadoInterno !== "RECHAZADA" && (
          <>
            <button onClick={() => handleCambio("AUTORIZADA")}>
              Autorizar
            </button>

            <button onClick={() => handleCambio("RECHAZADA")}>Rechazar</button>
          </>
        )}
    </main>
  );
}
