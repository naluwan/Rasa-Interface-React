/* eslint-disable prefer-spread */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
/* eslint-disable no-return-assign */
import * as React from 'react';
import cx from 'classnames';
import type { State } from 'components/types';
import uuid from 'react-uuid';
import shallow from 'zustand/shallow';
import Select from 'react-select';
import style from './CreateNewStory.module.scss';
import type { StoryType, CreateStoryState, NluType } from '../types';
import { Toast } from '../../utils/swalInput';
import { randomBotResAction } from '../../utils/randomBotResAction';
import useCreateStoryStore from '../../store/useCreateStoryStore';

type CreateNewStoryProps = {
  mode: string,
  newStory: StoryType,
  newStoryInfo: Object,
  categories: State,
  setnowcreactStory: State,
  stories: State,
  nlu: NluType,
  actions: string[],
  onClickSaveBtn: (story: StoryType) => void,
  atSelectStory: (storyName: string) => void,
  setNewStoryInfo: (setStory: Object) => void,
  setNowMode: (setStory: string) => void,
  atChangeNewStoryInfo: (value: String, name: String) => void,
  atCreateNewStory: (
    newStoryData: State,
    storiesData: State,
    categoriesData: State,
  ) => void,
};

const CreateNewStory: React.FC<CreateNewStoryProps> = (props) => {
  const {
    mode,
    setnowcreactStory,
    actions,
    atSelectStory,
    setNowMode,
    atCreateNewStory,
    categories,
    newStory,
    setNewStoryInfo,
    atChangeNewStoryInfo,
    onClickSaveBtn,
    newStoryInfo,
    stories,
    nlu,
  } = props;

  const {
    onCreateExample,
    onCreateUserStep,
    onCreateBotStep,
    onRemoveBotStep,
    onInitialNewStory,
    onRemoveUserStep,
  } = useCreateStoryStore((state: CreateStoryState) => {
    return {
      onCreateExample: state.onCreateExample,
      onInitialNewStory: state.onInitialNewStory,
      onDeleteExample: state.onDeleteExample,
      onRemoveUserStep: state.onRemoveUserStep,
      onRemoveBotStep: state.onRemoveBotStep,
      onCreateBotStep: state.onCreateBotStep,
      onCreateUserStep: state.onCreateUserStep,
    };
  }, shallow);

  // 步驟
  const [creactStoryStep, setcreactStoryStep] = React.useState('creactName');

  const [title, settitle] = React.useState('為你的劇本取名吧!');
  const [storeName, setstoreName] = React.useState({
    id: uuid(),
    name: '',
    error: '',
  });
  const [TypeStoreName, setTypeStoreName] = React.useState({
    id: uuid(),
    name: '',
    error: '',
  });

  const categoriesOption = [].concat.apply(
    [],
    categories?.map((category, index) => {
      if (index === 0) {
        const a = [
          { value: 'createNewCategory', label: '建立新類別' },
          { value: category.name, label: category.name },
        ];
        const [b, c] = a;
        return [b, c];
      }

      return { value: category.name, label: category.name };
    }),
  );
  console.log(categoriesOption);
  // 劇本名稱更新
  const changeStoreName = React.useCallback(
    (Name: string) => {
      console.log(Name);
      let error = '';
      if (Name === '' || Name === undefined) {
        error = '所有欄位都是必填的';
      } else {
        stories.map((item) => {
          return item.story === Name
            ? (error = `故事『${Name}』重複，請重新輸入`)
            : '';
        });
      }
      const { id } = storeName;
      const updateStoreNameValue = { id, name: Name, error };
      setstoreName(updateStoreNameValue);
    },
    [stories, storeName, setstoreName],
  );
  // 類別名稱更新
  const changeTypeStoreName = React.useCallback(
    (Name: string) => {
      let error = '';
      if (Name === '' || Name === undefined) {
        error = '所有欄位都是必填的';
      } else {
        categories.map((item) => {
          return item.name === Name
            ? (error = `故事『${Name}』重複，請重新輸入`)
            : '';
        });
      }
      const { id } = TypeStoreName;
      const updateTypeNameValue = { id, name: Name, error };
      setTypeStoreName(updateTypeNameValue);
    },
    [categories, TypeStoreName, setTypeStoreName],
  );
  // 問句
  const [questionValue, setQuestionValue] = React.useState([
    { id: uuid(), question: '', error: '' },
    { id: uuid(), question: '', error: '' },
  ]);

  // 機器人回應
  const [botValue, setbotValue] = React.useState([
    { id: uuid(), reply: '', error: '' },
  ]);
  // textarea 自適應高度
  const textAreaRef = React.useRef();
  React.useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style = 'height:0px';
      const a = textAreaRef.current.value;
      textAreaRef.current.value = a;
      textAreaRef.current.style = `height: ${
        textAreaRef.current.scrollHeight + 9
      }px`;
    }
  }, [textAreaRef.current?.value]);

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
      console.log(id);
      console.log(question);
      if (question === '') {
        error = '所有欄位都是必填的';
      } else {
        questionValue.map((item) => {
          return item.question === question && item.id !== id
            ? (error = `例句『${question}』重複，請重新輸入`)
            : '';
        });
        nlu.rasa_nlu_data.common_examples.map((example) => {
          return example.text === question
            ? (error = `例句『${question}』重複，請重新輸入`)
            : '';
        });
      }
      console.log(questionValue);
      const updatedQuestionValue = questionValue.map((item) => {
        if (item.id === id) {
          return { ...item, question, error };
        }
        return item;
      });

      console.log(updatedQuestionValue);
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
          className={cx(style.formStyle)}
          type="text"
          onChange={(e) => changeQuestion(item.id, e.target.value)}
          value={item.question}
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
          className={cx(style.formStyle, style.textarea)}
          rows="1"
          ref={textAreaRef}
          type="text"
          onChange={(e) => changeBotReply(item.id, e.target.value)}
          placeholder="請輸入機器人回應"
          value={item.reply}
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
  // next step
  const nextStep = React.useCallback(
    (stepName: string, modename: string) => {
      console.log(storeName.Name);
      let stepError = '';
      if (modename === 'Base') {
        if (stepName === 'creactName') {
          // console.log(storeName.Name);
          changeStoreName(storeName.Name);
          if (
            storeName.error.length > 0 ||
            storeName.name.length === undefined ||
            storeName.name.length === 0 ||
            TypeStoreName.error.length > 0 ||
            TypeStoreName.name.length === undefined
          ) {
            stepError = 'error';
          }
          if (stepError !== 'error') {
            atCreateNewStory(newStoryInfo, stories, categories);
            setcreactStoryStep('creactQuestion');
            settitle('用戶問句');
          }
        }
        if (stepName === 'creactQuestion') {
          CreactNewQuestion();
          questionValue.map((item, idx) => {
            if (
              item.error.length > 0 ||
              item.question === undefined ||
              item.question.length === 0
            ) {
              stepError = 'error';
            } else if (idx === 0) {
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
          if (stepError !== 'error') {
            setcreactStoryStep('creactBot');
            settitle('機器人回應');
          }
        }
        if (stepName === 'creactBot') {
          botValue.map((item) => {
            console.log('botValue item ===> ', item);
            const actionName = randomBotResAction(actions);
            console.log('actionName ===> ', actionName);
            onCreateBotStep(actionName, item.reply);
          });
          if (stepError !== 'error') {
            setcreactStoryStep('creactTrain');
            settitle('');
          }
        }
        if (stepName === 'creactTrain') {
          settitle('劇本名稱');
          setcreactStoryStep('creactName');
        }
      }
      if (modename === 'Advanced') {
        if (stepName === 'creactName') {
          changeStoreName(storeName.Name);
          if (
            storeName.error.length > 0 ||
            storeName.name.length === undefined ||
            storeName.name.length === 0 ||
            TypeStoreName.error.length > 0 ||
            TypeStoreName.name.length === undefined
          ) {
            stepError = 'error';
          }
          if (stepError !== 'error') {
            atCreateNewStory(newStoryInfo, stories, categories);
            setcreactStoryStep('creactQuestion');
            settitle('用戶問句');
          }
        }
        if (stepName === 'creactQuestion') {
          CreactNewQuestion();
          questionValue.map((item, idx) => {
            if (
              item.error.length > 0 ||
              item.question === undefined ||
              item.question.length === 0
            ) {
              stepError = 'error';
            } else if (idx === 0) {
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
          if (stepError !== 'error') {
            setcreactStoryStep('creactBot');
            settitle('機器人回應');
          }
        }
        if (stepName === 'creactkeywords') {
          CreactNewQuestion();
          questionValue.map((item, idx) => {
            if (
              item.error.length > 0 ||
              item.question === undefined ||
              item.question.length === 0
            ) {
              stepError = 'error';
            } else if (idx === 0) {
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
          if (stepError !== 'error') {
            setcreactStoryStep('creactBot');
            settitle('機器人回應');
          }
        }
        if (stepName === 'creactBot') {
          botValue.map((item) => {
            console.log('botValue item ===> ', item);
            const actionName = randomBotResAction(actions);
            console.log('actionName ===> ', actionName);
            onCreateBotStep(actionName, item.reply);
          });
          if (stepError !== 'error') {
            setcreactStoryStep('creactTrain');
            settitle('');
          }
        }
        if (stepName === 'creactTrain') {
          settitle('劇本名稱');
          setcreactStoryStep('creactName');
        }
      }
    },
    [
      creactStoryStep,
      title,
      CreactNewQuestion,
      setQuestionValue,
      changeStoreName,
      atCreateNewStory,
      storeName,
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
      if (stepName === 'creactTrain') {
        newStory.steps.map((step) => {
          const { action } = step;
          if (action) {
            onRemoveBotStep(action);
          }
        });
        // setbotValue([{ id: uuid(), reply: '', error: '' }]);
        settitle('機器人回應');
        setcreactStoryStep('creactBot');
      }
      if (stepName === 'creactBot') {
        newStory.steps.map((step) => {
          const { intent, user } = step;
          onRemoveUserStep(intent, user);
        });
        // setQuestionValue([
        //   { id: uuid(), question: '', error: '' },
        //   { id: uuid(), question: '', error: '' },
        // ]);
        settitle('用戶問句');
        setcreactStoryStep('creactQuestion');
      }
      if (stepName === 'creactQuestion') {
        // onInitialNewStory();
        // setNewStoryInfo({
        //   story: '',
        //   steps: [],
        //   metadata: { category: '', create: false },
        // });
        settitle('劇本名稱');
        setcreactStoryStep('creactName');
      }
    },
    [
      setbotValue,
      setbotValue,
      setQuestionValue,
      setNewStoryInfo,
      onRemoveUserStep,
      onRemoveBotStep,
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

  return (
    <div className={cx(style.root)}>
      <div className={cx(style.creactStoryBlock)}>
        <div className={cx('swal2-show', style.creactStoryBorder)}>
          {creactStoryStep !== 'creactTrain' && (
            <>
              <div className={cx(style.creactStoryCloseBtn)}>
                <button
                  type="button"
                  onClick={() => {
                    setNewStoryInfo({
                      story: '',
                      steps: [],
                      metadata: { category: '', create: false },
                    });
                    setnowcreactStory('');
                  }}
                >
                  ×
                </button>
              </div>
              <div className={cx(style.creactStoryStep)}>
                {mode === 'Base' && (
                  <>
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
                  </>
                )}

                {mode === 'Advanced' && (
                  <>
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
                        creactStoryStep === 'creactkeywords'
                          ? [style.active, style.item]
                          : style.item,
                      )}
                    >
                      <span className={cx(style.itemIcon)} />
                      <h6>關鍵字設定</h6>
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
                  </>
                )}
              </div>
              <div className={cx(style.creactStoryTitle)}>
                <h3>{title}</h3>
              </div>
            </>
          )}
          {creactStoryStep === 'creactTrain' && (
            <div>
              <img
                src={require('../../images/creactStory/success.png')}
                alt=""
              />
            </div>
          )}
          <div className={cx(style.creactStoryFunction)}>
            {creactStoryStep === 'creactName' && (
              <>
                <div
                  className={
                    storeName.error.length > 0
                      ? (style.storyInputBlock, style.error)
                      : style.storyInputBlock
                  }
                >
                  <div>
                    <label htmlFor="storyName">名稱</label>
                  </div>
                  <div>
                    <input
                      className={cx(style.formStyle)}
                      id="storyName"
                      name="story"
                      placeholder="請輸入劇本名稱"
                      value={storeName.name}
                      onChange={(e) => {
                        console.log(e);
                        changeStoreName(e.target.value);
                        atChangeNewStoryInfo(e.target.value, 'story');
                      }}
                    />
                  </div>
                  {storeName.error.length > 0 && (
                    <div className={style.errorMsg}>{storeName.error}</div>
                  )}
                </div>
                <div className={style.storyInputBlock}>
                  <div>
                    <label htmlFor="category">劇本分類</label>
                  </div>
                  <div>
                    <Select
                      id="category"
                      name="category"
                      onChange={(e) =>
                        atChangeNewStoryInfo(e.value, 'category')
                      }
                      options={categoriesOption}
                      menuPlacement="bottom"
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                      menuPortalTarget={document.querySelector('body')}
                    />
                  </div>
                </div>
                <div
                  className={
                    TypeStoreName.error.length > 0
                      ? (style.storyInputBlock, style.error)
                      : style.storyInputBlock
                  }
                >
                  {newStoryInfo.metadata?.create && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="newCategory" className="form-label">
                          類別名稱
                        </label>
                        <input
                          className={cx(style.formStyle)}
                          id="newCategory"
                          name="newCategory"
                          placeholder="請輸入類別名稱"
                          value={newStoryInfo.metadata?.category}
                          onChange={(e) => {
                            atChangeNewStoryInfo(e.target.value, 'newCategory');
                            changeTypeStoreName(e.target.value);
                          }}
                        />
                      </div>
                      {TypeStoreName.error.length > 0 && (
                        <div className={style.errorMsg}>
                          {TypeStoreName.error}
                        </div>
                      )}
                    </>
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
            {creactStoryStep === 'creactTrain' && (
              <div>
                <div>
                  <h2>恭喜!</h2>
                </div>
                <div>
                  <h5>
                    劇本創建完成後可點擊 『 啟動訓練 』<br />
                    開始訓練您的專屬機器人吧！
                  </h5>
                </div>
              </div>
            )}
          </div>
          <div className={cx(style.creactStoryFunctionBtn)}>
            {creactStoryStep !== 'creactName' ? (
              <button
                className={cx(style.prevstepBtn)}
                onClick={() => previousStep(creactStoryStep)}
              >
                上一步
              </button>
            ) : (
              <div />
            )}
            {creactStoryStep !== 'creactTrain' && (
              <button
                className={cx(style.stepBtn)}
                onClick={() => {
                  nextStep(creactStoryStep, mode);
                }}
              >
                下一步
              </button>
            )}

            {creactStoryStep === 'creactTrain' && (
              <button
                onClick={() => {
                  onClickSaveBtn(newStory);
                  setNowMode('storeChid');
                  atSelectStory('storeName');
                  setbotValue([{ id: uuid(), reply: '', error: '' }]);
                  setQuestionValue([
                    { id: uuid(), question: '', error: '' },
                    { id: uuid(), question: '', error: '' },
                  ]);
                  onInitialNewStory();
                  setNewStoryInfo({
                    story: '',
                    steps: [],
                    metadata: { category: '', create: false },
                  });
                  settitle('劇本名稱');
                  setcreactStoryStep('creactName');
                  setnowcreactStory('');
                }}
                className={cx(
                  style.creactStoryFunctionBtnFinish,
                  style.stepBtn,
                )}
              >
                劇本創建完成
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreateNewStory);
