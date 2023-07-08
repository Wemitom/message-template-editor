type InputTypes = 'normal' | 'if' | 'then' | 'else';

interface InputBase {
  /**
   * Тип поля
   */
  type: InputTypes;
  /**
   * Значение поля
   */
  value: string;
  /**
   * ID поля
   */
  uid: string;
}

/**
 * If поле для ввода. Наследуется от InputBase с надобностью задания дочерних полей
 */
interface IfInput extends InputBase {
  type: 'if';
  /**
   *  Дочерние поля - then и else
   */
  children: [OtherInput, OtherInput];
}

interface OtherInput extends InputBase {
  type: 'normal' | 'then' | 'else';
  /**
   * Необязательный. Дочерние поля - if и другая часть
   */
  children?: [IfInput, OtherInput];
}

type Input = IfInput | OtherInput;

interface ActionChange {
  type: 'CHANGE_VALUE';
  payload: {
    input: Input;
    uid: string;
    value: string;
  };
}
interface ActionAddIfThenElse {
  type: 'ADD_IF_THEN_ELSE';
  payload: CursorPosition;
}
interface ActionRemoveIfThenElse {
  type: 'REMOVE_IF_THEN_ELSE';
  payload: Input;
}
type Action = ActionChange | ActionAddIfThenElse | ActionRemoveIfThenElse;

interface IProps {
  /**
   * Массив переменных
   */
  arrVarNames: string[];
  /**
   * Шаблон
   */
  template?: Input;
  /**
   * Обработчик сохранения шаблона
   */
  callbackSave: (template: Input) => Promise<void>;
}

interface TemplateContextInterface {
  template: Input;
  changeValue: (input: Input, uid: string, value: string) => void;
  addIfThenElse: (input: Input, position: number) => void;
  removeIfThenElse: (input: Input) => void;
  setLastPosition: ({ input, position }: CursorPosition) => void;
}

interface CursorPosition {
  input: Input;
  position: number;
}

export type {
  Input,
  OtherInput,
  IfInput,
  IProps,
  Action,
  TemplateContextInterface,
  CursorPosition
};
