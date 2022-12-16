/* eslint-disable no-undef */
/* eslint-disable array-callback-return */
/* eslint-disable func-names */
/* eslint-disable block-scoped-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import style from './Examples.module.scss';
import { confirmWidget } from '../../utils/swalInput';

type ExamplesPropsType = {
  text: string,
  intent: string,
  entities: { entity: string, value: string },
  onDeleteExample: (userSay: string, intent: string) => void,
};

const Examples: React.FC<ExamplesPropsType> = (props) => {
  // const { text, intent, entities, entitiesData, onDeleteExample } = props;
  const { text, intent, entities, onDeleteExample } = props;
  // console.log('entitiesData:', entitiesData);

  // 刪除例句
  const atDeleteExample = React.useCallback(
    (userSay: string, stepIntent: string) => {
      confirmWidget(userSay, 'deleteExample').then((result) => {
        if (!result.isConfirmed) return;
        onDeleteExample(userSay, stepIntent);
      });
    },
    [onDeleteExample],
  );
  console.log(entities);
  return (
    <tr className={style.root}>
      <td className={style.tbltd}>{text}</td>
      {entities.length > 0 ? (
        (function () {
          const keyValue = document.createElement('div');
          let entitys = '';
          let textSlice = '';
          entities.map((entityItem, index) => {
            const { entity, value, start, end } = entityItem;
            if (index === 0) {
              keyValue.innerHTML += `${value}`;
              entitys += `${entity}`;
              textSlice += text.slice(start, end);
            }
            if (index !== 0) {
              keyValue.innerHTML += `${value}`;
              entitys += `,${entity}`;
              textSlice += `,${text.slice(start, end)}`;
            }
            console.log(keyValue);
          });
          return (
            <>
              <td className={style.tbltd}>{textSlice}</td>
              <td className={style.tbltd}>{keyValue.innerHTML}</td>
              <td className={style.tbltd}>{entitys}</td>
            </>
          );
        })()
      ) : (
        <>
          <td className={style.tbltd} />
          <td className={style.tbltd} />
          <td className={style.tbltd} />
        </>
      )}
      <td className={style.tbltd}>
        {/* <button className="btn btn-outline-primary mx-2">關鍵字</button> */}
        <button
          className="btn btn-outline-danger mx-2"
          onClick={() => atDeleteExample(text, intent)}
        >
          刪除
        </button>
      </td>
    </tr>
  );
};

export default React.memo(Examples);
