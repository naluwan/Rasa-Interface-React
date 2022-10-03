import * as React from 'react';
import { NavItemType } from 'components/types';
import shallow from 'zustand/shallow';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';
import NavItem from './NavItem';
import style from './NavBar.module.scss';
import Authenticate from '../../containers/Authenticate';
import useStore from '../../store';

type NavBarProps = {
  navItems: NavItemType[],
};

const NavBar: React.FC<NavBarProps> = (props) => {
  const { navItems } = props;
  const { user, onLogout } = useStore((state) => {
    return {
      user: state.user,
      onLogout: state.onLogout,
    };
  }, shallow);
  return (
    <nav className={cx('navbar navbar-expand-lg navbar-dark', style.navbar)}>
      <div className="container-fluid">
        <NavLink className={cx('navbar-brand', style.logo)} to="/" />
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <Authenticate>
              {navItems.map((navItem) => {
                return (
                  <NavItem
                    key={navItem.id}
                    id={navItem.id}
                    name={navItem.name}
                    link={navItem.link}
                  />
                );
              })}
            </Authenticate>
            {user ? (
              <button
                className="btn btn-outline-secondary"
                onClick={() => onLogout()}
              >
                登出
              </button>
            ) : (
              <NavLink className="btn btn-outline-secondary" to="/login">
                登入
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(NavBar);
