import * as React from 'react';
import { NavItemType } from 'components/types';
import shallow from 'zustand/shallow';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import NavItem from './NavItem';
import style from './NavBar.module.scss';
import Authenticate from '../../containers/Authenticate';
import useStoryStore from '../../store/useStoryStore';
import type { State } from '../types';

type NavBarProps = {
  navItems: NavItemType[],
};

const NavBar: React.FC<NavBarProps> = (props) => {
  const { navItems } = props;
  const { user, onLogout } = useStoryStore((state: State) => {
    return {
      user: state.user,
      onLogout: state.onLogout,
    };
  }, shallow);
  return (
    <nav className={cx('navbar navbar-expand-lg navbar-dark', style.navbar)}>
      <div className="container-fluid">
        <Link className={cx('navbar-brand', style.logo)} to="/" />
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
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
          </ul>
          {user ? (
            <Link
              className="btn btn-outline-light"
              to="/login"
              onClick={() => onLogout()}
            >
              登出
            </Link>
          ) : (
            <Link className="btn btn-outline-light" to="/login">
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default React.memo(NavBar);
