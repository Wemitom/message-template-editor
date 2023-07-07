import { ReactNode, createContext, useReducer, useState } from 'react';

import styles from './Editor.module.css';
import Inputs from './Inputs';
import { Action, IProps, Template, TemplateContextInterface } from './types';

const Variables = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.containerVar}>
      <h3 className={styles.title}>Variables</h3>
      <ul className={styles.variables}>{children}</ul>
    </div>
  );
};

const reducer = (state: Template, action: Action) => {
  switch (action.type) {
    case 'CHANGE_VALUE':
      return state.map((input, i) => {
        if (i === action.payload.id) {
          return {
            ...input,
            value: action.payload.value
          };
        }

        return input;
      });
    case 'ADD_IF_THEN_ELSE':
      return state
        .map((input, i) => {
          if (i === action.payload) {
            return {
              ...input,
              child: state.length
            };
          }

          return input;
        })
        .concat([
          {
            type: 'if',
            value: '',
            chilren: [state.length + 1, state.length + 2]
          },
          {
            type: 'then',
            value: ''
          },
          {
            type: 'else',
            value: ''
          }
        ]);
    case 'REMOVE_IF_THEN_ELSE':
      return state;
  }
};
const initTemplate: Template = [{ type: 'normal', value: '' }];

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
  const [lastPosition, setLastPosition] = useState(0);
  const [state, dispatch] = useReducer(reducer, template ?? initTemplate);
  const changeValue = (id: number, value: string) =>
    dispatch({ type: 'CHANGE_VALUE', payload: { id, value } });
  const addIfThenElse = (id: number) =>
    dispatch({ type: 'ADD_IF_THEN_ELSE', payload: id });
  const removeIfThenElse = (id: number) =>
    dispatch({ type: 'REMOVE_IF_THEN_ELSE', payload: id });

  return (
    <div className={styles.container}>
      <h1 style={{ textAlign: 'center' }}>Message Template Editor</h1>

      <Variables>
        {arrVarNames.map((name) => (
          <li
            className={styles.variable}
            key={name}
            role="button"
            onClick={() =>
              changeValue(
                lastPosition,
                `${
                  state[lastPosition].value && state[lastPosition].value + ' '
                }{${name}}`
              )
            }
            tabIndex={0}
          >{`{${name}}`}</li>
        ))}
      </Variables>

      <button
        className={styles.btnIfThenElse}
        onClick={() => addIfThenElse(lastPosition)}
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
