import TextareaAutosize from 'react-textarea-autosize';

import styles from './Inputs.module.css';
import { getNode } from '../../../utils/functions';
import useTemplate from '../../../utils/hooks/useTemplate';
import { Input } from '../types';

/**
 * Инпуты для редактора сообщений. Для правильной работы этого компонента необходимо зарендерить его в
 * контексте TemplateContext.
 */
const Inputs = () => {
  const {
    template,
    changeValue,
    removeIfThenElse,
    lastPosition,
    setLastPosition
  } = useTemplate();
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
            <span>{input.type}</span>
            {input.type === 'if' && (
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  removeIfThenElse(input, (newState) => {
                    /**
                     * Проверяем на условия, которые могут повлияет на положение курсора
                     */
                    const isChildOfDeletedIf = !!getNode(input, {
                      // Если узел является дочерним узлом удаляемого условия
                      child: lastPosition.input
                    });
                    const isMerged = !!getNode(
                      // Если узел сольется с родительским узлом
                      getNode(template, { child: input }),
                      {
                        child: lastPosition.input
                      }
                    );
                    const isMergedParent = // Если узел является родительским узлом
                      getNode(template, { child: input })?.uid ===
                      lastPosition.input.uid;

                    if (isChildOfDeletedIf)
                      setLastPosition({
                        input: newState, // Ставим в начало
                        position: 0
                      });
                    else if (isMerged)
                      setLastPosition({
                        input:
                          getNode(newState, {
                            // Устнавливаем в родительский узел
                            uid:
                              getNode(template, { child: input })?.uid ??
                              template.uid
                          }) ?? newState,
                        position: 0
                      });
                    else if (isMergedParent)
                      setLastPosition({
                        input:
                          getNode(newState, {
                            // Меняем на актуальный узел
                            uid: lastPosition.input.uid
                          }) ?? newState,
                        position: 0
                      });
                  });
                }}
              >
                Delete
              </button>
            )}
          </span>
        )}
        <TextareaAutosize
          className={styles.textarea}
          style={
            input.uid === lastPosition.input.uid
              ? { boxShadow: '0 0 0 2px goldenrod, 0 0 8px goldenrod' }
              : {}
          }
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
    /**
     *  Если этот инпут является if-инпутом, то рендерит его.
     */
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
      /**
       *  Иначе, рендерим заглушку
       */
      return <></>;
    }
  };

  /**
   * Начинаем рендер с корня дерева
   */
  return <div className={styles.inputs}>{getInputs(template)}</div>;
};

export default Inputs;
