import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './NavBar';
import Login from './Login';
import { NAVITEMS } from './config';
import useStore from '../store';

const App = () => {
  const init = useStore((state) => state.init);

  React.useEffect(() => {
    init();
    // eslint-disable-next-line
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <NavBar navItems={NAVITEMS} />
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
