import * as React from 'react';
import Widget from 'rasa-webchat';
import type { State } from 'components/types';
import shallow from 'zustand/shallow';
import axios from 'axios';
import style from './WebChatWidget.module.scss';
import useStoryStore from '../../store/useStoryStore';

const WebChatWidget = () => {
  const [base64Url, setBase64Url] = React.useState('');
  const [voice, setVoice] = React.useState(true);
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

  const title = document.querySelector('title').innerText;

  // 重整就消除對話紀錄
  window.sessionStorage.clear();

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onKeyDown={handleKeyDown} className={style.root}>
      <Widget
        interval={2000}
        initPayload="/get_started"
        socketUrl="http://192.168.10.105:5005"
        socketPath="/socket.io/"
        customData={{ language: 'zh', userId: user.cpnyId }}
        profileAvatar={user.image}
        inputTextFieldHint="請輸入內容...."
        title={user.chatbotName ? user.chatbotName : title}
        params={{ storage: 'session' }}
        showFullScreenButton
        showCloseButton
        showMessageDate
        mainColor="#2d304c"
        onSocketEvent={{
          bot_uttered: (res) => {
            setBase64Url('');
            if (res.text) {
              const { text } = res;
              axios
                .post(`http://192.168.10.105:8010/tts/offline`, { text })
                .then((base64) => {
                  setBase64Url(base64.data.result);
                })
                .catch((err) => console.log(err));
            }
          },
        }}
        onWidgetEvent={{
          onChatOpen() {
            const voiceBtn = document.createElement('button');
            voiceBtn.id = 'voiceBtn';
            voiceBtn.onclick = function clickVoiceBtn(event) {
              event.target.classList.toggle('close');
              setVoice((prev) => !prev);
            };
            setTimeout(() => {
              // 如果聊天室窗打開才執行
              if (document.querySelector('.rw-chat-open')) {
                document
                  .querySelector('.rw-toggle-fullscreen-button')
                  .insertAdjacentElement('beforebegin', voiceBtn);
              }
            }, 0);
          },
        }}
      />
      {base64Url && voice && (
        <audio
          id="botResVoice"
          src={`data:audio/wav;base64,${base64Url}`}
          autoPlay
        >
          <track src="botResponse_zh.vtt" kind="captions" />
        </audio>
      )}
    </div>
  );
};

export default React.memo(WebChatWidget);
