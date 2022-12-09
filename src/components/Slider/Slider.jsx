/* eslint-disable no-useless-escape */
/* eslint-disable react/style-prop-object */
/* eslint-disable no-plusplus */
/* eslint-disable no-empty */
/* eslint-disable no-alert */
import * as React from 'react';
import cx from 'classnames';
import style from './Slider.module.scss';
import SliderControl from '../SliderControl';
import Slide from '../Slide';

type SliderProps = {
  heading: string,
  slides: object,
};

const Slider: React.FC<SliderProps> = (props) => {
  const { heading, slides } = props;

  // 處理上一個點擊
  const handlePreviousClick = () => {
    let lastpoint = 0;
    const type = Number(
      document
        .querySelector('[data-choose="current"]')
        .getAttribute('data-number'),
    );
    const previous = type - 1;
    if (previous < 0) {
      lastpoint = slides.length - 1;
    } else {
      lastpoint = previous;
    }
    document
      .querySelector('#wrapperTransform')
      .setAttribute(
        'style',
        `transform:translateX(-${
          lastpoint * (100 / slides.length)
        }%);transition: all .3s;`,
      );
    document
      .querySelector(`#wrapperTransform [data-number="${Number(lastpoint)}"]`)
      .setAttribute('data-choose', 'current');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(lastpoint) - 1 !== -1
            ? Number(lastpoint) - 1
            : slides.length - 1
        }"]`,
      )
      .setAttribute('data-choose', 'previous');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(lastpoint) + 1 > slides.length - 1 ? 0 : Number(lastpoint) + 1
        }"]`,
      )
      .setAttribute('data-choose', 'next');
  };

  // 處理下一個點擊
  const handleNextClick = () => {
    let Nextpoint = 0;
    const type = Number(
      document
        .querySelector('[data-choose="current"]')
        .getAttribute('data-number'),
    );
    const next = type + 1;
    if (next === slides.length) {
      Nextpoint = 0;
    } else {
      Nextpoint = next;
    }

    document
      .querySelector('#wrapperTransform')
      .setAttribute(
        'style',
        `transform:translateX(-${
          Nextpoint * (100 / slides.length)
        }%);transition: all .3s;`,
      );
    document
      .querySelector(`#wrapperTransform [data-number="${Number(Nextpoint)}"]`)
      .setAttribute('data-choose', 'current');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(Nextpoint) - 1 !== -1
            ? Number(Nextpoint) - 1
            : slides.length - 1
        }"]`,
      )
      .setAttribute('data-choose', 'previous');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(Nextpoint) + 1 > slides.length - 1 ? 0 : Number(Nextpoint) + 1
        }"]`,
      )
      .setAttribute('data-choose', 'next');
  };

  // 滑動點擊
  const handleSlideClick = (type) => {
    const allopenView = document.querySelectorAll('[data-dis]');
    for (let i = 0; i < allopenView.length; i++) {
      allopenView[i].setAttribute('data-dis', 'none');
    }
    let current = 0;
    if (current !== slides[type].index) {
      current = type;
    }

    try {
      document.querySelector('[data-choose="current"] #player').stopVideo();
    } catch (error) {}
    const alliframe = document.querySelectorAll('[data-dis] .videoId');
    for (let i = 0; i < alliframe.length; i++) {
      alliframe[i].contentWindow.postMessage(
        '{"event":"command", "func":"pauseVideo", "args":""}',
        '*',
      );
    }

    document
      .querySelector('#wrapperTransform')
      .setAttribute(
        'style',
        `transform:translateX(-${
          type * (100 / slides.length)
        }%);transition: all .3s;`,
      );
    document
      .querySelector(`#wrapperTransform [data-number="${Number(type)}"]`)
      .setAttribute('data-choose', 'current');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(type) - 1 !== -1 ? Number(type) - 1 : slides.length - 1
        }"]`,
      )
      .setAttribute('data-choose', 'previous');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(type) + 1 > slides.length - 1 ? 0 : Number(type) + 1
        }"]`,
      )
      .setAttribute('data-choose', 'next');
  };
  const wrapperTransform = {
    transform: `translateX(-${0 * (100 / slides.length)}%) transition: all .3s`,
  };
  const headingId = `slider-heading__${heading}
    // eslint-disable-next-line no-useless-escape
    .replace(/\s+/g, '-')
    .toLowerCase()}`;

  return (
    <div className={cx(style.slider)} aria-labelledby={headingId}>
      <ul
        id="wrapperTransform"
        className={cx(style.slider__wrapper)}
        style={wrapperTransform}
      >
        {slides.map((slide) => {
          return (
            <Slide
              key={slide.index}
              current={0}
              slideObj={slide}
              onClick={() => handleSlideClick(slide.index)}
            />
          );
        })}
      </ul>
      <div className={cx(style.slider__controls)}>
        <SliderControl
          type="previous"
          title="Go to previous slide"
          onClick={() => handlePreviousClick()}
        />

        <SliderControl
          type="next"
          title="Go to next slide"
          onClick={() => handleNextClick()}
        />
      </div>
    </div>
  );
};

export default React.memo(Slider);
