/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-spread */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
/* eslint-disable no-return-assign */
import * as React from 'react';
import { KeyboardEventHandler } from 'react';
import cx from 'classnames';
import type { State } from 'components/types';
import uuid from 'react-uuid';
import shallow from 'zustand/shallow';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
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
  slots: { key: string, slotInfo: { type: string, values?: string[] } }[],
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
    setNowMode,
    atCreateNewStory,
    categories,
    slots,
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
    onRemoveUserStep,
  } = useCreateStoryStore((state: CreateStoryState) => {
    return {
      onCreateExample: state.onCreateExample,
      onDeleteExample: state.onDeleteExample,
      onRemoveUserStep: state.onRemoveUserStep,
      onRemoveBotStep: state.onRemoveBotStep,
      onCreateBotStep: state.onCreateBotStep,
      onCreateUserStep: state.onCreateUserStep,
    };
  }, shallow);

  // 步驟 State5
  const [creactStoryStep, setcreactStoryStep] = React.useState('creactName');
  // 標題 State6
  const [title, settitle] = React.useState('為你的劇本取名吧!');
  // 劇本名稱 State7
  const [storeName, setstoreName] = React.useState({
    id: uuid(),
    name: '',
    error: '',
  });
  // 類別名稱 State8
  const [TypeStoreName, setTypeStoreName] = React.useState({
    id: uuid(),
    name: '',
    error: '',
  });
  // 類別所有選項 State9
  const [options, setOptions] = React.useState([
    { value: 'createNewCategory', label: '建立新類別' },
  ]);
  // 用戶問句 State10
  const [questionValue, setQuestionValue] = React.useState([
    { id: uuid(), question: '', error: '' },
    { id: uuid(), question: '', error: '' },
  ]);
  // 關鍵字資料(選擇用戶問句) State11
  const [keywordOption, setkeywordOption] = React.useState([]);

  // 關鍵字類別 State12
  const [keywordType] = React.useState([]);

  // 當前關鍵字 State13
  const [nowkeyword, setnowkeyword] = React.useState({ value: '', error: '' });

  // 語句庫子選項 State14
  const [slotChild, setslotChild] = React.useState();
  // 同義詞分類 State15
  const [Identifier, setIdentifier] = React.useState([]);

  // 語句庫子選項已選項目 State16
  const [nowSlotChild, setnowSlotChild] = React.useState();
  // 語句庫分類已選項目 State17
  const [nowSentenceTypeOption, setnowSentenceTypeOption] = React.useState([]);

  // 語句庫分類 State18
  const [SentenceTypeOption, setSentenceTypeOption] = React.useState();
  const [inputValue, setInputValue] = React.useState('');
  React.useEffect(() => {
    categories?.map((category) => {
      setOptions((prev) => {
        const newOptions = prev.concat([
          { value: category.name, label: category.name },
        ]);
        return newOptions;
      });
    });
  }, [categories]);
  // 共用標籤同義詞21
  const [allLabel, setallLabel] = React.useState();
  // 統一關鍵字設定
  const [allleywordStep, setallleywordStep] = React.useState();
  const [dataCheckValue, setdataCheckValue] = React.useState();
  // 機器人回應 State19
  const [botValue, setbotValue] = React.useState([
    { id: uuid(), reply: '', error: '' },
  ]);
  // 劇本名稱更新
  const changeStoreName = React.useCallback(
    (Name: string) => {
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

  // 檢查關鍵字是否包含當前問句
  const checkKeyword = React.useCallback(
    (e) => {
      // 取得當前問句
      const nowquestion = keywordOption.map((item) => {
        return item.check === 'true' && item.name;
      });
      const matched = nowquestion.some((word) => {
        if (typeof word !== 'string') {
          return false;
        }
        return word.includes(e);
      });
      console.log(e);
      if (matched && e.length >= 2) {
        setnowkeyword({ value: e, error: '' });
      } else {
        if (e.length < 2) {
          setnowkeyword({
            value: '',
            error: `"${e}" 字數必須大於2`,
          });
          return matched;
        }
        setnowkeyword({
          value: '',
          error: `"${e}" 不符合關鍵字`,
        });
      }
      return matched;
    },
    [keywordOption],
  );

  // 載入關鍵字資料
  const loadkeywordOption = React.useCallback(
    (e: String) => {
      const updatekeywordOption = questionValue.map((item) => {
        if (item.question === e) {
          return {
            id: uuid(),
            name: item.question,
            check: 'true',
            slotType: 1,
          };
        }
        return {
          id: uuid(),
          name: item.question,
          check: 'false',
          slotType: 1,
        };
      });
      const dataCheckValues = keywordOption.find(
        (ko) => ko.name === e && ko.check === 'true',
      )
        ? e
        : '';
      setdataCheckValue(dataCheckValues);
      setkeywordOption(updatekeywordOption);
    },
    [keywordOption, setkeywordOption, dataCheckValue, setdataCheckValue],
  );
  function removeDuplicates(array) {
    const seen = {}; // create an empty object to store the seen property values
    return array.filter((element) => {
      // filter the array of objects
      const property = element.value; // get the property value of each object
      if (seen[property]) {
        // if the property value has been seen before
        return false; // exclude the object from the new array
      }
      // if the property value has not been seen before
      seen[property] = true; // mark it as seen
      return true; // include the object in the new array
    });
  }
  // 儲存關鍵字
  const saveKeyword = React.useCallback(
    (keywordQuestion) => {
      // 檢查是否有填完關鍵字
      // 儲存共用標籤
      let keyType = '';
      keyType = nowSentenceTypeOption.toString();
      let savealllabel = '';
      savealllabel = { [keyType]: Identifier }; // 當前同義字資料

      // 更新狀態
      console.log(typeof allLabel);
      if (allLabel === undefined) {
        setallLabel([savealllabel]);
      } else {
        let noMergedlabel = '';
        noMergedlabel = [allLabel[0], savealllabel];
        let mergedLabel = '';
        mergedLabel = [savealllabel]; // 用來儲存合併後的陣列
        let seen = '';
        seen = {}; // 用來記錄已經出現過的物件
        noMergedlabel.map((obj) => {
          // 對每個物件進行迴圈
          const key = Object.keys(obj)[0]; // 取得物件的第一個鍵，例如"地點"或"職缺"
          const value = obj[key]; // 取得物件的第一個值，例如陣列或字串
          if (seen[key]) {
            // 如果已經出現過這個鍵，就將值合併到已存在的物件中
            seen[key] = seen[key].concat(value);
          } else {
            // 如果沒有出現過這個鍵，就將物件加入到合併後的陣列中，並記錄到seen中
            mergedLabel.push(obj);
            seen[key] = value;
          }
        });
        const atlast = (() => {
          return removeDuplicates(mergedLabel);
        })();
        console.log(atlast);
        setallLabel(atlast);
      }
      // keywordQuestion 例句
      // nowkeyword.value 關鍵字
      const start = keywordQuestion.indexOf(nowkeyword.value);
      const end = start + nowkeyword.value.length;

      const examplesValue = Identifier.flatMap((item) =>
        item.data.map((dataItem) => ({
          entities: [
            {
              start,
              end: start + dataItem.label.length,
              value: item.label,
            },
          ],
          intent: storeName.name,
          text:
            keywordQuestion.slice(0, start) +
            dataItem.label +
            keywordQuestion.slice(end),
        })),
      );
      // 關鍵字抓start end
      const step = [
        {
          user: keywordQuestion, // 使用者問句
          intent: storeName.name, // 故事名稱

          // 標籤
          entities: [
            {
              end,
              entity: nowSentenceTypeOption.toString(), // 語句庫分類
              start,
              // value: '新竹', // 標籤
            },
          ],
          // 使用者例句
          examples: examplesValue,
          // 故事分類
          // metadata: {
          //   category: '測試',
          // },
        },
      ];
      setallleywordStep(step);
      console.log('step資料');
      console.log(step);
      console.log(allleywordStep);
      console.log('ok!');
    },
    [
      nowkeyword,
      Identifier,
      storeName,
      setallLabel,
      allLabel,
      nowSentenceTypeOption,
      allleywordStep,
      setallleywordStep,
    ],
  );

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
      className={item.error.length > 0 ? cx(style.error) : undefined}
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

  React.useEffect(() => {
    if (nowSlotChild === undefined) {
      setIdentifier([]);
      return;
    }
    const b = nowSlotChild?.map((item) => {
      const matchedItem = Identifier?.find(
        (aItem) => aItem.label === item.label,
      );
      const updatedA = {
        ...item,
        id: uuid(),
        data: matchedItem?.data ?? [],
        oninput: '',
      };
      return updatedA;
    });
    setIdentifier(b);
  }, [nowSlotChild]);
  // 設定語句褲子選項
  const changeSlotChild = React.useCallback(
    (e: any) => {
      setnowSlotChild(e);
    },
    [setnowSlotChild, nowSlotChild],
  );

  React.useEffect(() => {
    const slotsOption = slots
      .map((item) => {
        if (item.slotInfo.type !== 'text') {
          return { value: item.key, label: item.key };
        }
        return undefined;
      })
      .filter((item) => item !== undefined);
    setSentenceTypeOption(slotsOption);
  }, [slots]);

  // 語句庫分類選擇

  const changeSentenceTypeOption = React.useCallback(
    (obj: any) => {
      setslotChild(undefined);
      if (obj === null) {
        setnowSentenceTypeOption([]);
        setslotChild([
          [
            {
              value: '沒有選項',
              label: '沒有選項',
              isDisabled: true,
            },
          ],
        ]);
        return;
      }
      // 判斷是包含再以新增的語句庫分類
      const result = !slots.some((slot) => {
        return slot.key === obj.value;
      });
      if (result) {
        setnowSentenceTypeOption([obj.value]);
        setslotChild([
          [
            {
              value: '沒有選項',
              label: '沒有選項',
              isDisabled: true,
            },
          ],
        ]);
        return;
      }
      setnowSentenceTypeOption([obj.value]);
      const slotsChild = slots
        .map(({ key, slotInfo }) =>
          key === obj.value
            ? slotInfo.values?.map((values) => ({
                value: values,
                label: values,
              }))
            : null,
        )
        .filter(Boolean);
      setslotChild(slotsChild);
    },
    [slotChild, setslotChild, slots, setnowSentenceTypeOption],
  );
  React.useEffect(() => {
    if (nowSentenceTypeOption.length === 0) {
      setslotChild(undefined);
      setIdentifier([]);
    }
  }, [nowSentenceTypeOption]);
  // 同義字處理

  const changeIdentifier = React.useCallback(
    (e: any, Identifiers: string, type: string) => {
      setInputValue(e);
      let newIdentifier = '';
      if (type === 'onChange') {
        newIdentifier = Identifier?.map((item) => {
          if (item.label === Identifiers) {
            return { ...item, data: e, oninput: e };
          }
          return item;
        });
      }
      if (type === 'onInputChange') {
        newIdentifier = Identifier?.map((item) => {
          if (item.label === Identifiers) {
            return { ...item, oninput: e };
          }
          return item;
        });
      }
      setIdentifier(newIdentifier);
    },
    [setIdentifier, Identifier, setInputValue, inputValue],
  );

  const components = {
    DropdownIndicator: null,
  };

  const createOption = (label: string) => ({
    label,
    value: label,
  });

  const handleKeyDown: KeyboardEventHandler = React.useCallback(
    (event, Identifiers) => {
      const newIdentifier = Identifier.map((item) => {
        if (item.label === Identifiers) {
          return {
            ...item,
            id: uuid(),
            data: [...item.data, createOption(inputValue)],
            oninput: '',
          };
        }
        return item;
      });
      if (!inputValue) return;
      switch (event.key) {
        case 'Enter':
        case 'Tab':
          setIdentifier(newIdentifier);
          setInputValue('');
          event.preventDefault();
          break;
        default:
          break;
      }
    },
    [setIdentifier, setInputValue, inputValue],
  );

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
      let stepError = '';
      if (modename === 'Base') {
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
            atCreateNewStory(newStoryInfo, stories, slots);
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
            const actionName = randomBotResAction(actions);
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
          changeStoreName(storeName.name);
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
          // CreactNewQuestion();
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
            setcreactStoryStep('creactkeywords');
            settitle('');
          }
        }
        if (stepName === 'creactkeywords') {
          // CreactNewQuestion();
          // questionValue.map((item, idx) => {
          //   if (
          //     item.error.length > 0 ||
          //     item.question === undefined ||
          //     item.question.length === 0
          //   ) {
          //     stepError = 'error';
          //   } else if (idx === 0) {
          //     onCreateUserStep(item.question);
          //   } else {
          //     onCreateExample(
          //       newStory.story,
          //       item.question,
          //       [],
          //       newStory.story,
          //       nlu,
          //     );
          //   }
          // });
          if (stepError !== 'error') {
            setcreactStoryStep('creactBot');
            settitle('機器人回應');
          }
        }
        if (stepName === 'creactBot') {
          botValue.map((item) => {
            const actionName = randomBotResAction(actions);
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
    (stepName: string, modename: string) => {
      if (modename === 'Base') {
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
      }
      if (modename === 'Advanced') {
        if (stepName === 'creactTrain') {
          newStory.steps.map((step) => {
            const { action } = step;
            if (action) {
              onRemoveBotStep(action);
            }
          });
          // setbotValue([{ id: uuid(), reply: '', error: '' }]);
          settitle('');
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
          settitle('');
          setcreactStoryStep('creactkeywords');
        }
        if (stepName === 'creactkeywords') {
          newStory.steps.map((step) => {
            const { action } = step;
            if (action) {
              onRemoveBotStep(action);
            }
          });
          // setbotValue([{ id: uuid(), reply: '', error: '' }]);
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
              <div className={cx(title.length > 0 && style.creactStoryTitle)}>
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
          <div
            className={
              creactStoryStep === 'creactkeywords'
                ? cx(style.creactStoryFunction, 'p-0 pt-4 pb-4')
                : cx(style.creactStoryFunction)
            }
          >
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
                      options={options}
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
            {creactStoryStep === 'creactkeywords' && (
              <div className="container">
                <div className="row">
                  <div className={cx('col-6', style.choiceQuestionSentence)}>
                    <div className={cx(style.creactStoryTitle)}>
                      <h3>選擇問句</h3>
                    </div>
                    {questionValue.map((item) => {
                      return (
                        <div key={`${item.id}`}>
                          <label
                            data-check={dataCheckValue === item.question}
                            data-slot="false"
                            onClick={() => loadkeywordOption(item.question)}
                            className={cx(style.customCheckbox)}
                            htmlFor={item.id}
                          >
                            <input
                              id={item.id}
                              name="creactkeywords"
                              type="radio"
                            />
                            <span name="checkIcon" data-foo={item.question} />
                            <span name="checkItem">
                              <img
                                src={require('../../images/creactStory/bi_exclamation-circle-fill.png')}
                                alt=""
                              />
                            </span>
                          </label>
                        </div>
                      );
                    })}
                    <div
                      className={cx(
                        style.creactStoryFunctionBtn,
                        style.creactkeywordsStep,
                      )}
                    >
                      <button
                        className={cx(style.prevstepBtn)}
                        onClick={() => previousStep(creactStoryStep, mode)}
                      >
                        上一步
                      </button>
                      <button
                        className={cx(style.stepBtn)}
                        onClick={() => {
                          nextStep(creactStoryStep, mode);
                        }}
                      >
                        下一步
                      </button>
                    </div>
                  </div>
                  <div className="col-6">
                    {keywordOption && (
                      <div className={style.setKeyWordBlock}>
                        <div>
                          <div>
                            {keywordOption.map((item) => {
                              return (
                                item.check === 'true' && (
                                  <div key={`${item.id}`}>
                                    <div className={cx(style.questionBlock)}>
                                      <h3>{item.name}</h3>
                                      <button
                                        className="btn"
                                        // onClick={() => deleteQuestion(item.id)}
                                      >
                                        <img
                                          src={require('../../images/creactStory/edit_icon.png')}
                                          alt=""
                                        />
                                      </button>
                                    </div>
                                    <div
                                      className={
                                        nowkeyword.error.length > 0
                                          ? (style.storyInputBlock, style.error)
                                          : style.storyInputBlock
                                      }
                                    >
                                      <div
                                        name="now"
                                        className={
                                          nowkeyword.value.length > 0
                                            ? style.keywordBtn
                                            : undefined
                                        }
                                      >
                                        {nowkeyword.value.length > 0 && (
                                          <img
                                            src={require('../../images/creactStory/exclamation.png')}
                                            alt=""
                                          />
                                        )}

                                        {nowkeyword.value}
                                      </div>
                                      {keywordType.map((itm) => {
                                        return (
                                          <div
                                            name="other"
                                            key={`${itm.value}`}
                                            className={style.keywordBtn}
                                          >
                                            {itm.value}
                                          </div>
                                        );
                                      })}
                                      <button
                                        name="add"
                                        className={style.keywordBtn}
                                      >
                                        + 新增關鍵字
                                      </button>
                                    </div>
                                    <div
                                      className={
                                        nowkeyword.error.length > 0
                                          ? (style.storyInputBlock, style.error)
                                          : style.storyInputBlock
                                      }
                                    >
                                      <label htmlFor={`keyword${item.id}`}>
                                        關鍵字{item.slotType}
                                      </label>
                                      <input
                                        className={cx(style.formStyle)}
                                        id={`keyword${item.id}`}
                                        placeholder={`請輸入『${item.name}』關鍵字`}
                                        onChange={(e) => {
                                          checkKeyword(e.target.value);
                                        }}
                                        type="text"
                                      />
                                      {nowkeyword.error.length > 0 && (
                                        <div className={style.errorMsg}>
                                          {nowkeyword.error}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <label htmlFor="SentenceType">
                                        語句庫分類
                                      </label>
                                      <CreatableSelect
                                        isClearable
                                        id="SentenceType"
                                        name="SentenceType"
                                        placeholder="輸入即可新增語句庫分類"
                                        onChange={(e) =>
                                          changeSentenceTypeOption(e)
                                        }
                                        options={SentenceTypeOption}
                                        menuPlacement="bottom"
                                        styles={{
                                          menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                          }),
                                        }}
                                        menuPortalTarget={document.querySelector(
                                          'body',
                                        )}
                                      />
                                    </div>
                                    <div>
                                      {slotChild && (
                                        <>
                                          <label
                                            key={`label${nowSentenceTypeOption}`}
                                            htmlFor="Selectlabel"
                                          >
                                            標籤
                                          </label>
                                          <CreatableSelect
                                            key={`select${nowSentenceTypeOption}`}
                                            isMulti
                                            id="Selectlabel"
                                            placeholder="輸入即可新增標籤"
                                            name="Selectlabel"
                                            options={slotChild[0]}
                                            onChange={(e) => {
                                              changeSlotChild(e);
                                            }}
                                            menuPlacement="bottom"
                                            styles={{
                                              menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                              }),
                                            }}
                                            menuPortalTarget={document.querySelector(
                                              'body',
                                            )}
                                          />
                                        </>
                                      )}
                                    </div>
                                    {/* <button>
                                      <h4>進階設定</h4>
                                    </button> */}
                                    {Identifier.length > 0 &&
                                      nowSlotChild &&
                                      slotChild && (
                                        <>
                                          <div>同義詞設定</div>
                                          {nowSlotChild?.map((resemblance) => {
                                            return (
                                              <div
                                                key={resemblance.id}
                                                className="row"
                                              >
                                                <div className="col-5">
                                                  <div>
                                                    <label htmlFor="">
                                                      標籤
                                                    </label>
                                                  </div>
                                                  <div
                                                    key={`resemblance${resemblance.id}`}
                                                    className={cx(
                                                      style.formStyle,
                                                    )}
                                                  >
                                                    {resemblance.value}
                                                  </div>
                                                </div>
                                                <div className="col-7">
                                                  <div>
                                                    <label htmlFor="">
                                                      同義詞
                                                    </label>
                                                  </div>
                                                  <div>
                                                    <CreatableSelect
                                                      key={`ss${resemblance.id}`}
                                                      components={components}
                                                      inputValue={
                                                        Identifier?.find(
                                                          (obj) =>
                                                            obj.label ===
                                                            resemblance.value,
                                                        )?.oninput ?? ''
                                                      }
                                                      isClearable
                                                      isMulti
                                                      menuIsOpen={false}
                                                      onChange={(newValue) => {
                                                        let a = '';
                                                        a = newValue.filter(
                                                          (nv) =>
                                                            nv.length !== 0,
                                                        );

                                                        changeIdentifier(
                                                          a,
                                                          resemblance.value,
                                                          'onChange',
                                                        );
                                                      }}
                                                      onInputChange={(
                                                        newValue,
                                                      ) => {
                                                        changeIdentifier(
                                                          newValue,
                                                          resemblance.value,
                                                          'onInputChange',
                                                        );
                                                      }}
                                                      onKeyDown={(e) => {
                                                        handleKeyDown(
                                                          e,
                                                          resemblance.value,
                                                        );
                                                      }}
                                                      value={
                                                        Identifier?.find(
                                                          (obj) =>
                                                            obj.label ===
                                                            resemblance.value,
                                                        )?.data ?? ''
                                                      }
                                                      placeholder={`請輸入${resemblance.value}的同義詞`}
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                          <div
                                            className={cx(
                                              style.saveBlock,
                                              'mt-2',
                                            )}
                                          >
                                            <button
                                              className={cx(style.stepBtn)}
                                            >
                                              取消
                                            </button>
                                            <button
                                              className={cx(style.stepBtn)}
                                              onClick={() => {
                                                saveKeyword(item.name);
                                              }}
                                            >
                                              儲存
                                            </button>
                                          </div>
                                        </>
                                      )}
                                  </div>
                                )
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
          <div
            className={cx(
              creactStoryStep !== 'creactkeywords' &&
                style.creactStoryFunctionBtn,
            )}
          >
            {creactStoryStep !== 'creactkeywords' &&
            creactStoryStep !== 'creactName' ? (
              <button
                className={cx(style.prevstepBtn)}
                onClick={() => previousStep(creactStoryStep, mode)}
              >
                上一步
              </button>
            ) : (
              <div />
            )}
            {creactStoryStep !== 'creactkeywords' &&
              creactStoryStep !== 'creactTrain' && (
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
                  setbotValue([{ id: uuid(), reply: '', error: '' }]);
                  setQuestionValue([
                    { id: uuid(), question: '', error: '' },
                    { id: uuid(), question: '', error: '' },
                  ]);
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
