import { useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(loader: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  useEffect(() => {
    let active = true;
    loader()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ data: null, loading: false, error: 'Não foi possível carregar. Tente novamente.' });
      });
    return () => {
      active = false;
    };
    // O carregador é estável nas telas que usam este hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}
