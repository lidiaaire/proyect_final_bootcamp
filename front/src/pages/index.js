import { useEffect } from "react";
import { useRouter } from "next/router";
import SolicitudesList from "@/components/solicitudes/SolicitudesList/SolicitudesList";
import MainLayout from "../components/layout/MainLayout/MainLayout";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <MainLayout>
      <SolicitudesList />
    </MainLayout>
  );
}
