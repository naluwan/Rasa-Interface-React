import * as React from 'react';
import cx from 'classnames';
import { RiCloseCircleFill } from 'react-icons/ri';
import style from './CheckPoint.module.scss';
import type { StoryType } from '../types';

type NavTabProps = {
  branch: (StoryType & { isActive: boolean })[],
  onClickTab: (
    e: React.MouseEvent<HTMLButtonElement>,
    storyName: string,
  ) => void,
};

const NavTab: React.FC<NavTabProps> = (props) => {
  const { story, isActive, onClickTab } = props;
  const idx = story.lastIndexOf('_');
  const storyName = story.slice(idx + 1, story.length);
  // console.log('navTab isActive:', isActive);
  return (
    <button
      className={cx('nav-link', { active: isActive }, style.checkPointNavTab)}
      id={`${storyName}_tab`}
      data-bs-toggle="tab"
      data-bs-target="#nav-home"
      type="button"
      role="tab"
      aria-controls="nav-home"
      aria-selected={isActive}
      onClick={(e) => onClickTab(e, story)}
    >
      {storyName}
      <RiCloseCircleFill className={style.closeIcon} />
    </button>
  );
};

export default React.memo(NavTab);
