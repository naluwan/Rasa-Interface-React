import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import NavBar from './NavBar';
import { NAVITEMS } from './config';
import useStore from '../store';

const App = () => {
  const { init, user } = useStore((state) => {
    return { user: state.user, init: state.init };
  });

  React.useEffect(() => {
    init();
    // eslint-disable-next-line
  }, []);
  if (!user) {
    <Navigate to="/login" />;
  }

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
