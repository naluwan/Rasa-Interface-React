/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import * as React from 'react';
import Select from 'react-select';
import { useQuery } from 'react-query';
import cx from 'classnames';
import style from './Conversation.module.scss';
import {
  fetchGetAllSenderIds,
  fetchGetConversationLog,
} from '../../services/api';

type ConversationProps = {};

const Conversation: React.FC<ConversationProps> = () => {
  const [options, setOptions] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState('');
  // eslint-disable-next-line no-unused-vars
  const [conversation, setConversation] = React.useState({});

  const senderIds = useQuery('fetchGetAllSenderIds', fetchGetAllSenderIds);
  const conversationLog = useQuery(['conversationLog', selectedId], () =>
    fetchGetConversationLog(selectedId),
  );

  // 獲取全部senderId後，將senderId全部資料重組成options
  React.useEffect(() => {
    if (senderIds.isSuccess && !senderIds.isError && !senderIds.isLoading) {
      const currentSenderIds = senderIds.data.map((item) => {
        const currentTime = new Date(item.createdAt).toLocaleString();
        return {
          value: item.senderId,
          label: `${currentTime} - ${item.senderId}`,
        };
      });
      setOptions(currentSenderIds);
    }
  }, [
    senderIds.data,
    setOptions,
    senderIds.isSuccess,
    senderIds.isError,
    senderIds.isLoading,
  ]);

  React.useEffect(() => {
    if (
      conversationLog.isSuccess &&
      !conversationLog.isError &&
      !conversationLog.isLoading
    ) {
      setConversation(conversationLog.data);
    }
  }, [
    conversationLog.isSuccess,
    conversationLog.isError,
    conversationLog.isLoading,
    conversationLog.data,
  ]);

  const atSelectOption = React.useCallback(
    (id: string) => {
      setConversation({});
      setSelectedId(id);
    },
    [setConversation, setSelectedId],
  );

  return (
    <div className="container">
      <div className="row">
        <div className={style.root}>
          <h1>對話紀錄</h1>
          <div>
            <Select
              options={options}
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                  display: 'flex',
                  justifyContent: 'space-between',
                }),
              }}
              menuPortalTarget={document.querySelector('body')}
              onChange={(e) => atSelectOption(e.value)}
            />
          </div>
          {conversation.sender_id !== 'default' && conversation.events && (
            <div className={cx(style.logContainer)}>
              {conversation.events?.map((item) => {
                if (item.event === 'user') {
                  return (
                    <div
                      className={cx('col-6', style.userLog)}
                      key={item.timestamp}
                    >
                      使用者：
                      {item.text === '/get_started' ? '打開聊天室' : item.text}
                    </div>
                  );
                }
                if (item.event === 'bot') {
                  return (
                    <div
                      className={cx('col-6', style.botLog)}
                      key={item.timestamp}
                    >
                      機器人回覆：{item.text}
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Conversation);
