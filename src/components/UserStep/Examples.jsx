/* eslint-disable array-callback-return */
import * as React from 'react';
import style from './Examples.module.scss';
import { confirmWidget } from '../../utils/swalInput';

// RecordElement;
type RecordElementProps = {
  name: Object,
};

const RecordElement: React.FC<RecordElementProps> = (props) => {
  const { name } = props;
  return name.map((el) => <div>{el}</div>);
};

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
        (() => {
          const keyValue = [];
          const entitys = [];
          const textSlice = [];

          entities.map((entityItem: any, index: any): void => {
            const { entity, value, start, end } = entityItem;

            if (index === 0) {
              keyValue.push(value);
              entitys.push(entity);
              textSlice.push(text.slice(start, end));

              return;
            }

            keyValue.push(value);
            entitys.push(entity);
            textSlice.push(text.slice(start, end));
          });
          return (
            <>
              <td className={style.tbltd}>
                <RecordElement name={textSlice} />
              </td>
              <td className={style.tbltd}>
                <RecordElement name={keyValue} />
              </td>
              <td className={style.tbltd}>
                <RecordElement name={entitys} />
              </td>
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
