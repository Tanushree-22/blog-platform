import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <>
      <Helmet><title>Sign In — BlogSpace</title></Helmet>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">✦ BlogSpace</Link>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Sign in to continue writing and reading</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email" name="email" autoComplete="email"
                className="form-input" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label className="form-label">Password</label>
              </div>
              <div className="input-with-icon">
                <input
                  type={showPass ? 'text' : 'password'} name="password"
                  autoComplete="current-password"
                  className="form-input" placeholder="Your password"
                  value={form.password} onChange={handleChange} required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>

          <div className="auth-demo">
            <p className="demo-label">Demo credentials</p>
            <button className="demo-btn" onClick={() => setForm({ email: 'demo@blogspace.com', password: 'demo123' })}>
              Fill demo account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
