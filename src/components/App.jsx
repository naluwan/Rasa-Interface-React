import * as React from 'react';
import NavBar from './NavBar';
import { NAVITEMS } from './config';
import useStore from '../store';

const App = () => {
  const init = useStore((state) => state.init);

  React.useEffect(() => {
    init();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App">
      <NavBar navItems={NAVITEMS} />
    </div>
  );
};

export default App;
