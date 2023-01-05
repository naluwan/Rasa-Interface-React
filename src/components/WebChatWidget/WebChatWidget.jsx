import * as React from 'react';
import Widget from 'rasa-webchat';
// import style from './WebChatWidget.module.scss';
import type { State } from 'components/types';
import shallow from 'zustand/shallow';
import axios from 'axios';
import useStoryStore from '../../store/useStoryStore';

const WebChatWidget = () => {
  // eslint-disable-next-line no-unused-vars
  const [base64Url, setBase64Url] = React.useState('');
  const { user } = useStoryStore((state: State) => {
    return {
      user: state.user,
    };
  }, shallow);

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      try {
        // @ts-ignore
        // eslint-disable-next-line
        document.querySelector(".rw-send").click();
      } catch (e) {
        console.log(e);
      }
    }
  };

  console.log('base64Url ==> ', base64Url);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onKeyDown={handleKeyDown}>
      <Widget
        interval={2000}
        initPayload="/get_started"
        socketUrl="http://192.168.10.105:5005"
        socketPath="/socket.io/"
        customData={{ language: 'zh', userId: user.cpnyId }}
        profileAvatar={user.image}
        inputTextFieldHint="請輸入內容...."
        title={user.chatbotName}
        params={{ storage: 'session' }}
        showFullScreenButton
        showCloseButton
        showMessageDate
        mainColor="#2d304c"
        onSocketEvent={{
          bot_uttered: (res) => {
            if (res.text) {
              const { text } = res;
              console.log('bot res ==> ', text);
              axios
                .post(`http://192.168.10.105:8010/tts/offline`, { text })
                .then((base64) => {
                  console.log('get text2voice base64 ==> ', base64.data.result);
                  setBase64Url(base64.data.result);
                  // if (document.querySelector('#botResVoice')) {
                  //   document.querySelector('#botResVoice').remove();
                  // }
                  // // const audioHtml = ;
                  // document.querySelector('.rw-chat-open').appendChild(
                  //   <audio id="botResVoice" autoPlay="autoPlay">
                  //     <source src={`data:audio/wav;base64,${base64Url}`} />
                  //     <track src="botResponse_zh.vtt" kind="captions" />
                  //   </audio>,
                  // );
                })
                // .then(() => setBase64Url(''))
                .catch((err) => console.log(err));
            }
          },
        }}
      />
      {base64Url && (
        <audio autoPlay="autoPlay">
          <source src={`data:audio/wav;base64,${base64Url}`} />
          <track src="botResponse_zh.vtt" kind="captions" />
        </audio>
      )}
    </div>
  );
};

export default React.memo(WebChatWidget);
