import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getFirebaseApp } from "@/lib/firebase";

export default function Login() {
  const { user, isLoadingAuth, login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!getFirebaseApp()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] p-4">
        <p className="text-[#8A8A80]">Firebase nicht konfiguriert. Bitte VITE_FIREBASE_* in .env setzen.</p>
      </div>
    );
  }

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
          onClick={() => { setIsSignup(!isSignup); setError(""); }}
          className="w-full mt-4 text-sm text-[#0088cc] hover:underline"
        >
          {isSignup ? "Bereits Konto? Anmelden" : "Konto erstellen"}
        </button>
      </div>
    </div>
  );
}
