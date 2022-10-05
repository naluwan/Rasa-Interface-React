import * as React from 'react';
import style from './ShowStory.module.scss';

const ShowStory = () => {
  return (
    <div className={style.root}>
      <h1>ShowStory</h1>
    </div>
  );
};

export default React.memo(ShowStory);
