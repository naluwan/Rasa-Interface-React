import * as React from 'react';
import Widget from 'rasa-webchat';
import type { State } from 'components/types';
import shallow from 'zustand/shallow';
import axios from 'axios';
import Recorder from 'js-audio-recorder';
import style from './WebChatWidget.module.scss';
import useStoryStore from '../../store/useStoryStore';

const WebChatWidget = () => {
  const recorder = new Recorder({
    sampleBits: 16,
    sampleRate: 16000,
    numChannels: 1,
    compiling: true,
  });
  const webChatRef = React.useRef(null);
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

  const atMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, currentRecorder) => {
      console.log(e.type);
      if (e.type !== 'touchstart' && e.button === 0) {
        console.log('點擊錄音');
        currentRecorder.start();
      }

      if (e.type === 'touchstart') {
        e.preventDefault();
        currentRecorder.start();
      }
    },
    [],
  );

  const atMouseUp = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, currentRecorder) => {
      console.log(e.type);
      if (e.button === 0 || e.type === 'touchend') {
        console.log('放開左鍵');
        currentRecorder.stop();
        // currentRecorder.play();
        const blob = currentRecorder.getWAVBlob();
        console.log('blob ==> ', blob.size);
        const formData = new FormData();
        formData.append('files', blob);
        axios
          .post('http://192.168.10.105:8010/asr/offline', formData)
          .then((res) => {
            console.log('asr res ==> ', res);
            console.log('webChatRef.current ==> ', webChatRef.current);
            webChatRef.current.sendMessage(res.data.result);
          })
          .catch((err) => console.log(err));
      }
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
        ref={webChatRef}
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
          user_uttered: (e) => {
            console.log('user say ==> ', e);
          },
          bot_uttered: (res) => {
            console.log('bot res ==> ', res);
            setBase64Url('');
            setAutoPlay(false);
            let botResText = '';
            // 機器人回覆文字
            if (res.text) {
              const { text } = res;

              // 將要發送到語音伺服器轉化的字句做處理，將換行符、$、,移除
              const currentText = JSON.parse(
                JSON.stringify(text)
                  .replace(/ {2}\\n/g, '')
                  .replace(/\$/g, ''),
                // .replace(/,/g, '')
                // .replace(/\(comma\)/g, ','),
              );
              botResText += currentText;
            }

            // 機器人回覆按鈕選項，將按鈕選項組進語音字串中
            if (res.buttons) {
              const { buttons } = res;
              buttons.map((button, idx) => {
                if (idx + 1 !== buttons.length) {
                  botResText += `選項${idx + 1}${button.title},`;
                } else {
                  botResText += `選項${idx + 1}${button.title}`;
                }
                return button;
              });
            }

            axios
              .post(`http://192.168.10.105:8010/tts/offline`, {
                text: botResText,
                spk_id: 174,
              })
              .then((base64) => {
                setBase64Url(base64.data.result);
                setAutoPlay(true);
              })
              .catch((err) => console.log(err));
          },
        }}
        onWidgetEvent={{
          onChatOpen: () => {
            const voiceBtn = document.createElement('button');
            voiceBtn.id = 'voiceBtn';
            voiceBtn.setAttribute('class', 'close');
            voiceBtn.onclick = (e) => clickVoiceBtn(e);
            const recorderBtn = document.createElement('button');
            recorderBtn.id = 'recorderBtn';
            recorderBtn.onmousedown = (e) => atMouseDown(e, recorder);
            recorderBtn.onmouseup = (e) => atMouseUp(e, recorder);
            recorderBtn.ontouchstart = (e) => atMouseDown(e, recorder);
            recorderBtn.ontouchend = (e) => atMouseUp(e, recorder);
            setTimeout(() => {
              // 如果聊天室窗打開才執行
              if (document.querySelector('.rw-chat-open')) {
                document
                  .querySelector('.rw-toggle-fullscreen-button')
                  .insertAdjacentElement('beforebegin', voiceBtn);
              }
              if (document.querySelector('.rw-sender')) {
                document
                  .querySelector('.rw-send')
                  .insertAdjacentElement('afterend', recorderBtn);
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
