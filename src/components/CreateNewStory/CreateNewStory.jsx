/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
/* eslint-disable no-return-assign */
import * as React from 'react';
import cx from 'classnames';
import type { State } from 'components/types';
import uuid from 'react-uuid';
import style from './CreateNewStory.module.scss';
import type { StoryType } from '../types';
import { Toast } from '../../utils/swalInput';

type CreateNewStoryProps = {
  newStory: StoryType,
  newStoryInfo: Object,
  categories: State,
  stories: State,
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
    atCreateNewStory,
    categories,
    newStory,
    setNewStoryInfo,
    atChangeNewStoryInfo,
    newStoryInfo,
    stories,
  } = props;
  const [creactStoryStep, setcreactStoryStep] = React.useState('creactName');
  const [title, settitle] = React.useState('為你的劇本取名吧!');

  // next step
  const ChangeStep = React.useCallback(
    (stepName: string) => {
      if (stepName === 'creactName') {
        atCreateNewStory(newStoryInfo, stories, categories);
        setcreactStoryStep('creactQuestion');
        settitle('用戶問句');
      }
      if (stepName === 'creactQuestion') {
        setcreactStoryStep('creactBot');
        settitle('機器人回應');
      }
      if (stepName === 'creactBot') {
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
    ],
  );
  const [QuestionValue, setQuestionValue] = React.useState([
    { id: uuid(), question: '', error: '' },
    { id: uuid(), question: '', error: '' },
  ]);
  // deleteInput
  const deleteQuestion = React.useCallback(
    (id: string) => {
      setQuestionValue((prev) => prev.filter((item) => item.id !== id));
    },
    [QuestionValue],
  );

  // writeStore
  const changeQuestion = React.useCallback(
    (id: string, question: string) => {
      let error = '';
      if (question === '') {
        error = '所有欄位都是必填的';
      } else {
        QuestionValue.map((item) => {
          return item.question === question
            ? (error = `代表值『${question}』的關鍵字重疊，請重新輸入`)
            : '';
        });
      }

      const updatedQuestionValue = QuestionValue.map((item) => {
        if (item.id === id) {
          return { ...item, question, error };
        }
        return item;
      });
      setQuestionValue(updatedQuestionValue);
    },
    [setQuestionValue, QuestionValue],
  );
  const listItems = QuestionValue.map((item, index) => (
    <div key={item.id}>
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

        {QuestionValue.length > 2 && (
          <button onClick={() => deleteQuestion(item.id)}>
            <img src={require('../../images/creactStory/Vector.png')} alt="" />
          </button>
        )}
      </div>
      {item.error.length > 0 && <div>{item.error}</div>}
    </div>
  ));
  const CreactNewQuestion = React.useCallback(() => {
    let error = false;
    let errorName = '';
    QuestionValue.map((item) => {
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
  }, [setQuestionValue, QuestionValue]);

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
          <h4>{title}</h4>
        </div>
        <div className={cx(style.creactStoryFunction)}>
          {creactStoryStep === 'creactName' && (
            <>
              <div>
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
              <div>
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
              <div>
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
              {listItems}
              <div>
                <button onClick={() => CreactNewQuestion()}>
                  +新增更多問句
                </button>
              </div>
            </>
          )}
        </div>
        <div className={cx(style.creactStoryFunctionBtn)}>
          <button
            onClick={() => {
              ChangeStep(creactStoryStep);
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
