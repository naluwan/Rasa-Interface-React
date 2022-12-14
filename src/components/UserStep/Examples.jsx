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
  return (
    <div className={style.root}>
      <div className="col-4">{text}</div>
      <div className="col-4">
        {entities.length > 0 &&
          entities.map((entityItem) => {
            const { entity, value, start, end } = entityItem;
            return (
              <div key={entity + value} className="py-2">
                <div>關鍵字:{text.slice(start, end)}</div>
                <div>儲存槽:{value}</div>
                <div>記錄槽:{entity}</div>
              </div>
            );
          })}
      </div>
      <div className="col-3 text-end ">
        {/* <button className="btn btn-outline-primary mx-2">關鍵字</button> */}
        <button
          className="btn btn-outline-danger mx-2"
          onClick={() => atDeleteExample(text, intent)}
        >
          刪除
        </button>
      </div>
    </div>
  );
};

export default React.memo(Examples);
