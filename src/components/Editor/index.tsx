import { ReactNode, createContext, useReducer, useState } from 'react';

import styles from './Editor.module.css';
import Inputs from './Inputs';
import {
  Action,
  CursorPosition,
  IProps,
  IfInput,
  Input,
  OtherInput,
  TemplateContextInterface
} from './types';
import { changeNode, generateUID } from '../../utils/functions';

const Variables = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.containerVar}>
      <h3 className={styles.title}>Variables</h3>
      <ul className={styles.variables}>{children}</ul>
    </div>
  );
};

const reducer = (state: OtherInput, action: Action) => {
  let firstPart = '',
    secondPart = '',
    otherElement: OtherInput;
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
      // Так как на вход подаем state, являющейся корнем дерева, то на выход получим корень
      return changeNode(
        state,
        action.payload.uid,
        action.payload.value
      ) as OtherInput;
    case 'ADD_IF_THEN_ELSE':
      if (action.payload.input.type === 'if') return state;

      [firstPart, secondPart] = action.payload.input.value.split('').reduce(
        ([first, second], letter, i) => {
          if (i < action.payload.position) first += letter;
          else second += letter;

          return [first, second];
        },
        ['', '']
      );

      otherElement = {
        type: action.payload.input.type,
        value: secondPart,
        uid: generateUID()
      };

      return changeNode(
        changeNode(state, action.payload.input.uid, firstPart, [
          ifElement,
          otherElement
        ]) as OtherInput,
        ifElement.uid,
        undefined,
        [thenElement, elseElement]
      ) as OtherInput;
    case 'REMOVE_IF_THEN_ELSE':
      return state;
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

const Editor = ({ arrVarNames, template, callbackSave }: IProps) => {
  const [lastPosition, setLastPosition] = useState<CursorPosition>({
    input: template ?? initTemplate,
    position: 0
  });
  const [state, dispatch] = useReducer(
    reducer,
    (template as OtherInput) ?? initTemplate
  );
  const changeValue = (input: Input, uid: string, value: string) =>
    dispatch({ type: 'CHANGE_VALUE', payload: { input, uid, value } });
  const addIfThenElse = (input: Input, position: number) =>
    dispatch({
      type: 'ADD_IF_THEN_ELSE',
      payload: { input, position }
    });
  const removeIfThenElse = (input: Input) =>
    dispatch({ type: 'REMOVE_IF_THEN_ELSE', payload: input });

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
              newValue.splice(
                lastPosition.position,
                0,
                `${lastPosition.position !== 0 ? ' ' : ''}{${name}}${
                  lastPosition.position !== lastPosition.input.value.length
                    ? ' '
                    : ''
                }`
              );

              // Вставляем переменную в инпут на основе последнего положения курсора
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

      <button
        className={styles.btnIfThenElse}
        onClick={() => addIfThenElse(lastPosition.input, lastPosition.position)}
      >
        if | then | else
      </button>

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
    </div>
  );
};

export default Editor;
