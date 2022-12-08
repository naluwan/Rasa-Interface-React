/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import { Link } from 'react-router-dom';
import style from './Home.module.scss';
import Slider from '../Slider';

const slideData = [
  {
    index: 0,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/forest.jpg',
    headline: '故事流程教學',
  },
  {
    index: 1,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/guitar.jpg',
    headline: '故事流程教學',
  },
  {
    index: 2,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/typewriter.jpg',
    headline: '故事流程教學',
  },
  {
    index: 3,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/guitar.jpg',
    headline: '故事流程教學',
  },
  {
    index: 4,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/typewriter.jpg',
    headline: '故事流程教學',
  },
  {
    index: 5,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/guitar.jpg',
    headline: '故事流程教學',
  },
  {
    index: 6,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/typewriter.jpg',
    headline: '故事流程教學',
  },
  {
    index: 7,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/guitar.jpg',
    headline: '故事流程教學',
  },
  {
    index: 8,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/typewriter.jpg',
    headline: '故事流程教學',
  },
  {
    index: 9,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/guitar.jpg',
    headline: '故事流程教學',
  },
  {
    index: 10,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/typewriter.jpg',
    headline: '故事流程教學',
  },
  {
    index: 11,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/typewriter.jpg',
    headline: '故事流程教學',
  },
  {
    index: 12,
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/225363/typewriter.jpg',
    headline: '故事流程教學',
  },
];
type HomeProps = {
  openVideo: () => void,
};

const Home: React.FC<HomeProps> = () => {
  const openVideo = () => {
    document
      .querySelector('[data-videoblock]')
      .setAttribute('data-videoblock', 'open');
  };
  return (
    <div className={style.root}>
      <div className={style.container}>
        <h1>開始訓練你的機器人吧！</h1>
        <div className={style.Button}>
          <Link className="nav-link" to="/stories">
            <div>故事流程</div>
          </Link>
        </div>
      </div>
      <div className={style.sButtonBlock} onClick={() => openVideo()}>
        <div className={style.sButton}>Chat bot 教學</div>
      </div>
      <div data-videoblock="none" className={style.videoBlock}>
        <div className={style.Carousel}>
          <Slider heading="Example Slider" slides={slideData} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Home);
