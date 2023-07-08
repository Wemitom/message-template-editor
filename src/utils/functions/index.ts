import { IfInput, Input, OtherInput } from '../../components/Editor/types';

/**
 * Генерирует уникальный идентификатор, объединяя временную метку и случайное число.
 *
 * @return {string} Сгенерированный уникальный идентификатор.
 */
const generateUID = () => {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);
  return `${timestamp}-${randomNum}`;
};

/**
 * Обновляет узел в дереве с заданным UID.
 *
 * @param {Input | null} root - Корневой узел дерева.
 * @param {string} uid - UID узла для обновления.
 * @param {string} [value] - Новое значение для присвоения узлу.
 * @param {[IfInput, OtherInput] | [OtherInput, OtherInput]} [children] - Новые узлы для присвоения узлу.
 * @param {boolean} [changeChildren] - Изменить ли дочерние узлы.
 * @return {Input | null} - Обновленный узел или null, если root равен null.
 */
const changeNode = (
  root: Input | null,
  uid: string,
  value?: string,
  children?: [IfInput, OtherInput] | [OtherInput, OtherInput],
  changeChildren?: boolean
) => {
  if (root === null) return null;

  // Если id узла равен uid, то нашли нужный узел, изменяем значение
  if (root.uid === uid) {
    return {
      ...root,
      value: value !== undefined ? value : root.value,
      children: changeChildren ? children : root.children
    };
  }

  // Иначе ищем дальше
  if (root.type === 'if') {
    const firstUpdatedChild = changeNode(
      root.children[0],
      uid,
      value,
      children,
      changeChildren
    ) as OtherInput;
    const secondUpdatedChild = changeNode(
      root.children[1],
      uid,
      value,
      children,
      changeChildren
    ) as OtherInput;

    return { ...root, children: [firstUpdatedChild, secondUpdatedChild] };
  } else if (root.children) {
    const firstUpdatedChild = changeNode(
      root.children[0],
      uid,
      value,
      children,
      changeChildren
    ) as IfInput;
    const secondUpdatedChild = changeNode(
      root.children[1],
      uid,
      value,
      children,
      changeChildren
    ) as OtherInput;
    return { ...root, children: [firstUpdatedChild, secondUpdatedChild] };
  }

  return root;
};

/**
 * Получает узел из дерева на основе определенных критериев.
 *
 * @param {Input | null} root - Корневой узел структуры дерева.
 * @param {{uid?: string; children?: [IfInput, OtherInput] | [OtherInput, OtherInput]; value?: string; child?: Input;}} options - Опции, используемые для фильтрации узлов.
 * @return {Input | null} Соответствующий узел или null, если совпадение не найдено.
 */
const getNode = (
  root: Input | null,
  {
    uid,
    children,
    value,
    child
  }: {
    uid?: string;
    children?: [IfInput, OtherInput] | [OtherInput, OtherInput];
    value?: string;
    child?: Input;
  }
): Input | null => {
  if (root === null) return null;

  const isMatchingNode =
    (!uid || root.uid === uid) &&
    (!children ||
      (root.children &&
        root.children[0].uid === children[0].uid &&
        root.children[1].uid === children[1].uid)) &&
    (value === undefined || root.value === value) &&
    (child === undefined ||
      (root.children &&
        (root.children[0].uid === child.uid ||
          root.children[1].uid === child.uid)));

  if (isMatchingNode) {
    return root;
  }

  if (root.type === 'if') {
    const firstChild = getNode(root.children[0], {
      uid,
      children,
      value,
      child
    });
    const secondChild = getNode(root.children[1], {
      uid,
      children,
      value,
      child
    });

    return firstChild || secondChild || null;
  } else if (root.children) {
    const firstChild = getNode(root.children[0], {
      uid,
      children,
      value,
      child
    });
    const secondChild = getNode(root.children[1], {
      uid,
      children,
      value,
      child
    });

    return firstChild || secondChild || null;
  }

  return null;
};

// const mergeNodeValues = (root: Input, parent: OtherInput) => {

// }

/**
 * Заменяет переменные в строке на их соответствующие значения.
 *
 * @param {string} string - Строка, в которой нужно выполнить замену переменных.
 * @param {Record<string, string>} values - Объект, содержащий пары ключ-значение переменных и их значений.
 * @return {string} - Строка с замененными переменными на соответствующие значения.
 */
const replaceVars = (
  string: string,
  values: Record<string, string>
): string => {
  Object.keys(values).forEach((key) => {
    string = string.replace(`{${key}}`, values[key] ? values[key] : `{${key}}`);
  });
  return string;
};

/**
 * Возвращает строку, сгенерированную из шаблона на основе предоставленных значений.
 *
 * @param {Input} template - Объект шаблона.
 * @param {Record<string, string>} values - Значения для подстановки в шаблон.
 * @return {string} Сгенерированная строка.
 */
const getStringFromTemplate = (
  template: Input,
  values: Record<string, string>
): string => {
  if (template.type === 'if') {
    const value = template.value;
    // Значение должно начинаться с '{' и заканчиваться '}', только затем проверяем на наличие в массиве values
    return value.startsWith('{') &&
      value.endsWith('}') &&
      values[value.replace(/{|}/g, '')]
      ? getStringFromTemplate(template.children[0], values) // Если для переменной есть строка, возвращаем строку then
      : getStringFromTemplate(template.children[1], values); // В обратном случае, возвращаем строку else
  } else {
    return (
      // Если инпут не условный, заменяем переменные на соответствующие значения
      replaceVars(template.value, values) +
      (template.children
        ? getStringFromTemplate(template.children[0], values) + // Если есть дочерние узлы, рекурсивно получаем строку для инпута if
          getStringFromTemplate(template.children[1], values) // и для инпута else
        : '')
    );
  }
};

export { generateUID, changeNode, getNode, getStringFromTemplate };
