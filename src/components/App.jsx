import * as React from 'react';
import shallow from 'zustand/shallow';
import NavBar from './NavBar';
import { NAVITEMS } from './config';
import useStoryStore from '../store/useStoryStore';
import Layout from './Layout';
import type { State } from './types';

const App = () => {
  const { init } = useStoryStore((state: State) => {
    return { init: state.init };
  }, shallow);

  React.useEffect(() => {
    init();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App">
      <NavBar navItems={NAVITEMS} />
      <Layout />
    </div>
  );
};

export default React.memo(App);
