import { CSSProperties, ReactNode } from 'react';

export function Card({ children, className = '', hover = false, style }: { children: ReactNode; className?: string; hover?: boolean; style?: CSSProperties }) {
  return (
    <div style={style} className={`bg-white rounded-2xl border border-gray-200/70 ${hover ? 'card-glow transition-all duration-500 ease-out hover:shadow-card hover:border-gray-300/80 hover:-translate-y-1.5' : 'shadow-soft'} ${className}`}>
      {children}
    </div>
  );
}
