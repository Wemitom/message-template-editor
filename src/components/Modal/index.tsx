import { ReactNode, useEffect, useRef, useState } from 'react';

import styles from './Modal.module.css';
import useEscapeKey from '../../utils/hooks/useEscapeKey';
import useOutsideClickDetect from '../../utils/hooks/useOutsideClickDetect';

/**
 * Создает модал с заголовком, функцией закрытия и содержимым.
 */
const Modal = ({
  title,
  onClose,
  children
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  const [leave, setLeave] = useState(false);
  const handleClose = () => {
    setLeave(true);
    /**
     * Ждем анимацию закрытия модала
     */
    setTimeout(() => onClose(), 300);
  };
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClickDetect(ref, handleClose); // Для обработки клика снаружи div
  useEscapeKey(handleClose, true); // Для обработки Esc

  /**
   * Вызывается при открытии модала, убирает скроллбар для всего документа
   */
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className={styles.modal} aria-modal>
      <div
        className={`${styles.modalContents} ${
          leave ? styles.leave : styles.enter
        }`}
        ref={ref}
      >
        <h2>{title}</h2>
        <div>{children}</div>

        <span className="center">
          <button className={`btn ${styles.closeBtn}`} onClick={handleClose}>
            Close
          </button>
        </span>
      </div>
    </div>
  );
};

export default Modal;
