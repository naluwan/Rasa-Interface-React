/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
/* eslint-disable no-return-assign */
import * as React from 'react';
import cx from 'classnames';
import type { State } from 'components/types';
import uuid from 'react-uuid';
import shallow from 'zustand/shallow';
import style from './CreateNewStory.module.scss';
import type { StoryType, CreateStoryState, NluType } from '../types';
import { Toast } from '../../utils/swalInput';
import { randomBotResAction } from '../../utils/randomBotResAction';
import useCreateStoryStore from '../../store/useCreateStoryStore';

type CreateNewStoryProps = {
  newStory: StoryType,
  newStoryInfo: Object,
  categories: State,
  stories: State,
  nlu: NluType,
  actions: string[],
  setNewStoryInfo: (setStory: Object) => void,
  atChangeNewStoryInfo: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void,
  atCreateNewStory: (
    newStoryData: State,
    storiesData: State,
    categoriesData: State,
  ) => void,
};
const CreateNewStory: React.FC<CreateNewStoryProps> = (props) => {
  const {
    actions,
    atCreateNewStory,
    categories,
    newStory,
    setNewStoryInfo,
    atChangeNewStoryInfo,
    newStoryInfo,
    stories,
    nlu,
  } = props;

  const {
    onCreateExample,
    onCreateUserStep,
    onCreateBotStep,
    onRemoveUserStep,
  } = useCreateStoryStore((state: CreateStoryState) => {
    return {
      onCreateExample: state.onCreateExample,
      onDeleteExample: state.onDeleteExample,
      onRemoveUserStep: state.onRemoveUserStep,
      onCreateBotStep: state.onCreateBotStep,
      onCreateUserStep: state.onCreateUserStep,
    };
  }, shallow);
  // 步驟
  const [creactStoryStep, setcreactStoryStep] = React.useState('creactName');

  const [title, settitle] = React.useState('為你的劇本取名吧!');
  // 問句
  const [questionValue, setQuestionValue] = React.useState([
    { id: uuid(), question: '', error: '' },
    { id: uuid(), question: '', error: '' },
  ]);
  // 機器人回應
  const [botValue, setbotValue] = React.useState([
    { id: uuid(), reply: '', error: '' },
  ]);
  // next step
  const nextStep = React.useCallback(
    (stepName: string) => {
      if (stepName === 'creactName') {
        atCreateNewStory(newStoryInfo, stories, categories);
        setcreactStoryStep('creactQuestion');
        settitle('用戶問句');
      }
      if (stepName === 'creactQuestion') {
        questionValue.map((item, idx) => {
          console.log('questionValue item ===> ', item);
          if (idx === 0) {
            onCreateUserStep(item.question);
          } else {
            onCreateExample(
              newStory.story,
              item.question,
              [],
              newStory.story,
              nlu,
            );
          }
        });
        setcreactStoryStep('creactBot');
        settitle('機器人回應');
      }
      if (stepName === 'creactBot') {
        botValue.map((item) => {
          console.log('botValue item ===> ', item);
          const actionName = randomBotResAction(actions);
          console.log('actionName ===> ', actionName);
          onCreateBotStep(actionName, item.reply);
        });
        setcreactStoryStep('creactTrain');
        settitle('啟動訓練');
      }
      if (stepName === 'creactTrain') {
        settitle('劇本名稱');
        setcreactStoryStep('creactName');
      }
    },
    [
      creactStoryStep,
      title,
      atCreateNewStory,
      newStoryInfo,
      newStory,
      stories,
      categories,
      nlu,
      questionValue,
      onCreateBotStep,
      actions,
      botValue,
    ],
  );
  // 上一步
  const previousStep = React.useCallback(
    (stepName: string) => {
      if (stepName === 'creactBot') {
        newStory.steps.map((step) => {
          const { intent, user } = step;
          onRemoveUserStep(intent, user);
        });
        settitle('用戶問句');
        setcreactStoryStep('creactQuestion');
      }
      if (stepName === 'creactQuestion') {
        settitle('劇本名稱');
        setcreactStoryStep('creactName');
      }
    },
    [
      newStory,
      creactStoryStep,
      title,
      atCreateNewStory,
      newStoryInfo,
      stories,
      categories,
      nlu,
      questionValue,
      onCreateBotStep,
      actions,
      botValue,
    ],
  );
  // 刪除用戶問句
  const deleteQuestion = React.useCallback(
    (id: string) => {
      setQuestionValue((prev) => prev.filter((item) => item.id !== id));
    },
    [questionValue],
  );

  // 用戶問句檢核更新
  const changeQuestion = React.useCallback(
    (id: string, question: string) => {
      let error = '';
      if (question === '') {
        error = '所有欄位都是必填的';
      } else {
        questionValue.map((item) => {
          return item.question === question
            ? (error = `例句『${question}』重複，請重新輸入`)
            : '';
        });
        nlu.rasa_nlu_data.common_examples.map((example) => {
          return example.text === question
            ? (error = `例句『${question}』重複，請重新輸入`)
            : '';
        });
      }

      const updatedQuestionValue = questionValue.map((item) => {
        if (item.id === id) {
          return { ...item, question, error };
        }
        return item;
      });
      setQuestionValue(updatedQuestionValue);
    },
    [setQuestionValue, questionValue, nlu],
  );
  // 創建用戶問句
  const CreactNewQuestion = React.useCallback(() => {
    let error = false;
    let errorName = '';
    questionValue.map((item) => {
      if (item.error.length > 0) {
        errorName = `欄位有誤檢查完再新增`;
        error = true;
      }
      console.log(item.question.length);
      if (item.question.length === 0) {
        errorName = `所有欄位都是必填的`;
        error = true;
      }
    });
    if (error === true) {
      Toast.fire({
        icon: 'warning',
        title: errorName,
        position: 'top-center',
      });
      return;
    }
    setQuestionValue((prev) => {
      const newList = prev.concat([{ id: uuid(), question: '', error: '' }]);
      return newList;
    });
  }, [setQuestionValue, questionValue]);
  // 用戶問句渲染
  const QuestionItems = questionValue.map((item, index) => (
    <div
      key={item.id}
      className={
        item.error.length > 0
          ? (style.storyInputBlock, style.error)
          : style.storyInputBlock
      }
    >
      <label htmlFor={`"Question${index + 1}"`}>問句{index + 1}</label>
      <div className={cx('d-flex flex-row')}>
        <input
          id={`"Question${index + 1}"`}
          className="form-control"
          type="text"
          onChange={(e) => changeQuestion(item.id, e.target.value)}
          placeholder={
            index === 0 ? '請輸入問句內容' : '請輸入與『 問句1 』相似意圖的句子'
          }
        />

        {questionValue.length > 2 && (
          <button className="btn" onClick={() => deleteQuestion(item.id)}>
            <img src={require('../../images/creactStory/Vector.png')} alt="" />
          </button>
        )}
      </div>
      {item.error.length > 0 && (
        <div className={style.errorMsg}>{item.error}</div>
      )}
    </div>
  ));
  // 刪除機器人回應
  const deleteBotReply = React.useCallback(
    (id: string) => {
      setbotValue((prev) => prev.filter((item) => item.id !== id));
    },
    [setbotValue],
  );
  const changeBotReply = React.useCallback(
    (id: string, reply: string) => {
      let error = '';
      if (reply === '') {
        error = '所有欄位都是必填的';
      }

      const updateBotReplyValue = botValue.map((item) => {
        if (item.id === id) {
          return { ...item, reply, error };
        }
        return item;
      });
      setbotValue(updateBotReplyValue);
    },
    [setbotValue, botValue],
  );
  // 創建機器人回應
  const CreactNewBotReply = React.useCallback(() => {
    let error = false;
    let errorName = '';
    botValue.map((item) => {
      if (item.error.length > 0) {
        errorName = `欄位有誤檢查完再新增`;
        error = true;
      }
      console.log(item.reply.length);
      if (item.reply.length === 0) {
        errorName = `所有欄位都是必填的`;
        error = true;
      }
    });
    if (error === true) {
      Toast.fire({
        icon: 'warning',
        title: errorName,
        position: 'top-center',
      });
      return;
    }
    setbotValue((prev) => {
      const newList = prev.concat([{ id: uuid(), reply: '', error: '' }]);
      return newList;
    });
  }, [setbotValue, botValue]);
  // 機器人回應渲染
  const BotReply = botValue.map((item, index) => (
    <div
      key={item.id}
      className={
        item.error.length > 0
          ? (style.storyInputBlock, style.error)
          : style.storyInputBlock
      }
    >
      <label htmlFor={`"botReply${index + 1}"`}>回應{index + 1}</label>
      <div className={cx('d-flex flex-row')}>
        <textarea
          id={`"botReply${index + 1}"`}
          className={cx('form-control', style.textarea)}
          type="text"
          onChange={(e) => changeBotReply(item.id, e.target.value)}
          placeholder="請輸入機器人回應"
        />

        {botValue.length > 1 && (
          <button className="btn" onClick={() => deleteBotReply(item.id)}>
            <img src={require('../../images/creactStory/Vector.png')} alt="" />
          </button>
        )}
      </div>
      {item.error.length > 0 && (
        <div className={style.errorMsg}>{item.error}</div>
      )}
    </div>
  ));

  return (
    <div>
      <div className={cx(style.creactStoryBlock)}>
        <div className={cx(style.creactStoryCloseBtn)}>
          <button
            type="button"
            onClick={() =>
              setNewStoryInfo({
                story: '',
                steps: [],
                metadata: { category: '', create: false },
              })
            }
          >
            ×
          </button>
        </div>
        <div className={cx(style.creactStoryStep)}>
          <span
            className={cx(
              creactStoryStep === 'creactName'
                ? [style.active, style.item]
                : style.item,
            )}
          >
            <span className={cx(style.itemIcon)} />
            <h6>劇本名稱</h6>
          </span>
          <span
            className={cx(
              creactStoryStep === 'creactQuestion'
                ? [style.active, style.item]
                : style.item,
            )}
          >
            <span className={cx(style.itemIcon)} />
            <h6>用戶問句</h6>
          </span>
          <span
            className={cx(
              creactStoryStep === 'creactBot'
                ? [style.active, style.item]
                : style.item,
            )}
          >
            <span className={cx(style.itemIcon)} />
            <h6>機器人回應</h6>
          </span>
          <span
            className={cx(
              creactStoryStep === 'creactTrain'
                ? [style.active, style.item]
                : style.item,
            )}
          >
            <span className={cx(style.itemIcon)} />
            <h6>啟動訓練</h6>
          </span>
        </div>
        <div className={cx(style.creactStoryTitle)}>
          <h3>{title}</h3>
        </div>
        <div className={cx(style.creactStoryFunction)}>
          {creactStoryStep === 'creactName' && (
            <>
              <div className={style.storyInputBlock}>
                <div>
                  <label htmlFor="storyName">名稱</label>
                </div>
                <div>
                  <input
                    className="form-control"
                    id="storyName"
                    name="story"
                    placeholder="請輸入劇本名稱"
                    value={newStoryInfo.story}
                    onChange={(e) => atChangeNewStoryInfo(e)}
                  />
                </div>
              </div>
              <div className={style.storyInputBlock}>
                <div>
                  <label htmlFor="category">劇本分類</label>
                </div>
                <div>
                  <select
                    className="form-control"
                    id="category"
                    name="category"
                    value={
                      newStoryInfo.metadata?.create
                        ? 'createNewCategory'
                        : newStoryInfo.metadata?.category
                    }
                    onChange={(e) => atChangeNewStoryInfo(e)}
                  >
                    <option value="" hidden>
                      請選擇故事類別
                    </option>
                    <option value="createNewCategory">建立新類別</option>
                    {categories?.map((category) => {
                      return (
                        <option
                          key={`${category.id}-${category.name}`}
                          value={category.name}
                        >
                          {category.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className={style.storyInputBlock}>
                {newStoryInfo.metadata?.create && (
                  <div className="mb-3">
                    <label htmlFor="newCategory" className="form-label">
                      類別名稱
                    </label>
                    <input
                      className="form-control"
                      id="newCategory"
                      name="newCategory"
                      placeholder="請輸入類別名稱"
                      value={newStoryInfo.metadata?.category}
                      onChange={(e) => atChangeNewStoryInfo(e)}
                    />
                  </div>
                )}
              </div>
            </>
          )}
          {creactStoryStep === 'creactQuestion' && (
            <>
              {QuestionItems}
              <div>
                <button
                  className={cx(style.moreBtn)}
                  onClick={() => CreactNewQuestion()}
                >
                  +新增更多問句
                </button>
              </div>
            </>
          )}
          {creactStoryStep === 'creactBot' && (
            <>
              {BotReply}
              <div>
                <button
                  className={cx(style.moreBtn)}
                  onClick={() => CreactNewBotReply()}
                >
                  +新增機器人回應
                </button>
              </div>
            </>
          )}
        </div>
        <div className={cx(style.creactStoryFunctionBtn)}>
          {creactStoryStep !== 'creactName' ? (
            <button onClick={() => previousStep(creactStoryStep)}>
              上一頁
            </button>
          ) : (
            <div />
          )}

          <button
            className={cx(style.stepBtn)}
            onClick={() => {
              nextStep(creactStoryStep);
            }}
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreateNewStory);
