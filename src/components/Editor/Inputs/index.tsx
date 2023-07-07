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
   * @param {number} i - Индекс поля.
   * @param {Input} input - Объект поля.
   * @param {boolean} ifThenElse - Необязательный. Указывает, нужно ли рендерить компонент if-then-else.
   * @return {JSX.Element} Компонент, представляющий поле для ввода.
   */
  const getInputs = (i: number, input: Input, ifThenElse?: boolean) => {
    const component = (
      <>
        {input.type !== 'normal' && <span>{input.type}</span>}
        <TextareaAutosize
          className={styles.textarea}
          value={input.value}
          onChange={(e) => changeValue(i, e.target.value)}
          onClick={(e) =>
            setLastPosition({ id: i, position: e.currentTarget.selectionStart })
          }
          onKeyUp={(e) =>
            setLastPosition({ id: i, position: e.currentTarget.selectionStart })
          }
        />
        {ifThenElse &&
          input.type !== 'if' &&
          input.child &&
          /* Если у этого инпута есть дочерние инпуты, то рекурсивно рендерим их */
          renderIfThenElse(input.child)}
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
   * @param {number} i - Индекс if инпута.
   * @return {JSX.Element} Зарендеренный компонент.
   */
  const renderIfThenElse = (i: number): JSX.Element => {
    const ifInput = template[i];
    // Если этот инпут является if-инпутом, то рендерит его.
    if (ifInput.type === 'if') {
      return (
        <div className={styles.ifThenElse} style={{ marginLeft: '10rem' }}>
          {getInputs(i, ifInput)}
          {ifInput.chilren.map((id) => {
            const element = template[id];

            return element.type === 'then' || element.type === 'else' ? (
              <div key={`if_${i}_${element.type}`}>
                {getInputs(id, element, true)}
              </div>
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
  return <div className={styles.inputs}>{getInputs(0, template[0], true)}</div>;
};

export default Inputs;
