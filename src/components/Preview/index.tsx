import { ReactNode, useState } from 'react';

import TextareaAutosize from 'react-textarea-autosize';

import styles from './Preview.module.css';
import { PreviewProps } from './types';
import { Input } from '../Editor/types';

const Variables = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.containerVar}>
      <h3 className={styles.title}>Variables</h3>
      <ul className={styles.variables}>{children}</ul>
    </div>
  );
};

/**
 * Рендерит компонент предпросмотра на основе предоставленного массива имен переменных и шаблона.
 */

const Preview = ({ arrVarNames, template }: PreviewProps) => {
  const [values, setValues] = useState<
    Record<typeof arrVarNames[number], string>
  >(arrVarNames.reduce((acc, name) => ({ ...acc, [name]: '' }), {}));

  /**
   * Заменяет переменные в строке на их соответствующие значения.
   *
   * @param {string} string - Строка, в которой нужно выполнить замену переменных.
   * @param {Record<string, string>} values - Объект, содержащий пары ключ-значение переменных и их значений.
   * @return {string} - Строка с замененными переменными на соответствующие значения.
   */
  const replaceVars = (
    string: string,
    values: Record<string, string>
  ): string =>
    string
      .split(/({[^{}]+})/) // Получаем все значение в скобках
      .filter(Boolean)
      .map((str) => {
        const value = str.slice(1, -1);
        /**
         * Если переменная существует
         */
        if (arrVarNames.includes(value)) {
          return values[value] ?? ''; // Заменяем на значение
        } else {
          return str; // В противном случае, возвращаем строку
        }
      })
      .join('');

  /**
   * Возвращает строку, сгенерированную из шаблона на основе предоставленных значений.
   *
   * @param {Input} template - Объект шаблона.
   * @param {Record<string, string>} values - Значения для подстановки в шаблон.
   * @return {string} Сгенерированная строка.
   */
  const getStringFromTemplate = (
    template: Input,
    values: Record<string, string>
  ): string => {
    if (template.type === 'if') {
      /**
       * Regex на проверку того, что строка будет содержать только переменные
       */
      const onlyVarsRegex = /^{[a-zA-Z0-9]+}(?:{[a-zA-Z0-9]+})*$/;

      return onlyVarsRegex.test(template.value) && // Если строка содержит только переменные
        template.value
          .match(/{([a-zA-Z0-9]+)}/g) // Получаем все переменные
          ?.map((match) => match.slice(1, -1)) // Убираем скобки
          .every((name) => arrVarNames.includes(name)) && // Проверяем, что все переменные существуют
        replaceVars(template.value, values) // Заменяем переменные на соответствующие значения
        ? getStringFromTemplate(template.children[0], values) // Если для переменной есть строка, возвращаем строку then
        : getStringFromTemplate(template.children[1], values); // В обратном случае, возвращаем строку else
    } else {
      return (
        // Если инпут не условный, заменяем переменные на соответствующие значения и складываем с другими строками
        replaceVars(template.value, values) +
        (template.children
          ? getStringFromTemplate(template.children[0], values) + // Если есть дочерние узлы, рекурсивно получаем строку для инпута if
            getStringFromTemplate(template.children[1], values) // и для второй части
          : '')
      );
    }
  };

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
