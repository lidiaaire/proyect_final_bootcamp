export const getSolicitudes = async () => {
  const response = await fetch("http://localhost:4000/api/solicitudes", {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OTE5Y2RjNTY4MDA5ZWY4YzRjODUxOCIsInJvbGUiOiJESVJFQ0NJT05fTUVESUNBIiwiaWF0IjoxNzcxMTUzMjgzLCJleHAiOjE3NzExODIwODN9.3ArSfMJBNix3y6xYx0uvjlfNc2y7YdN_n52IDmxjPIQ",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener solicitudes");
  }

  return await response.json();
};

export const changeEstado = async (id, nuevoEstado, token) => {
  const response = await fetch(
    `http://localhost:4000/api/solicitudes/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nuevoEstado }),
    },
  );

  if (!response.ok) {
    throw new Error("Error al cambiar estado");
  }

  return await response.json();
};
