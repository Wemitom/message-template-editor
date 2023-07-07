import React from 'react';

import useTemplate from '../../../utils/hooks/useTemplate';
import { NormalInput } from '../types';

const Inputs = () => {
  const { template, changeValue, setLastPosition } = useTemplate();

  const renderIfThenElse = (i: number): JSX.Element => {
    const ifInput = template[i];
    if (ifInput.type === 'if') {
      return (
        <>
          <div>if</div>
          <textarea
            value={template[i].value}
            onChange={(e) => changeValue(i, e.target.value)}
            onClick={() => setLastPosition(i)}
          />
          {ifInput.chilren.map((id) => {
            const element = template[id];

            return element.type === 'then' || element.type === 'else' ? (
              <React.Fragment key={`if_${i}_${element.type}`}>
                {<div>{element.type}</div>}
                <textarea
                  value={element.value}
                  onChange={(e) => changeValue(i, e.target.value)}
                  onClick={() => setLastPosition(id)}
                />
                {element.child && renderIfThenElse(element.child)}
              </React.Fragment>
            ) : (
              <></>
            );
          })}
        </>
      );
    } else {
      return <></>;
    }
  };

  const input = template[0] as NormalInput;
  return (
    <div>
      <textarea
        value={input.value}
        onChange={(e) => changeValue(0, e.target.value)}
        onClick={() => setLastPosition(0)}
      />
      {input.child && renderIfThenElse(input.child)}
    </div>
  );
};

export default Inputs;
