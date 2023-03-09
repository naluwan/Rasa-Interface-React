/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import * as React from 'react';
import { useQuery } from 'react-query';
import cx from 'classnames';
import style from './Conversation.module.scss';
import { fetchConversationLogs } from '../../services/api';

// 轉換正確顯示時間格式
const getDate = (nowDate) => {
  const date = new Date().toLocaleDateString();
  let dateArr;

  if (!nowDate) {
    dateArr = date.split('/');
  } else {
    dateArr = nowDate.split('/');
  }

  dateArr.map((item, idx) => {
    if (idx > 0 && item < 10) {
      dateArr[idx] = `0${item}`;
    }
  });

  return `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}`;
};

const Conversation: React.FC<ConversationProps> = () => {
  const [conversations, setConversations] = React.useState([]);
  const [filtered, setFiltered] = React.useState(
    new Date().toLocaleDateString(),
  );
  const [showDate, setShowDate] = React.useState(getDate());

  const conversationLogs = useQuery(['conversationLog'], () =>
    fetchConversationLogs(),
  );

  React.useEffect(() => {
    if (
      conversationLogs.isSuccess &&
      !conversationLogs.isError &&
      !conversationLogs.isLoading
    ) {
      setConversations(conversationLogs.data);
    }
  }, [
    setConversations,
    conversationLogs.data,
    conversationLogs.isSuccess,
    conversationLogs.isError,
    conversationLogs.isLoading,
  ]);

  const filteredLog = React.useMemo(() => {
    let currentLogs = conversations;
    currentLogs = currentLogs.map((logs) =>
      logs.filter(
        (log) =>
          new Date(log.timestamp * 1000).toLocaleDateString() === filtered,
      ),
    );
    return currentLogs;
  }, [conversations, filtered]);

  return (
    <div className="container">
      <div className="row">
        <div className={style.root}>
          <h1>對話紀錄</h1>
          <div
            className={cx(
              'col-4 m-3 d-flex align-items-center justify-content-between',
            )}
          >
            <button
              className={cx('btn btn-primary')}
              onClick={() => conversationLogs.refetch()}
            >
              獲取最新記錄
            </button>
            <div>
              <input
                className={cx('form-control')}
                type="date"
                value={showDate}
                onChange={(e) => {
                  setFiltered(new Date(e.target.value).toLocaleDateString());
                  setShowDate(
                    getDate(new Date(e.target.value).toLocaleDateString()),
                  );
                }}
              />
            </div>
          </div>
          {filteredLog.length > 0 && (
            <div className={cx('table-responsive', style.logContainer)}>
              <table className={cx('table table-bordered border-dark')}>
                <thead className={cx(style.tableHeader)}>
                  <tr>
                    <th>時間</th>
                    <th>ID</th>
                    <th>使用者問句</th>
                    <th>機器人回覆</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLog.map((item) => {
                    const logs = [];
                    item.map((logItem, idx) => {
                      if ((idx + 1) % 2 === 0) {
                        logs[Math.floor(idx / 2)][logItem.typeName] =
                          logItem.data.text;
                      } else {
                        logs.push({
                          [logItem.typeName]: logItem.data.text,
                          timestamp: new Date(
                            logItem.timestamp * 1000,
                          ).toLocaleString(),
                          senderId: logItem.senderId,
                        });
                      }
                    });
                    return logs.map((eventItem) => {
                      return (
                        <tr key={eventItem.timestamp}>
                          <td className={cx(style.userLog)}>
                            {eventItem.timestamp}
                          </td>
                          <td>{eventItem.senderId}</td>
                          <td className={cx(style.userLog)}>
                            {eventItem.user === '/get_started'
                              ? '打開聊天室'
                              : eventItem.user}
                          </td>
                          <td className={cx(style.botLog)}>{eventItem.bot}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Conversation);
