import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getFirebaseApp } from "@/lib/firebase";

export default function Login() {
  const { user, isLoadingAuth, login, loginWithGoogle, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="w-8 h-8 border-4 border-[#E8E8E0] border-t-[#0088cc] rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  if (!getFirebaseApp()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] p-4">
        <p className="text-[#8A8A80]">Firebase nicht konfiguriert. Bitte VITE_FIREBASE_* in .env setzen.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err?.message || "Anmeldung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err?.message || "Google-Anmeldung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] p-4">
      <div className="w-full max-w-sm bg-white border border-[#E8E8E0] rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-6 text-center">Anmelden</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E8E0] rounded-lg text-[#1A1A1A] placeholder:text-[#8A8A80] focus:outline-none focus:ring-2 focus:ring-[#0088cc]/30"
            />
          )}
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-[#E8E8E0] rounded-lg text-[#1A1A1A] placeholder:text-[#8A8A80] focus:outline-none focus:ring-2 focus:ring-[#0088cc]/30"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-[#E8E8E0] rounded-lg text-[#1A1A1A] placeholder:text-[#8A8A80] focus:outline-none focus:ring-2 focus:ring-[#0088cc]/30"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider bg-[#0088cc] text-white hover:bg-[#0077b3] disabled:opacity-50"
          >
            {loading ? "…" : isSignup ? "Registrieren" : "Anmelden"}
          </button>
        </form>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-4 py-2.5 rounded-lg font-medium text-sm border border-[#E8E8E0] text-[#1A1A1A] hover:bg-[#F5F5F0] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Mit Google anmelden
        </button>
        <button
          type="button"
          onClick={() => { setIsSignup(!isSignup); setError(""); }}
          className="w-full mt-4 text-sm text-[#0088cc] hover:underline"
        >
          {isSignup ? "Bereits Konto? Anmelden" : "Konto erstellen"}
        </button>
      </div>
    </div>
  );
}
