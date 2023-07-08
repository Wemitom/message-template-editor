import { ReactNode, useEffect, useRef } from 'react';

import styles from './Modal.module.css';
import useEscapeKey from '../../utils/hooks/useEscapeKey';
import useOutsideClickDetect from '../../utils/hooks/useOutsideClickDetect';

const Preview = ({
  title,
  onClose,
  children
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClickDetect(ref, onClose);
  useEscapeKey(onClose, true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className={styles.modal}>
      <div className={styles.modalContents} ref={ref}>
        <h2>{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Preview;
