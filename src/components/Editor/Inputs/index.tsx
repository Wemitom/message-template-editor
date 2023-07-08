import TextareaAutosize from 'react-textarea-autosize';

import styles from './Inputs.module.css';
import useTemplate from '../../../utils/hooks/useTemplate';
import { Input } from '../types';

/**
 * Инпуты для редактора сообщений. Для правильной работы этого компонента необходимо зарендерить его в
 * контексте TemplateContext.
 */
const Inputs = () => {
  const { template, changeValue, setLastPosition } = useTemplate();

  /**
   * Возвращает компонент, представляющий поле для ввода на основе его типа.
   *
   * @param {Input} input - Инпут, который нужно рендерить.
   * @return {JSX.Element} Компонент, представляющий поле для ввода.
   */
  const getInputs = (input: Input) => {
    const component: JSX.Element = (
      <>
        {input.type !== 'normal' && (
          <span>
            <span>{input.type}</span>{' '}
            <button className={styles.deleteBtn}>Delete</button>
          </span>
        )}
        <TextareaAutosize
          className={styles.textarea}
          value={input.value}
          onChange={(e) => changeValue(input, input.uid, e.target.value)}
          onClick={(e) =>
            setLastPosition({
              input: input,
              position: e.currentTarget.selectionStart
            })
          }
          onKeyUp={(e) =>
            setLastPosition({
              input: input,
              position: e.currentTarget.selectionStart
            })
          }
        />
        {input.type !== 'if' && input.children && (
          /* Если у этого инпута есть дочерние инпуты, то рекурсивно рендерим их */
          <>
            {renderIfThenElse(input.children[0])}
            {getInputs(input.children[1])}
          </>
        )}
      </>
    );

    return input.type !== 'normal' ? (
      <div className={styles.conditional}>{component}</div>
    ) : (
      component
    );
  };

  /**
   * Рекурсивно рендерит компонент if-then-else.
   *
   * @param {number} input - Инпут, который нужно рендерить.
   * @return {JSX.Element} Зарендеренный компонент.
   */
  const renderIfThenElse = (input: Input): JSX.Element => {
    // Если этот инпут является if-инпутом, то рендерит его.
    if (input.type === 'if') {
      return (
        <div className={styles.ifThenElse}>
          {getInputs(input)}
          {input.children.map((inp, i) => {
            return inp.type === 'then' || inp.type === 'else' ? (
              <div key={`if_${i}_${inp.type}`}>{getInputs(inp)}</div>
            ) : (
              <></>
            );
          })}
        </div>
      );
    } else {
      // Иначе, рендерим заглушку
      return <></>;
    }
  };

  // Возвращаем компонент, представляющий начальное поле для ввода.
  return <div className={styles.inputs}>{getInputs(template)}</div>;
};

export default Inputs;
