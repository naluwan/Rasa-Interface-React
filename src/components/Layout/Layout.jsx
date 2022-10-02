import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from 'containers/ProtectedRoute';
import Home from 'components/Home';
import Register from 'components/Register';
import style from './Layout.module.scss';
import Login from '../Login';

const Layout = () => {
  return (
    <div className={style.root}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default React.memo(Layout);
