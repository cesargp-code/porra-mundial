import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Iniciar sesión — Porra Mundial",
};

export default function LoginPage() {
  const showDevLogin = process.env.NODE_ENV !== "production";

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <h1 className="auth-title">Porra Mundial</h1>
        <div className="auth-title-rule" />
        <p className="auth-subtitle">Liga privada entre amigos · Mundial 2026</p>
      </div>
      <LoginForm />
      {showDevLogin && (
        <div className="dev-login">
          <a href="/auth/dev-login" className="auth-button dev-login__button">
            Entrar como César
          </a>
        </div>
      )}
    </div>
  );
}
