import * as React from 'react';
import cx from 'classnames';

type NavItemProps = {
  id: string,
  name: string,
};

const NavItem: React.FC<NavItemProps> = (props) => {
  const { id, name } = props;
  return (
    <a
      className={cx('nav-link', { active: id === 1 })}
      aria-current="page"
      href="/"
    >
      {name}
    </a>
  );
};

export default React.memo(NavItem);
