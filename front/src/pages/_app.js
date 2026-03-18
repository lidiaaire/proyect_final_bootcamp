// Este archivo es el punto de entrada principal de la aplicación Next.js, donde se define el componente App que envuelve todas las páginas de la aplicación. En este componente, se utiliza el hook useRouter para obtener la ruta actual y determinar si se debe renderizar un layout específico para ciertas rutas. En este caso, se define un array noLayoutRoutes que contiene las rutas que no deben utilizar el layout principal (por ejemplo, la página de login). Si la ruta actual coincide con alguna de las rutas en noLayoutRoutes, se renderiza el componente de la página directamente sin envolverlo en el MainLayout. De lo contrario, se envuelve el componente de la página dentro del MainLayout, lo que permite compartir una estructura común (como encabezados, menús, etc.) en todas las páginas que no están excluidas. Asegúrate de que los nombres de las rutas en noLayoutRoutes coincidan con las rutas definidas en tu aplicación para garantizar un comportamiento correcto.
// El MainLayout es un componente que proporciona una estructura común para las páginas de la aplicación, incluyendo elementos como el encabezado, el menú de navegación y el pie de página. Al envolver las páginas dentro del MainLayout, se asegura que estas páginas compartan una apariencia y funcionalidad consistente en toda la aplicación, lo que mejora la experiencia del usuario al navegar por diferentes secciones de la aplicación. Asegúrate de que el MainLayout esté correctamente implementado para incluir los elementos comunes que deseas mostrar en todas las páginas, y que se adapte correctamente a las diferentes rutas y contenidos de cada página.

import MainLayout from "../components/layout/MainLayout/MainLayout";
import "@/styles/globals.css";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

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
