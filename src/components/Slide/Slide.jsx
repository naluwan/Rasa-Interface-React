/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-empty */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-plusplus */
import * as React from 'react';
import cx from 'classnames';
import style from './Slide.module.scss';

type SlideProps = {
  slideObj: object,
  onClick: (e: React.MouseEvent) => void,
  current: number,
};

const Slide: React.FC<SlideProps> = (props) => {
  const { current, slideObj, onClick } = props;
  // 播放影片
  const playYoutube = () => {
    const allopenView = document.querySelectorAll('[data-dis]');
    for (let i = 0; i < allopenView.length; i++) {
      allopenView[i].setAttribute('data-dis', 'none');
    }
    const alliframe = document.querySelectorAll('[data-dis] .videoId');
    for (let i = 0; i < alliframe.length; i++) {
      alliframe[i].contentWindow.postMessage(
        '{"event":"command", "func":"pauseVideo", "args":""}',
        '*',
      );
    }
    document
      .querySelector('[data-choose="current"] ')
      .setAttribute('data-dis', 'open');
    const iframea = document.querySelector('[data-choose="current"] .videoId');
    try {
      iframea.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        '*',
      );
    } catch (error) {}
  };
  // 屬標移動
  const handleMouseMove = (event) => {
    const el = slideObj.current;
    const r = el.getBoundingClientRect();

    el.style.setProperty(
      '--x',
      event.clientX - (r.left + Math.floor(r.width / 2)),
    );
    el.style.setProperty(
      '--y',
      event.clientY - (r.top + Math.floor(r.height / 2)),
    );
  };
  const handleMouseLeave = () => {
    slideObj.current.style.setProperty('--x', 0);
    slideObj.current.style.setProperty('--y', 0);
  };

  const imageLoaded = (event) => {
    event.target.style.opacity = 1;
  };
  const closeView = () => {
    document
      .querySelector('[data-videoblock]')
      .setAttribute('data-videoblock', 'none');
  };
  const { src, headline, index } = slideObj;
  let anyclass = '';

  if (current === index) anyclass = 'current';
  else if (current - 1 === index) anyclass = 'previous';
  else if (current + 1 === index) anyclass = 'next';

  return (
    <li
      data-dis="none"
      ref={slideObj}
      data-number={index}
      data-choose={anyclass}
      className={cx(style.slide)}
      onMouseMove={() => handleMouseMove(event)}
      onMouseLeave={() => handleMouseLeave(event)}
      onClick={onClick}
    >
      <div className={cx(style.slide__image_wrapper)}>
        <img
          className={cx(style.slide__image)}
          alt={headline}
          src={src}
          onLoad={() => imageLoaded(event)}
        />
      </div>
      <div className={cx(style.video)}>
        <iframe
          className="videoId"
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/n61ULEU7CO0?enablejsapi=1"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autop"
        />
      </div>
      <article className={cx(style.slide__content)}>
        <h2 className={cx(style.slide__headline)}>{headline}</h2>
        <button
          className={cx(style.slide__action, style.btn)}
          onClick={() => playYoutube()}
        >
          播放
        </button>
      </article>
      <span className={cx(style.closeBlock)}>
        <span className={cx(style.close)} onClick={() => closeView()} />
      </span>
    </li>
  );
};

export default React.memo(Slide);
