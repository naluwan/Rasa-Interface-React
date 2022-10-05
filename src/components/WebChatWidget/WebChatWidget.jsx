import * as React from 'react';
import Widget from 'rasa-webchat';
// import style from './WebChatWidget.module.scss';
import useStore from '../../store';

const WebChatWidget = () => {
  const { user } = useStore((state) => {
    return {
      user: state.user,
    };
  });
  return (
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
      onWidgetEvent={{ onChatClose: () => sessionStorage.clear() }}
      showFullScreenButton
      showCloseButton
      showMessageDate
    />
  );
};

export default React.memo(WebChatWidget);
