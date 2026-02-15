import { useEffect, useState } from "react";
import { getSolicitudes } from "../../../api/solicitudes";
import SolicitudItem from "../SolicitudItem/SolicitudItem";

export default function SolicitudesList() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSolicitudes();
        setSolicitudes(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <ul>
      {solicitudes.map((s) => (
        <SolicitudItem key={s._id} solicitud={s} />
      ))}
    </ul>
  );
}
