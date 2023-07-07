import { ReactNode, useReducer } from 'react';

import styles from './Editor.module.css';
import { Action, IProps, Template } from './types';

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

const Editor = ({ arrVarNames, template, callbackSave }: IProps) => {
  const [state, dispatch] = useReducer(reducer, template ?? initTemplate);

  return (
    <div className={styles.container}>
      <h1 style={{ textAlign: 'center' }}>Message Template Editor</h1>

      <Variables>
        {arrVarNames.map((name) => (
          <li
            className={styles.variable}
            key={name}
            role="button"
            tabIndex={0}
          >{`{${name}}`}</li>
        ))}
      </Variables>

      <button className={styles.btnIfThenElse}>if | then | else</button>
    </div>
  );
};

export default Editor;
