import { apiFetch } from "./apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const updateUser = async (id, data) => {
  const res = await apiFetch(`${API_BASE}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const deleteUser = async (id) => {
  const res = await apiFetch(`${API_BASE}/api/users/${id}`, {
    method: "DELETE",
  });

  return res.json();
};
