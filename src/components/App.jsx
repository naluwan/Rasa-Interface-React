import * as React from 'react';
import shallow from 'zustand/shallow';
import NavBar from './NavBar';
import { NAVITEMS } from './config';
import useStore from '../store';
import Layout from './Layout';

const App = () => {
  const { init } = useStore((state) => {
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
