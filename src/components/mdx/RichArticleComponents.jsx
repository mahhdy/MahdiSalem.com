import React from 'react';

export const HeroSection = ({ title, subtitle, theme = 'blue', pattern = 'grid', author }) => {
  const themes = {
    blue: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    red: 'linear-gradient(135deg, #cc0000 0%, #8b0000 100%)',
    slate: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    purple: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
    amber: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    tricolore: 'linear-gradient(90deg, #002395 0%, #ffffff 50%, #ed2939 100%)',
    iran_russia: 'linear-gradient(90deg, #cc0000 0%, #1e3a8a 100%)'
  };

  const currentTheme = themes[theme] || themes.blue;
  const isTricolore = theme === 'tricolore';

  return (
    <div style={{
      background: currentTheme,
      borderRadius: '24px',
      padding: '4rem 2rem',
      marginBottom: '3rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      direction: 'rtl',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ 
          color: isTricolore ? '#1e293b' : '#ffffff', 
          fontSize: '3rem', 
          fontWeight: '950', 
          margin: '0 0 1rem 0',
          textShadow: isTricolore ? 'none' : '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ 
            color: isTricolore ? '#475569' : '#e2e8f0', 
            fontSize: '1.4rem', 
            maxWidth: '850px', 
            margin: '0 auto 2rem', 
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            {subtitle}
          </p>
        )}
        {author && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ color: isTricolore ? '#1e293b' : '#fff', opacity: 0.8 }}>✍️ {author}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const Callout = ({ type = 'info', title, children }) => {
  const styles = {
    info: { bg: '#f0f9ff', border: '#0ea5e9', icon: '💡', titleColor: '#0369a1' },
    warning: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️', titleColor: '#b45309' },
    critical: { bg: '#fef2f2', border: '#ef4444', icon: '🚨', titleColor: '#b91c1c' },
    quote: { bg: '#f8fafc', border: '#64748b', icon: '💬', titleColor: '#1e293b' },
    theory: { bg: '#fdf4ff', border: '#a855f7', icon: '🧠', titleColor: '#6b21a8' },
    scenario: { bg: '#f5f3ff', border: '#8b5cf6', icon: '🎭', titleColor: '#5b21b6' }
  };
  const s = styles[type] || styles.info;
  return (
    <div style={{
      background: s.bg,
      borderRight: `6px solid ${s.border}`,
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '2rem 0',
      direction: 'rtl'
    }}>
      {title && <div style={{ fontWeight: '800', color: s.titleColor, marginBottom: '0.5rem' }}>{s.icon} {title}</div>}
      <div style={{ color: '#334155', lineHeight: '1.8' }}>{children}</div>
    </div>
  );
};

export const ComparisonTable = ({ headers, rows, caption, color = '#1e293b' }) => (
  <div style={{ margin: '2.5rem 0', direction: 'rtl' }}>
    <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: color }}>
            {headers.map((h, i) => (
              <th key={i} style={{ color: 'white', padding: '14px', textAlign: 'right' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #f1f5f9' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '12px 14px', textAlign: 'right', lineHeight: '1.8' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {caption && <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: '0.8rem' }}>📊 {caption}</p>}
  </div>
);

export const SectionDivider = ({ icon = '───' }) => (
  <div style={{ textAlign: 'center', margin: '4rem 0', color: '#cbd5e1', fontSize: '1.5rem' }}>
    {icon}
  </div>
);

export const NumberedCard = ({ number, title, children, color = '#3b82f6' }) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    margin: '2rem 0',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    position: 'relative',
    direction: 'rtl'
  }}>
    <div style={{
      position: 'absolute',
      top: '-15px',
      right: '20px',
      background: color,
      color: 'white',
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '1.2rem'
    }}>{number}</div>
    <h3 style={{ marginTop: '0.5rem', color: '#1e293b' }}>{title}</h3>
    <div style={{ color: '#475569', lineHeight: '1.8' }}>{children}</div>
  </div>
);

export const MiniStat = ({ icon, value, label, color = '#3b82f6' }) => (
  <div style={{ textAlign: 'center', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', flex: '1', minWidth: '140px' }}>
    <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>{icon}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</div>
  </div>
);

export const StatRow = ({ children }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '2rem 0', direction: 'rtl' }}>
    {children}
  </div>
);
