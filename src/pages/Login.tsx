
import { useState, type FormEvent } from "react";
import { Leaf, LockKeyhole, Mail } from "lucide-react";
import { login } from "../api/authApi";
import "./Login.css";

type LoginProps = {
  onLogin: (token: string, roles: string[]) => void;
};

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ email, password });

      if (!result.token) {
        setError("Login succeeded without a token. Check the API response.");
        return;
      }

      const roles = result.roles ?? [];

      if (!roles.some((role) => role.toLowerCase() === "cashier")) {
        setError("Access denied. Please sign in with a Cashier account.");
        return;
      }

      onLogin(result.token, roles);
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        "Unable to sign in. Check your email, password, and API connection.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand-icon">
          <Leaf size={30} />
        </div>

        <h1>Plant Nursery</h1>
        <p className="login-subtitle">Sign in to your cashier workspace</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <div className="login-input">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="cashier@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="login-input">
            <LockKeyhole size={18} />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="login-footer">
          Authorized cashier access only
        </p>
      </section>
    </main>
  );
}

export default Login;
