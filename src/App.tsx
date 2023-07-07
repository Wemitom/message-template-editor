import { useState } from 'react';

import styles from './App.module.css';
import Editor from './Editor';

/**
 * Основной компонент, который вызывается при запуске приложения. Производит рендер компонента Editor,
 * при нажании на кнопку "Message Editor".
 * @component
 */
function App() {
  // state для открытия/закрытия редактора
  const [openEditor, setOpenEditor] = useState(false);

  // Если кнопка "Message Editor" нажата, то открывается редактор
  if (openEditor) {
    return (
      <div>
        <Editor
          arrVarNames={
            localStorage.arrVarNames
              ? JSON.parse(localStorage.arrVarNames)
              : ['firstname', 'lastname', 'company', 'position']
          }
          template={
            localStorage.template ? JSON.parse(localStorage.template) : null
          }
          callbackSave={async (template) => {
            setTimeout(() => {
              localStorage.setItem('template', JSON.stringify(template));
            }, 1000);
          }}
        />
      </div>
    );
  }
  // Если кнопка "Message Editor" не нажата, то ренедрится кнопка
  return (
    <div className={styles.container}>
      <button className={styles.btn} onClick={() => setOpenEditor(!openEditor)}>
        Message Editor
      </button>
    </div>
  );
}

export default App;
