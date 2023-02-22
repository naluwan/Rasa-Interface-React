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
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [muted, setMuted] = React.useState(true);
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

        // 清空輸入框
        document.querySelector('.rw-new-message').innerHTML = '';
      } catch (e) {
        console.log(e);
      }
    }
  };

  const clickVoiceBtn = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.target.classList.toggle('close');
      setMuted((prev) => {
        if (prev) {
          setVoice(true);
          return false;
        }
        setVoice(false);
        return true;
      });
    },
    [],
  );

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
        // socketUrl="https://1eb3-114-32-167-155.jp.ngrok.io/"
        socketPath="/socket.io/"
        customData={{ language: 'zh', userId: user.cpnyId }}
        profileAvatar={user.image}
        inputTextFieldHint="請輸入內容...."
        title={user.chatbotName ? user.chatbotName : title}
        params={{ storage: 'session' }}
        showFullScreenButton
        showMessageDate
        mainColor="#2d304c"
        onSocketEvent={{
          bot_uttered: (res) => {
            setBase64Url('');
            setAutoPlay(false);
            if (res.text) {
              const { text } = res;
              axios
                .post(`http://192.168.10.105:8010/tts/offline`, { text })
                .then((base64) => {
                  setBase64Url(base64.data.result);
                  setAutoPlay(true);
                })
                .catch((err) => console.log(err));
            }
          },
        }}
        onWidgetEvent={{
          onChatOpen: () => {
            const voiceBtn = document.createElement('button');
            voiceBtn.id = 'voiceBtn';
            voiceBtn.setAttribute('class', 'close');
            voiceBtn.onclick = (e) => clickVoiceBtn(e);
            setTimeout(() => {
              // 如果聊天室窗打開才執行
              if (document.querySelector('.rw-chat-open')) {
                document
                  .querySelector('.rw-toggle-fullscreen-button')
                  .insertAdjacentElement('beforebegin', voiceBtn);
              }
            }, 0);
          },
          onChatClose: () => {
            // 關閉聊天室時，將audio設為隱藏，開啟靜音
            setVoice(false);
            setMuted(true);
          },
        }}
      />
      {voice && (
        <audio
          id="botResVoice"
          src={`data:audio/wav;base64,${base64Url}`}
          autoPlay={autoPlay}
          muted={muted}
        >
          <track src="botResponse_zh.vtt" kind="captions" />
        </audio>
      )}
    </div>
  );
};

export default React.memo(WebChatWidget);
