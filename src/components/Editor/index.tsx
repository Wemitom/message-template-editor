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
    parent: OtherInput | null,
    newState: OtherInput;
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
      if (action.payload.lastPosition.input.type === 'if') return state;

      /**
       * Разбиваем строку по последнему положению курсора
       */
      [firstPart, secondPart] = action.payload.lastPosition.input.value
        .split('')
        .reduce(
          ([first, second], letter, i) => {
            if (i < action.payload.lastPosition.position) first += letter;
            else second += letter;

            return [first, second];
          },
          ['', '']
        );

      if (action.payload.lastPosition.input.children) {
        otherElement = {
          type: action.payload.lastPosition.input.type,
          value: secondPart,
          uid: generateUID(),
          children: action.payload.lastPosition.input.children
        };
      } else {
        otherElement = {
          type: action.payload.lastPosition.input.type,
          value: secondPart,
          uid: generateUID()
        };
      }

      /**
       *  Возвращаем корень дерева, где для выбранного узла вставлены дочерние узлы if-then-else
       */
      newState = changeNode(
        changeNode(
          state,
          action.payload.lastPosition.input.uid,
          firstPart,
          [ifElement, otherElement],
          true
        ) as OtherInput,
        ifElement.uid,
        undefined,
        [thenElement, elseElement],
        true
      ) as OtherInput;
      action.payload.callback(newState);

      return newState;
    case 'REMOVE_IF_THEN_ELSE':
      parent = getNode(state, {
        child: action.payload.input
      }) as OtherInput | null;
      if (!parent) return state;

      newState = changeNode(
        state,
        parent.uid,
        parent.value + parent.children?.[1].value,
        parent.children?.[1].children, // Ставим дочерними узлами узлы другой части
        true
      ) as OtherInput;

      action.payload.callback(newState);

      return newState;
  }
};
const initTemplate: OtherInput = {
  type: 'normal',
  value: '',
  uid: generateUID()
};

export const TemplateContext = createContext<TemplateContextInterface>({
  template: initTemplate,
  lastPosition: {
    input: initTemplate,
    position: 0
  },
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
  const addIfThenElse = (
    input: Input,
    position: number,
    callback: (newState: OtherInput) => void
  ) =>
    dispatch({
      type: 'ADD_IF_THEN_ELSE',
      payload: { lastPosition: { input, position }, callback }
    });
  const removeIfThenElse = async (
    input: Input,
    callback: (newState: OtherInput) => void
  ) => dispatch({ type: 'REMOVE_IF_THEN_ELSE', payload: { input, callback } });

  const [showPreview, setShowPreview] = useState(false);

  const [savingStatus, setSavingStatus] = useState<
    'none' | 'saving' | 'success'
  >('none');

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

              lastPosition.input.value = newValue.join('');
              /**
               * Вставляем переменную в инпут на основе последнего положения курсора
               */
              changeValue(
                lastPosition.input,
                lastPosition.input.uid,
                newValue.join('')
              );

              /**
               * Обновляем последнюю позицию курсора
               */
              setLastPosition({
                input: lastPosition.input,
                position: lastPosition.position + name.length + 2 // Скобки +2
              });
            }}
            tabIndex={0}
          >{`{${name}}`}</li>
        ))}
      </Variables>

      <span style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className={styles.btnIfThenElse}
          disabled={lastPosition.input.type === 'if'}
          onClick={() => {
            addIfThenElse(
              lastPosition.input,
              lastPosition.position,
              (newState) => {
                setLastPosition({
                  input:
                    getNode(newState, { uid: lastPosition.input.uid }) ??
                    newState,
                  position: lastPosition.position
                });
              }
            );
            /**
             * Обновляем последнюю позицию курсора, т.к. строка могла быть изменена
             */
          }}
        >
          if | then | else
        </button>
      </span>

      <TemplateContext.Provider
        value={{
          template: state,
          lastPosition,
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
          disabled={savingStatus === 'saving'}
          onClick={async () => {
            setSavingStatus('saving');
            await callbackSave(state);
            setSavingStatus('success');

            setTimeout(() => {
              setSavingStatus('none');
            }, 1000);
          }}
        >
          {savingStatus === 'saving' ? (
            <div className={styles.spinnerContainer}>
              <span className={styles.spinner} />
              Saving...
            </div>
          ) : savingStatus === 'none' ? (
            'Save'
          ) : (
            'Saved!'
          )}
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
