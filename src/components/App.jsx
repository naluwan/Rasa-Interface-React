import * as React from 'react';
import NavBar from './NavBar';
import { NAVITEMS } from './config';
import useStore from '../store';
import Layout from './Layout';

const App = () => {
  const { init } = useStore((state) => {
    return { init: state.init };
  });

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

export default App;
