import * as React from 'react';
import shallow from 'zustand/shallow';
import Authenticate from 'containers/Authenticate';
import useStoryStore from '../store/useStoryStore';
import Layout from './Layout';
import type { State } from './types';
import WebChatWidget from './WebChatWidget';

const App = () => {
  const { init } = useStoryStore((state: State) => {
    return { init: state.init };
  }, shallow);

  React.useEffect(() => {
    init();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App">
      <Layout />
      <Authenticate>
        <WebChatWidget />
      </Authenticate>
    </div>
  );
};

export default React.memo(App);
