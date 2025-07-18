import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Login screen for Supabase Auth (email/password).
 * Props:
 *   - supabase: Supabase client instance
 *   - onSignIn: callback on successful login
 */
function Login({ supabase, onSignIn }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      setError(error.message);
    } else if (data.session) {
      onSignIn(data.user);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-light, #f8f9fa)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form
        style={{
          background: "white",
          padding: "2.5em 2em",
          borderRadius: "9px",
          minWidth: "320px",
          maxWidth: "97vw",
          boxShadow: "0 2px 20px rgba(0,0,0,0.03),0 1.5px 4px #e0e0e0"
        }}
        onSubmit={handleLogin}
        autoComplete="off"
      >
        <div style={{
          fontWeight: 700,
          fontSize: "1.33em",
          color: "#1976D2",
          marginBottom: ".8em"
        }}>Sign in to Notes Organizer</div>
        <div style={{ marginBottom: "1em" }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: ".18em" }}>
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            required
            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
            style={{
              width: "100%", fontSize: "1em", padding: ".7em .93em",
              border: "1.5px solid #e0e0e0", borderRadius: ".4em"
            }}
            autoFocus
          />
        </div>
        <div style={{ marginBottom: "1.3em" }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: ".18em" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            required
            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            style={{
              width: "100%", fontSize: "1em", padding: ".7em .93em",
              border: "1.5px solid #e0e0e0", borderRadius: ".4em"
            }}
            minLength={6}
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div style={{ color: "#d32f2f", fontSize: ".98em", marginBottom: ".6em" }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          style={{
            background: "#1976D2",
            color: "#fff",
            padding: ".9em 0",
            fontWeight: 700,
            border: "none",
            borderRadius: ".4em",
            width: "100%", fontSize: "1.03em"
          }}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;
