import { OtherInput } from '../Editor/types';

/**
 * Пропсы виджета редактора шаблона
 */
interface PreviewProps {
  /**
   * Имена переменных
   */
  arrVarNames: string[];
  /**
   * Шаблон
   */
  template: OtherInput;
}

export type { PreviewProps };
