import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 Not Found — BlogSpace</title></Helmet>
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '5rem', marginBottom: '16px' }}>📄</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 700, marginBottom: '12px' }}>404</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '32px', maxWidth: '380px' }}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <button className="btn btn-secondary" onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    </>
  );
}
