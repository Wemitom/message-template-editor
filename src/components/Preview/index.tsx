import { ReactNode } from 'react';

import TextareaAutosize from 'react-textarea-autosize';

import styles from './Preview.module.css';

const Variables = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.containerVar}>
      <h3 className={styles.title}>Variables</h3>
      <ul className={styles.variables}>{children}</ul>
    </div>
  );
};

const Preview = () => {
  return (
    <div>
      <TextareaAutosize className={styles.textarea} readOnly />
    </div>
  );
};

export default Preview;
