import * as React from 'react';
import NavItem from './NavItem';
// import style from './NavBar.module.css';

type NavBarProps = {
  titles: object[],
};

const NavBar: React.FC<NavBarProps> = (props) => {
  const { titles } = props;
  return (
    <nav className="navbar navbar-expand-lg bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          InterInfo 聊天機器人設定
        </a>
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
            {titles.map((title) => {
              return <NavItem key={title.id} id={title.id} name={title.name} />;
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(NavBar);
