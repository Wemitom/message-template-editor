import { ReactNode, createContext, useReducer, useState } from 'react';

import styles from './Editor.module.css';
import Inputs from './Inputs';
import {
  Action,
  CursorPosition,
  EditorProps,
  IfInput,
  Input,
  OtherInput,
  TemplateContextInterface
} from './types';
import { changeNode, generateUID, getNode } from '../../utils/functions';
import Modal from '../Modal';
import Preview from '../Preview';

const Variables = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.containerVar}>
      <h3 className={styles.title}>Variables</h3>
      <ul className={styles.variables}>{children}</ul>
    </div>
  );
};

/**
 * Редюсер, который обновляет состояние на основе заданного действия.
 *
 * @param {OtherInput} state - Текущее состояние.
 * @param {Action} action - Выполняемое действие.
 * @return {OtherInput} Обновленное состояние.
 */
const reducer = (state: OtherInput, action: Action) => {
  let firstPart = '',
    secondPart = '',
    otherElement: OtherInput,
    parent: OtherInput | null;
  const thenElement: OtherInput = {
    type: 'then',
    value: '',
    uid: generateUID()
  };
  const elseElement: OtherInput = {
    type: 'else',
    value: '',
    uid: generateUID()
  };
  const ifElement: IfInput = {
    type: 'if',
    value: '',
    uid: generateUID(),
    children: [thenElement, elseElement]
  };

  switch (action.type) {
    case 'CHANGE_VALUE':
      /**
       * Так как на вход подаем state, являющейся корнем дерева, то на выход получим корень
       */
      return changeNode(
        state,
        action.payload.uid,
        action.payload.value
      ) as OtherInput;
    case 'ADD_IF_THEN_ELSE':
      // Если узел типа 'if', возвращаем корень дерева, без изменения
      if (action.payload.input.type === 'if') return state;

      /**
       * Разбиваем строку по последнему положению курсора
       */
      [firstPart, secondPart] = action.payload.input.value.split('').reduce(
        ([first, second], letter, i) => {
          if (i < action.payload.position) first += letter;
          else second += letter;

          return [first, second];
        },
        ['', '']
      );

      if (action.payload.input.children) {
        otherElement = {
          type: action.payload.input.type,
          value: secondPart,
          uid: generateUID(),
          children: action.payload.input.children
        };
      } else {
        otherElement = {
          type: action.payload.input.type,
          value: secondPart,
          uid: generateUID()
        };
      }

      /**
       *  Возвращаем корень дерева, где для выбранного узла вставлены дочерние узлы if-then-else
       */
      return changeNode(
        changeNode(
          state,
          action.payload.input.uid,
          firstPart,
          [ifElement, otherElement],
          true
        ) as OtherInput,
        ifElement.uid,
        undefined,
        [thenElement, elseElement],
        true
      ) as OtherInput;
    case 'REMOVE_IF_THEN_ELSE':
      parent = getNode(state, {
        child: action.payload
      }) as OtherInput | null;
      if (!parent) return state;

      return changeNode(
        state,
        parent.uid,
        parent.value + parent.children?.[1].value,
        parent.children?.[1].children, // Ставим дочерними узлами узлы другой части
        true
      ) as OtherInput;
  }
};
const initTemplate: OtherInput = {
  type: 'normal',
  value: '',
  uid: generateUID()
};

export const TemplateContext = createContext<TemplateContextInterface>({
  template: initTemplate,
  addIfThenElse: () => {
    return;
  },
  removeIfThenElse: () => {
    return;
  },
  changeValue: () => {
    return;
  },
  setLastPosition: () => {
    return;
  }
});

/**
 * Рендерит компонент Editor, который представляет собой редактор шаблона сообщения.
 */
const Editor = ({ arrVarNames, template, callbackSave }: EditorProps) => {
  const [lastPosition, setLastPosition] = useState<CursorPosition>({
    input: template ?? initTemplate,
    position: 0
  });
  const [state, dispatch] = useReducer(reducer, template ?? initTemplate);
  const changeValue = (input: Input, uid: string, value: string) =>
    dispatch({ type: 'CHANGE_VALUE', payload: { input, uid, value } });
  const addIfThenElse = (input: Input, position: number) =>
    dispatch({
      type: 'ADD_IF_THEN_ELSE',
      payload: { input, position }
    });
  const removeIfThenElse = (input: Input) =>
    dispatch({ type: 'REMOVE_IF_THEN_ELSE', payload: input });

  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className={styles.container}>
      <h1 style={{ textAlign: 'center' }}>Message Template Editor</h1>

      <Variables>
        {arrVarNames.map((name) => (
          <li
            className={styles.variable}
            key={name}
            role="button"
            onClick={() => {
              const newValue = lastPosition.input.value.split('');
              newValue.splice(lastPosition.position, 0, `{${name}}`);

              /**
               * Вставляем переменную в инпут на основе последнего положения курсора
               */
              changeValue(
                lastPosition.input,
                lastPosition.input.uid,
                newValue.join('')
              );
            }}
            tabIndex={0}
          >{`{${name}}`}</li>
        ))}
      </Variables>

      <span style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className={styles.btnIfThenElse}
          onClick={() => {
            addIfThenElse(lastPosition.input, lastPosition.position);
            /**
             * Обновляем последнюю позицию курсора, т.к. строка могла быть изменена
             */
            setLastPosition({
              input: lastPosition.input,
              position: lastPosition.input.value.length
            });
          }}
        >
          if | then | else
        </button>
      </span>

      <TemplateContext.Provider
        value={{
          template: state,
          changeValue,
          addIfThenElse,
          removeIfThenElse,
          setLastPosition
        }}
      >
        <Inputs />
      </TemplateContext.Provider>

      <div className={styles.btns}>
        <button
          className={`${styles.previewBtn} btn`}
          onClick={() => setShowPreview(true)}
        >
          Preview
        </button>
        <button
          className={`${styles.saveBtn} btn`}
          onClick={() => callbackSave(state)}
        >
          Save
        </button>
      </div>

      {showPreview && (
        <Modal
          title="Message Template Preview"
          onClose={() => setShowPreview(false)}
        >
          <Preview arrVarNames={arrVarNames} template={state} />
        </Modal>
      )}
    </div>
  );
};

export default Editor;
