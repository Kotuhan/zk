import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import { Loader } from "./Loader";

export const Auth: React.FC = () => {
  const { signIn, signUp, loading } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Заповніть всі поля", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Пароль має бути мінімум 6 символів", "error");
      return;
    }

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        showToast(error.message, "error");
      } else {
        showToast("Перевірте вашу пошту для підтвердження!", "success");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        showToast("Невірний email або пароль", "error");
      } else {
        showToast("Успішний вхід!", "success");
      }
    }
  };

  if (loading) {
    return <Loader fullScreen message="Завантаження..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Калькулятор прибутковості</h1>
          <p className="auth-subtitle">
            {isSignUp ? "Створіть акаунт" : "Увійдіть в систему"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            className="btnPrimary btn-full"
            disabled={loading}
          >
            {loading
              ? "Завантаження..."
              : isSignUp
              ? "Зареєструватися"
              : "Увійти"}
          </button>

          <button
            type="button"
            className="btn-link"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Вже є акаунт? Увійти"
              : "Немає акаунту? Зареєструватись"}
          </button>
        </form>
      </div>
    </div>
  );
};
