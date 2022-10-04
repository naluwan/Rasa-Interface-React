import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from 'containers/ProtectedRoute';
import Home from 'components/Home';
import Register from 'components/Register';
import cx from 'classnames';
import Authenticate from 'containers/Authenticate';
import Menu from 'components/Menu';
import Stories from 'components/Stories';
import WebChatWidget from 'components/WebChatWidget';
import style from './Layout.module.scss';
import Login from '../Login';

const Layout = () => {
  return (
    <div className={style.layout}>
      <div className="row">
        <Authenticate>
          <div className={cx('menu col-2 ', style.layoutSide)}>
            <Menu />
          </div>
        </Authenticate>
        <div className={cx('col-10 ', style.layoutBlock)}>
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
            <Route
              path="/stories"
              element={
                <ProtectedRoute>
                  <Stories />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <Authenticate>
          <WebChatWidget />
        </Authenticate>
      </div>
    </div>
  );
};

export default React.memo(Layout);
