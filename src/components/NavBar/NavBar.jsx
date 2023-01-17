import * as React from 'react';
import { NavItemType } from 'components/types';
import shallow from 'zustand/shallow';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { CgSpinner } from 'react-icons/cg';
import yaml from 'js-yaml';
// import NavItem from './NavItem';
import style from './NavBar.module.scss';
// import Authenticate from '../../containers/Authenticate';
import useStoryStore from '../../store/useStoryStore';
import type { State } from '../types';

type NavBarProps = {
  navItems: NavItemType[],
};

const NavBar: React.FC<NavBarProps> = () => {
  // const { navItems } = props;
  const {
    user,
    rasaTrainState,
    stories,
    nlu,
    config,
    domain,
    cloneData,
    currentPage,
    onLogout,
    onSetCurrentPage,
    trainRasa,
  } = useStoryStore((state: State) => {
    return {
      user: state.user,
      rasaTrainState: state.rasaTrainState,
      stories: state.stories,
      nlu: state.nlu,
      domain: state.domain,
      config: state.config,
      cloneData: state.cloneData,
      currentPage: state.currentPage,
      onLogout: state.onLogout,
      onSetCurrentPage: state.onSetCurrentPage,
      trainRasa: state.trainRasa,
    };
  }, shallow);
  const [PersonOption, setPersonOption] = React.useState('none');
  const trainData = React.useMemo(() => {
    const today = new Date().toLocaleString('zh-Hant', { hour12: false });
    const date = today.split(' ')[0].replace(/\//g, '');
    const time = today.split(' ')[1].replace(/:/g, '');
    const data = {
      stories: yaml.dump({ stories }),
      domain: yaml.dump(domain),
      config: yaml.dump(config),
      nlu: { nlu },
      fixed_model_name: `model-${date}T${time}`,
    };

    return data;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories, nlu, domain, config, cloneData]);
  //   (currentData: ApiTrainDataType) => {
  //     fetch(`http://192.168.10.105:5005/status`)
  //       .then((res) => {
  //         return res.json();
  //       })
  //       .then((data) => {
  //         return data.num_active_training_jobs;
  //       })
  //       .then((state) => {
  //         if (!state) {
  //           onSetRasaTrainState(1);
  //           console.log('currentData:', currentData);
  //           fetch(
  //             'http://192.168.10.105:5005/model/train?save_to_default_model_directory=true&force_training=true',
  //             {
  //               method: 'post',
  //               body: JSON.stringify(currentData),
  //               headers: {
  //                 'content-Type': 'application/json',
  //               },
  //             },
  //           )
  //             .then((res) => res.headers.get('filename'))
  //             .then((fileName) => {
  //               const payload = {
  //                 model_file: `/home/bill/Work/BF36_RASA_2.8.31_spacy/models/${fileName}`,
  //               };
  //               return fetch('http://192.168.10.105:5005/model', {
  //                 method: 'put',
  //                 body: JSON.stringify(payload),
  //                 headers: {
  //                   'content-Type': 'application/json',
  //                 },
  //               });
  //             })
  //             .then((res) => {
  // if (res.status === 204) {
  //   onSetRasaTrainState(0);
  // }
  //             });
  //         } else {
  // onSetRasaTrainState(state);
  // Toast.fire({
  //   icon: 'warning',
  //   title: '機器人訓練中，請稍後',
  // });
  //         }
  //       });
  //   },
  //   [onSetRasaTrainState],
  // );

  return (
    <nav className={cx(style.navbar)}>
      <Link
        className={cx('navbar-brand', style.logo)}
        onClick={() => onSetCurrentPage('首頁')}
        to="/"
      />
      <div>
        {user ? (
          <button
            className={cx(style.persona)}
            onClick={() =>
              PersonOption === 'open'
                ? setPersonOption('none')
                : setPersonOption('open')
            }
          >
            <ul
              className={cx(
                PersonOption === 'open' ? '' : style.hidden,
                style.personaBlock,
              )}
            >
              {currentPage === '故事流程' &&
                (rasaTrainState > 0 ? (
                  <li className={cx(style.personaItem)} disabled>
                    <CgSpinner className={cx('mx-2', style.loadingIcon)} />
                    機器人訓練中
                  </li>
                ) : (
                  <li
                    className={cx(style.personaItem)}
                    onClick={() => trainRasa(trainData)}
                  >
                    執行訓練
                  </li>
                ))}

              <li className={cx(style.personaItem)} onClick={() => onLogout()}>
                登出
              </li>
            </ul>
          </button>
        ) : (
          <Link className="btn btn-outline-light" to="/login">
            登入
          </Link>
        )}
      </div>
      {/* {user ? (
          <>
            {currentPage === '故事流程' &&
              (rasaTrainState > 0 ? (
                <button className="btn btn-outline-info mx-2" disabled>
                  <CgSpinner className={cx('mx-2', style.loadingIcon)} />
                  機器人訓練中
                </button>
              ) : (
                <button
                  className="btn btn-outline-info mx-2"
                  onClick={() => trainRasa(trainData)}
                >
                  執行訓練
                </button>
              ))}

            <button
              className="btn btn-outline-light mx-1"
              onClick={() => onLogout()}
            >
              登出
            </button>
          </>
        ) : (
          <Link className="btn btn-outline-light" to="/login">
            登入
          </Link>
        )} */}
    </nav>
  );
};

export default React.memo(NavBar);
