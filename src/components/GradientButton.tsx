import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'danger' | 'ghost';
}

export function GradientButton({ loading, variant = 'primary', children, style, ...rest }: Props) {
  const bg: Record<string, string> = {
    primary: 'linear-gradient(135deg, #D4A5A5, #C4855A)',
    danger: '#C0392B',
    ghost: 'transparent',
  };
  const color = variant === 'ghost' ? 'var(--dark1)' : '#fff';
  const border = variant === 'ghost' ? '1.5px solid var(--dark2)' : 'none';

  return (
    <button
      disabled={loading || rest.disabled}
      style={{
        background: bg[variant], color, border,
        padding: '12px 24px', borderRadius: 10,
        fontWeight: 600, fontSize: 15,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'opacity .2s',
        ...style,
      }}
      {...rest}
    >
      {loading ? 'Aguarde...' : children}
    </button>
  );
}
