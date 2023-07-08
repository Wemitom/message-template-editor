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
 * @return {Input | null} - Обновленный узел или null, если root равен null.
 */
const changeNode = (
  root: Input | null,
  uid: string,
  value?: string,
  children?: [IfInput, OtherInput] | [OtherInput, OtherInput]
) => {
  if (root === null) return null;

  if (root.uid === uid) {
    return {
      ...root,
      value: value || root.value,
      children: children || root.children
    };
  }

  if (root.type === 'if') {
    const firstUpdatedChild = changeNode(
      root.children[0],
      uid,
      value,
      children
    ) as OtherInput;
    const secondUpdatedChild = changeNode(
      root.children[1],
      uid,
      value,
      children
    ) as OtherInput;

    return { ...root, children: [firstUpdatedChild, secondUpdatedChild] };
  } else if (root.children) {
    const firstUpdatedChild = changeNode(
      root.children[0],
      uid,
      value,
      children
    ) as IfInput;
    const secondUpdatedChild = changeNode(
      root.children[1],
      uid,
      value,
      children
    ) as OtherInput;
    return { ...root, children: [firstUpdatedChild, secondUpdatedChild] };
  }

  return root;
};

export { generateUID, changeNode };
