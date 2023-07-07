interface CommonInput {
  /**
   * Значение поля
   */
  value: string;
  /**
   * Поле If относящееся к данному инпуту
   */
  child?: number;
}

interface NormalInput extends CommonInput {
  type: 'normal';
}

interface IfInput extends Omit<CommonInput, 'child'> {
  type: 'if';
  chilren: [number, number];
}

interface ThenInput extends CommonInput {
  type: 'then';
}

interface ElseInput extends CommonInput {
  type: 'else';
}

type Input = NormalInput | IfInput | ElseInput | ThenInput;

type Template = Input[];

interface ActionChange {
  type: 'CHANGE_VALUE';
  payload: {
    id: number;
    value: string;
  };
}
interface ActionAddIfThenElse {
  type: 'ADD_IF_THEN_ELSE';
  payload: CursorPosition;
}
interface ActionRemoveIfThenElse {
  type: 'REMOVE_IF_THEN_ELSE';
  payload: number;
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
  template?: Template;
  /**
   * Обработчик сохранения шаблона
   */
  callbackSave: (template: Template) => Promise<void>;
}

interface TemplateContextInterface {
  template: Template;
  changeValue: (id: number, value: string) => void;
  addIfThenElse: (id: number, position: number) => void;
  removeIfThenElse: (id: number) => void;
  setLastPosition: ({ id, position }: CursorPosition) => void;
}

interface CursorPosition {
  id: number;
  position: number;
}

export type {
  Input,
  IProps,
  Template,
  Action,
  TemplateContextInterface,
  CursorPosition
};
