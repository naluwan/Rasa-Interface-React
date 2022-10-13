import * as React from 'react';
import style from './CreateStory.module.scss';

type CreateStoryProps = {};

const CreateStory: React.FC<CreateStoryProps> = () => {
  return (
    <div className={style.root}>
      <h1>CreateStory</h1>
    </div>
  );
};

export default React.memo(CreateStory);
