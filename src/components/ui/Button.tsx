import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-gray-900 hover:bg-brand-400 shadow-soft shadow-brand-500/30 hover:shadow-glow-brand hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  secondary: 'bg-gray-900 text-white hover:bg-gray-800 shadow-soft hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 bg-white hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  ghost: 'text-gray-600 hover:bg-gray-100 active:scale-[0.98]',
  danger: 'bg-red-600 text-white hover:bg-red-500 shadow-soft shadow-red-600/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-soft shadow-emerald-600/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[13px] rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-[15px] rounded-xl gap-2',
};

export function Button({ variant = 'primary', size = 'md', children, loading, fullWidth, iconOnly, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none ${variants[variant]} ${sizes[size]} ${iconOnly ? (size === 'sm' ? 'h-8 w-8 !p-0' : size === 'lg' ? 'h-12 w-12 !p-0' : 'h-10 w-10 !p-0') : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
