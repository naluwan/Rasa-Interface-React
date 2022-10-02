import * as React from 'react';
import style from './Home.module.scss';

const Home = () => {
  return (
    <div className={style.root}>
      <h1>Home</h1>
    </div>
  );
};

export default React.memo(Home);
