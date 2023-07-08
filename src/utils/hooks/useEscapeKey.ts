import { useEffect } from 'react';

const useEscapeKey = (callback: () => void, state: boolean) => {
  useEffect(() => {
    const close = ({ key }: KeyboardEvent) => key === 'Escape' && callback();

    if (state) document.addEventListener('keydown', close);
    else document.removeEventListener('keydown', close);

    return () => {
      document.removeEventListener('keydown', close);
    };
  }, [callback, state]);
};

export default useEscapeKey;
