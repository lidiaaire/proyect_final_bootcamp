import { useEffect, useState } from "react";
import { updateUser, deleteUser } from "../api/users";
import styles from "../styles/TestUser.module.css";

export default function TestUser() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const userFromStorage = localStorage.getItem("user");

    let parsedUser = null;

    try {
      if (userFromStorage && userFromStorage !== "undefined") {
        parsedUser = JSON.parse(userFromStorage);
      }
    } catch (error) {
      console.error("Error parsing user:", error);
      localStorage.removeItem("user");
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsedUser);

    if (parsedUser) {
      setName(parsedUser.nombreCompleto); // ✅ CORRECTO
      setEmail(parsedUser.email);
    }
  }, []);

  const handleUpdate = async () => {
    try {
      await updateUser(user._id || user.id, {
        nombreCompleto: name,
        email,
      });

      const updatedLocalUser = {
        ...user,
        nombreCompleto: name,
        email,
      };

      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      setUser(updatedLocalUser); // 🔥 importante para refrescar UI

      alert("Usuario actualizado");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(user._id || user.id);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div className={styles.profileContainer}>
      <p className={styles.title}>Mi perfil</p>

      <input
        className={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
      />

      <input
        className={styles.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <button className={styles.saveButton} onClick={handleUpdate}>
        Guardar cambios
      </button>

      <button className={styles.deleteButton} onClick={handleDelete}>
        Eliminar cuenta
      </button>
    </div>
  );
}
