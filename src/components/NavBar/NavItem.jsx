import * as React from 'react';
import cx from 'classnames';
import { NavItemType } from 'components/types';
import { NavLink } from 'react-router-dom';

const NavItem: React.FC<NavItemType> = (props) => {
  const { id, name, link } = props;
  return (
    <NavLink
      className={cx('nav-link', { active: id === 1 })}
      aria-current="page"
      to={link}
    >
      {name}
    </NavLink>
  );
};

export default React.memo(NavItem);
