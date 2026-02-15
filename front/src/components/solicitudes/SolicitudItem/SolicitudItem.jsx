import Link from "next/link";

export default function SolicitudItem({ solicitud }) {
  return (
    <li>
      <Link href={`/solicitudes/${solicitud._id}`}>
        {solicitud.nombreCompleto} - {solicitud.estadoInterno}
      </Link>
    </li>
  );
}
