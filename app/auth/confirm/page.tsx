import { ConfirmButton } from "./ConfirmButton";

export const dynamic = "force-dynamic";

type Search = {
  token_hash?: string;
  type?: string;
  next?: string;
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { token_hash, type, next } = await searchParams;
  const valid = !!token_hash && !!type;

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <h1 className="auth-title">Porra Mundial</h1>
        <div className="auth-title-rule" />
        <p className="auth-subtitle">Liga privada entre amigos · Mundial 2026</p>
      </div>

      <div className="auth-card">
        {valid ? (
          <>
            <h2 className="auth-card-title">Confirma que eres tú</h2>
            <p className="auth-hint" style={{ marginBottom: 18 }}>
              Pulsa para entrar a la porra.
            </p>
            <ConfirmButton
              tokenHash={token_hash!}
              type={type!}
              next={next ?? "/"}
            />
          </>
        ) : (
          <>
            <h2 className="auth-card-title">Enlace inválido</h2>
            <p className="auth-hint">
              El enlace no es válido o ha caducado. Pide uno nuevo.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
