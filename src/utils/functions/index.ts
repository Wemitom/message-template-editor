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

  if (root.uid === uid) {
    return {
      ...root,
      value: value !== undefined ? value : root.value,
      children: changeChildren ? children : root.children
    };
  }

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

export { generateUID, changeNode, getNode };
