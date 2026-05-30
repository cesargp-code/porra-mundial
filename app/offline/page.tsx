import Image from "next/image";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="screen offline-screen">
      <section className="offline-panel" aria-labelledby="offline-title">
        <Image src="/icons/icon-192.png" alt="" width={96} height={96} />
        <h1 id="offline-title">Sin conexión</h1>
        <p>
          La porra necesita conexión para cargar partidos, predicciones y
          clasificación.
        </p>
        <Link href="/" className="offline-link">
          Reintentar
        </Link>
      </section>
    </main>
  );
}
