import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../Context/AuthContext';
import { useTranslation } from 'react-i18next';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuthContext();

  const validate = () => {
    const errors = {};
    if (!EMAIL_REGEX.test(email)) errors.email = t('validation.email_invalid');
    if (password.length < 8) errors.password = t('validation.password_short');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);
        navigate('/');
      } else {
        setError(data.message || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('auth.login_button')}</h1>
        <form onSubmit={handleLogin} noValidate>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
            <input
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
              placeholder="ejemplo@correo.com"
              required
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</label>
            <input
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
              placeholder="••••••••"
              required
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${isSubmitting ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-yellow-400 text-black hover:bg-yellow-300'
              }`}
          >
            {isSubmitting ? t('common.loading') : t('auth.login_button')}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          {t('auth.no_account')} <Link to="/register" className="text-yellow-600 hover:text-yellow-500">{t('auth.register_button')}</Link>
        </p>
      </div>
    </div>
  );
}