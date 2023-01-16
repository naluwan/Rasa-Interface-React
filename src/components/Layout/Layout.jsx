import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from 'containers/ProtectedRoute';
import Home from 'components/Home';
import Register from 'components/Register';
import Authenticate from 'containers/Authenticate';
import Stories from 'components/Stories';
import WebChatWidget from 'components/WebChatWidget';
import style from './Layout.module.scss';
import Login from '../Login';
// import NavBar from '../NavBar';
// import { NAVITEMS } from '../config';

const Layout = () => {
  return (
    <div className={style.layout}>
      {/* <Authenticate>
        <NavBar navItems={NAVITEMS} />
      </Authenticate> */}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className={style.layoutBlock}>
                <Home />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <div className={style.layoutBlock}>
                <Stories />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Authenticate>
        <WebChatWidget />
      </Authenticate>
    </div>
  );
};

export default React.memo(Layout);
