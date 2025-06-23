import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PSV360 from "../components/PSV360";

export default function LandingPage() {
  const { signIn, loading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await signIn(email, password);
    if (result && result.error) setError(result.error.message);
  };

  // Google login
  const { signInWithGoogle } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 360° background */}
      <PSV360 />
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1,
        }}
      />
      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 2,
            textShadow: "0 4px 32px #000, 0 1px 0 #333",
            marginBottom: 16,
          }}
        >
          tourify.cl
        </h1>
        <h2
          style={{
            color: "#fff",
            fontWeight: 400,
            fontSize: "1.5rem",
            marginBottom: 32,
            textShadow: "0 2px 8px #000",
          }}
        >
          Explora, crea y comparte tours virtuales 360°
        </h2>
        {!user && (
          <button
            type="button"
            onClick={signInWithGoogle}
            style={{
              background: "#fff",
              color: "#222",
              fontWeight: 700,
              fontSize: "1.1rem",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              cursor: "pointer",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <img
              src="https://w7.pngwing.com/pngs/326/85/png-transparent-google-logo-google-text-trademark-logo-thumbnail.png"
              alt="Google"
              style={{ width: 24, height: 24 }}
            />
            Iniciar sesión con Google
          </button>
        )}
        {user && (
          <>
            <div
              style={{
                color: "#fff",
                marginTop: 32,
                fontSize: "1.2rem",
              }}
            >
              ¡Bienvenido, {user.email}!
            </div>
            <button
              style={{
                marginTop: 24,
                background: "#00e0d3",
                color: "#222",
                fontWeight: 700,
                fontSize: "1.1rem",
                border: "none",
                borderRadius: 8,
                padding: "12px 32px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onClick={() => (window.location.href = "/builder")}
            >
              Ir al constructor de tours
            </button>
          </>
        )}
      </div>
    </div>
  );
}
