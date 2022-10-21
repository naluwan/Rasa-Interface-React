import * as React from 'react';
import shallow from 'zustand/shallow';
// import Authenticate from 'containers/Authenticate';
// eslint-disable-next-line no-unused-vars
import useSWR from 'swr';
// eslint-disable-next-line no-unused-vars
import { fetchRasaTrainState } from 'services/api';
import { Toast } from 'utils/swalInput';
import useStoryStore from '../store/useStoryStore';
import Layout from './Layout';
import type { State } from './types';

const App = () => {
  // eslint-disable-next-line no-unused-vars
  const { init, user, onSetRasaTrainState, rasaTrainState } = useStoryStore(
    (state: State) => {
      return {
        init: state.init,
        user: state.user,
        onSetRasaTrainState: state.onSetRasaTrainState,
        rasaTrainState: state.rasaTrainState,
      };
    },
    shallow,
  );

  // 打開網頁初始化及確認rasa機器人訓練狀況
  React.useEffect(() => {
    init();
    fetch(`http://192.168.10.105:5005/status`)
      .then((res) => res.json())
      .then((data) => {
        onSetRasaTrainState(data.num_active_training_jobs);
      });
    // eslint-disable-next-line
  }, []);

  // 確認機器人狀況
  React.useEffect(() => {
    let trainState;
    if (rasaTrainState) {
      trainState = setInterval(() => {
        fetch(`http://192.168.10.105:5005/status`)
          .then((res) => res.json())
          .then((data) => {
            onSetRasaTrainState(data.num_active_training_jobs);
          });
      }, 10000);
    }
    return () => {
      clearInterval(trainState);
      if (user && rasaTrainState) {
        Toast.fire({ icon: 'warning', title: '訓練完成' });
      }
    };
  }, [onSetRasaTrainState, rasaTrainState, user]);

  return (
    <div className="App">
      <Layout />
    </div>
  );
};

export default React.memo(App);
