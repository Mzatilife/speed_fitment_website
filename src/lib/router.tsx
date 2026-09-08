import { AnchorHTMLAttributes, createContext, useContext, useEffect, useState, ReactNode, MouseEvent } from 'react';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPush = () => setPath(window.location.pathname);
    window.addEventListener('pushstate', onPush);
    return () => window.removeEventListener('pushstate', onPush);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
  to: string;
  children: ReactNode;
  onClick?: () => void;
};

export function Link({ to, children, className, onClick, ...props }: LinkProps) {
  const { navigate } = useRouter();
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    navigate(to);
    onClick?.();
  };
  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
