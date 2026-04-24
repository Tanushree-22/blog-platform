import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', bio: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!/\d/.test(form.password)) errs.password = 'Password must contain at least one number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form);
    if (result.success) navigate('/');
  };

  return (
    <>
      <Helmet><title>Create Account — BlogSpace</title></Helmet>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">✦ BlogSpace</Link>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-sub">Join thousands of writers and readers</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className={`form-input ${errors.name ? 'input-err' : ''}`}
                placeholder="Jane Smith" value={form.name} onChange={handleChange} autoComplete="name" />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" name="email" className={`form-input ${errors.email ? 'input-err' : ''}`}
                placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <input type={showPass ? 'text' : 'password'} name="password"
                  className={`form-input ${errors.password ? 'input-err' : ''}`}
                  placeholder="Min 6 chars, include a number"
                  value={form.password} onChange={handleChange} autoComplete="new-password" />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Bio <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
              <input type="text" name="bio" className="form-input"
                placeholder="Tell us a little about yourself"
                value={form.bio} onChange={handleChange} maxLength={200} />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
