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

/**
 * Поле для ввода. Первое поле в дереве имеет тип normal и является корнем.
 */
interface OtherInput extends InputBase {
  type: 'normal' | 'then' | 'else';
  /**
   * Необязательный. Дочерние поля - if и другая часть
   */
  children?: [IfInput, OtherInput];
}

/**
 * Узлы дерева
 */
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
  payload: {
    lastPosition: CursorPosition;
    callback: (newState: OtherInput) => void;
  };
}
interface ActionRemoveIfThenElse {
  type: 'REMOVE_IF_THEN_ELSE';
  payload: { input: Input; callback: (newState: OtherInput) => void };
}
type Action = ActionChange | ActionAddIfThenElse | ActionRemoveIfThenElse;

/**
 * Пропсы виджета редактора шаблона
 */
interface EditorProps {
  /**
   * Массив имен переменных
   */
  arrVarNames: string[];
  /**
   * Шаблон сообщения
   */
  template?: OtherInput;
  /**
   * Обработчик сохранения шаблона
   */
  callbackSave: (template: OtherInput) => Promise<void>;
  /**
   * Обработчик закрытия виджета
   */
}

interface TemplateContextInterface {
  template: Input;
  lastPosition: CursorPosition;
  changeValue: (input: Input, uid: string, value: string) => void;
  addIfThenElse: (
    input: Input,
    position: number,
    callback: (newState: OtherInput) => void
  ) => void;
  removeIfThenElse: (
    input: Input,
    callback: (newState: OtherInput) => void
  ) => void;
  setLastPosition: ({ input, position }: CursorPosition) => void;
}

interface CursorPosition {
  input: Input;
  position: number;
}

export type {
  Input,
  InputTypes,
  OtherInput,
  IfInput,
  EditorProps,
  Action,
  TemplateContextInterface,
  CursorPosition
};
