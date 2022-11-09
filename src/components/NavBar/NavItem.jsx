import * as React from 'react';
import cx from 'classnames';
import { NavItemType, State } from 'components/types';
import { NavLink } from 'react-router-dom';
import useStoryStore from 'store/useStoryStore';
import shallow from 'zustand/shallow';

const NavItem: React.FC<NavItemType> = (props) => {
  const { id, name, link } = props;
  const { onSetCurrentPage } = useStoryStore((state: State) => {
    return {
      onSetCurrentPage: state.onSetCurrentPage,
    };
  }, shallow);
  return (
    <NavLink
      className={cx('nav-link', { active: id === 1 })}
      aria-current="page"
      to={link}
      onClick={() => onSetCurrentPage(name)}
    >
      {name}
    </NavLink>
  );
};

export default React.memo(NavItem);
