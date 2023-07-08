import { MutableRefObject, useEffect } from 'react';

function isNode(event: EventTarget | null): asserts event is Node {
  if (!event || !('nodeType' in event)) {
    throw new Error('Node expected');
  }
}

// Хук для выполнения функции по клику снаружи div. На вход - ref на div; Функция, выполняемая по клику.
const useOutsideClickDetect = (
  ref: MutableRefObject<HTMLDivElement | HTMLUListElement | null>,
  func: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      isNode(event.target);
      if (ref.current && !ref.current.contains(event.target)) {
        func();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, func]);
};

export default useOutsideClickDetect;
