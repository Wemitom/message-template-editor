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
interface ActionNormal {
  type: 'ADD_IF_THEN_ELSE' | 'REMOVE_IF_THEN_ELSE';
  payload: number;
}
type Action = ActionChange | ActionNormal;

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
  addIfThenElse: (id: number) => void;
  removeIfThenElse: (id: number) => void;
  setLastPosition: (id: number) => void;
}

export type { NormalInput, IProps, Template, Action, TemplateContextInterface };
