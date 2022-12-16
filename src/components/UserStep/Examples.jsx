/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
/* eslint-disable array-callback-return */
/* eslint-disable react/no-unstable-nested-components */
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
  return (
    <tr className={style.root}>
      <td className={style.tbltd}>{text}</td>
      {entities.length > 0 ? (
        (function () {
          const keyValue = [];
          let entitys = '';
          let textSlice = '';
          const recordElement = ({ key }) => {
            console.log(key);
            return <div>{key[0]}</div>;
          };
          entities.map((entityItem, index) => {
            const { entity, value, start, end } = entityItem;

            if (index === 0) {
              keyValue.push(value);
              entitys += `${entity}`;
              textSlice += text.slice(start, end);
              return;
            }

            keyValue.push(value);
            entitys += `,${entity}`;
            textSlice += `,${text.slice(start, end)}`;
          });
          return (
            <>
              <td className={style.tbltd}>{textSlice}</td>
              <td className={style.tbltd}>
                <recordElement name={keyValue} />
              </td>
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
