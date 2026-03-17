import MainLayout from "../components/layout/MainLayout/MainLayout";
import "@/styles/globals.css";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // 🔴 RUTAS SIN LAYOUT
  const noLayoutRoutes = ["/login"];

  const isNoLayout = noLayoutRoutes.includes(router.pathname);

  if (isNoLayout) {
    return <Component {...pageProps} />;
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
