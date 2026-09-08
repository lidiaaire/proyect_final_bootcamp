import AppShell from "@/components/layout/AppShell/AppShell";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  // Cada página declara si quiere el shell (Login.noLayout = true, etc.)
  // -- antes esto se decidía con una lista aparte que solo contenía
  // "/login", por lo que /register (que ya declaraba el flag) se
  // renderizaba igualmente con el sidebar/topbar de la app detrás.
  if (Component.noLayout) {
    return <Component {...pageProps} />;
  }

  return (
    <AppShell>
      <Component {...pageProps} />
    </AppShell>
  );
}
