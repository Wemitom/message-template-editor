import { ReactNode, useState } from 'react';

import TextareaAutosize from 'react-textarea-autosize';

import styles from './Preview.module.css';
import { PreviewProps } from './types';
import { getStringFromTemplate } from '../../utils/functions';

const Variables = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.containerVar}>
      <h3 className={styles.title}>Variables</h3>
      <ul className={styles.variables}>{children}</ul>
    </div>
  );
};

const Preview = ({ arrVarNames, template }: PreviewProps) => {
  const [values, setValues] = useState<
    Record<typeof arrVarNames[number], string>
  >({});

  return (
    <div>
      <TextareaAutosize
        className={styles.textarea}
        value={getStringFromTemplate(template, values)}
        readOnly
      />

      <Variables>
        {arrVarNames.map((name, index) => (
          <li key={index} className={styles.variable}>
            <span style={{ position: 'relative' }}>
              <input
                id={name}
                className={`${styles.input} ${
                  values[name] ? styles.hasValue : ''
                }`}
                value={values[name]}
                onChange={(e) =>
                  setValues({ ...values, [name]: e.target.value })
                }
              />
              <label htmlFor={name} className={styles.label}>
                {name}
              </label>
            </span>
          </li>
        ))}
      </Variables>
    </div>
  );
};

export default Preview;
