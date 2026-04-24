import React from 'react';

export function Spinner({ size = 32, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid var(--border)`,
          borderTopColor: color || 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 22, width: '90%' }} />
        <div className="skeleton" style={{ height: 22, width: '70%' }} />
        <div className="skeleton" style={{ height: 14, width: '80%' }} />
        <div className="skeleton" style={{ height: 14, width: '60%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <div className="skeleton" style={{ height: 32, width: 120, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}
