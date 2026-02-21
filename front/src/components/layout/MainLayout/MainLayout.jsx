import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../../styles/MainLayout.module.css";

export default function MainLayout({ children }) {
  const router = useRouter();
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRole(payload.role);
      } catch (error) {
        setRole("");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <div className={styles.appName}>Flowly</div>
          {role && <div className={styles.role}>Rol: {role}</div>}
        </div>

        <button className={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className={styles.content}>{children}</main>
    </>
  );
}
