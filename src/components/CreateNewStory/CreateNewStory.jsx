/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
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
  // 故事名稱 State7
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
  // 語句庫分類資料 State11
  const [SentenceTypeOption, setSentenceTypeOption] = React.useState();
  // 關鍵字資料(選擇用戶問句) State12
  const [keywordOption, setkeywordOption] = React.useState([]);
  // 關鍵字設定所有欄位狀態13
  const [keywordInput, setkeywordInput] = React.useState();
  // 當前選擇的例句 State14
  const [dataCheckValue, setdataCheckValue] = React.useState();
  // 當前關鍵字 State15
  const [Keywordvalue, setKeywordvalue] = React.useState();
  // 當前關鍵字(檢核) State16
  const [nowkeyword, setnowkeyword] = React.useState({ value: '', error: '' });
  // 語句庫分類已選項目 State17
  const [nowSentenceTypeOption, setnowSentenceTypeOption] = React.useState([]);
  // 關鍵字所有儲存類別 State18
  const [keywordType, setkeywordType] = React.useState([]);

  // 語句庫子選項 可選項目 State19
  const [slotChild, setslotChild] = React.useState();
  // 同義詞分類 State20
  const [Identifier, setIdentifier] = React.useState([]);

  // 語句庫子選項 已選項目 State21
  const [nowSlotChild, setnowSlotChild] = React.useState();
  // 語句庫分類 同義詞輸入狀態 State22
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
  // 共用標籤同義詞24
  const [allLabel, setallLabel] = React.useState('');
  // 統一關鍵字設定25
  const [allleywordStep, setallleywordStep] = React.useState();

  // 機器人回應 State26
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
          return (
            item.name === Name && (error = `故事『${Name}』重複，請重新輸入`)
          );
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
      // console.log(e);
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

  // 儲存關鍵字
  const saveKeyword = React.useCallback(
    (keywordQuestion) => {
      // 檢查是否有填完關鍵字

      // 儲存當前關鍵字
      let keyType = '';
      keyType = nowSentenceTypeOption?.label;
      if (keyType === undefined) {
        keyType = nowSentenceTypeOption[0]?.label;
      }
      // 儲存共用標籤
      let savealllabel = '';
      savealllabel = {
        keyword: nowkeyword.value,
        keyType,
        nowSlotChild,
        Identifier,
      }; // 當前同義字資料
      if (allLabel.length === 0) {
        setallLabel([savealllabel]);
      } else {
        setallLabel([allLabel[0], savealllabel]);
      }
      // 完成的關鍵字
      const newkeyword = { label: nowkeyword.value, state: 'true', keyType };
      // 未完成的關鍵字
      const nokeyword = { label: `缺少${keyType}`, state: 'false', keyType };
      let mergenokeywordType = '';
      mergenokeywordType = nokeyword;
      // 判斷例句有無關鍵字
      if (keywordType !== undefined) {
        // 合併當前關鍵字(合併未完成的關鍵字)

        // 合併當前關鍵字(合併完成的關鍵字)
        let mergekeywordType = '';
        let keywordTypeisfind = 0;
        console.log(keywordType);
        keywordType.find((item) => {
          // 檢查有沒有錯誤的關鍵字與這次輸入的語句庫類別一樣
          if (item.keyType === keyType) {
            item.label = nowkeyword.value;
            item.state = 'true';
            keywordTypeisfind = 1;
          }
        });
        mergekeywordType = keywordType;
        if (keywordTypeisfind === 0) {
          mergekeywordType.push(newkeyword);
        }
        // 修改例句資料
        const newkeywordOption = keywordOption;
        newkeywordOption.forEach((item) => {
          console.log('---------');
          console.log(item);
          if (
            item.keywordType.some(
              (obj) => obj.state === 'false' || obj.state === '',
            )
          ) {
            item.isSave = 'false';
          } else {
            item.isSave = 'true';
          }
          console.log(item.name === keywordQuestion && item.check === 'true');
          console.log(
            item.keywordType.some(
              (obj) => obj.keyType === keyType && obj.state === 'true',
            ),
          );

          console.log(
            item.keywordType.some(
              (obj) => obj.keyType === keyType && obj.state === 'false',
            ),
          );
          console.log(item.keywordType.length === 0);
          console.log('---------');
          // 如果他是當前選擇的例句
          if (item.name === keywordQuestion && item.check === 'true') {
            item.isSave = 'true';
            item.keywordType = mergekeywordType;
            return;
          }
          if (
            item.keywordType.some(
              (obj) => obj.keyType === keyType && obj.state === 'true',
            )
          ) {
            item.isSave = 'true';

            return;
          }
          if (
            item.keywordType.some(
              (obj) => obj.keyType === keyType && obj.state === 'false',
            )
          ) {
            // 如果關鍵字類別同時相同,保存狀態是false就篩選掉
            item.keywordType = item.keywordType.filter(
              (objkeywordType) =>
                !(
                  objkeywordType.keyType === keyType &&
                  objkeywordType.name === keywordQuestion &&
                  objkeywordType.state === 'false'
                ),
            );
            item.keywordType.push(mergenokeywordType);
            // 例句選項沒有關鍵字類別
          } else if (item.keywordType.length === 0) {
            item.isSave = 'false';
            item.keywordType.push(mergenokeywordType);
            return;
          } else {
            console.log(item);
            console.log(item.keywordType);
            item.isSave = 'false';
            item.keywordType.push(nokeyword);
          }
          if (item.keywordType.some((obj) => obj.state === 'false')) {
            item.isSave = 'false';
          } else {
            item.isSave = 'true';
          }
        });
        console.log(newkeywordOption);
        // 更新例句資料
        setkeywordOption(newkeywordOption);
        setnowkeyword({ value: '', error: '' });
      } else {
        // setkeywordType(newkeyword);
        setnowkeyword({ value: '', error: '' });
      }
      setKeywordvalue('');
      setnowkeyword({ value: '', error: '' });
      setnowSentenceTypeOption([]);
      setInputValue('');
      console.log(savealllabel);
      // 更新狀態
      // if (allLabel === undefined) {
      //   setallLabel([savealllabel]);
      // } else {
      //   let noMergedlabel = '';
      //   noMergedlabel = [allLabel[0], savealllabel];
      //   let mergedLabel = '';
      //   mergedLabel = [savealllabel]; // 用來儲存合併後的陣列
      //   let seen = '';
      //   seen = {}; // 用來記錄已經出現過的物件
      //   noMergedlabel.map((obj) => {
      //     // 對每個物件進行迴圈
      //     const key = Object.keys(obj)[0]; // 取得物件的第一個鍵，例如"地點"或"職缺"
      //     const value = obj[key]; // 取得物件的第一個值，例如陣列或字串
      //     if (seen[key]) {
      //       // 如果已經出現過這個鍵，就將值合併到已存在的物件中
      //       seen[key] = seen[key].concat(value);
      //     } else {
      //       // 如果沒有出現過這個鍵，就將物件加入到合併後的陣列中，並記錄到seen中
      //       mergedLabel.push(obj);
      //       seen[key] = value;
      //     }
      //   });
      //   const atlast = (() => {
      //     return removeDuplicates(mergedLabel);
      //   })();
      //   console.log(atlast);
      //   setallLabel(atlast);
      // }
      // keywordQuestion 例句
      // nowkeyword.value 關鍵字
      // const start = keywordQuestion.indexOf(nowkeyword.value);
      // const end = start + nowkeyword.value.length;

      // const examplesValue = Identifier.flatMap((item) =>
      //   item.data.map((dataItem) => ({
      //     entities: [
      //       {
      //         start,
      //         end: start + dataItem.label.length,
      //         value: item.label,
      //       },
      //     ],
      //     intent: storeName.name,
      //     text:
      //       keywordQuestion.slice(0, start) +
      //       dataItem.label +
      //       keywordQuestion.slice(end),
      //   })),
      // );

      console.log(allleywordStep);
      console.log('ok!');
      setkeywordInput(false);
    },
    [
      setkeywordOption,
      setnowkeyword,
      setKeywordvalue,
      setnowSentenceTypeOption,
      setInputValue,
      setkeywordInput,
      keywordInput,
      nowkeyword,
      questionValue,
      Identifier,
      keywordType,
      keywordOption,
      storeName,
      setallLabel,
      allLabel,
      nowSentenceTypeOption,
      allleywordStep,
      setallleywordStep,
    ],
  );
  // 取消關鍵字設定
  const cancelKeyword = React.useCallback(() => {
    setKeywordvalue('');
    setnowkeyword({ value: '', error: '' });
    setnowSentenceTypeOption([]);
    setInputValue('');
    setkeywordInput(false);
  }, [
    setkeywordInput,
    setKeywordvalue,
    setnowkeyword,
    setnowSentenceTypeOption,
    setInputValue,
  ]);
  // 新增關鍵字
  const addKeyword = React.useCallback(() => {
    setkeywordInput(true);
    // 清除當前關鍵字資料
    setKeywordvalue('');
    // 清除語句庫分類已選項目
    setnowSentenceTypeOption([]);
    setInputValue('');
  }, [setKeywordvalue, setnowSentenceTypeOption, setInputValue]);
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
      console.log(e);
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
      // console.log(obj);
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
      // 判斷是否包含再以新增的語句庫分類
      const result = !slots.some((slot) => {
        return slot.key === obj.value;
      });
      // console.log(result);
      if (result) {
        console.log(obj.value);
        // setnowSentenceTypeOption({ value: '', label: '' });
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
      // console.log([obj.value]);
      setnowSentenceTypeOption({ value: obj.value, label: obj.value });
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
      if (allLabel !== undefined) {
        // console.log(allLabel);

        try {
          const statementLibrary = allLabel?.map((item) => {
            if (item.keyType === obj.value) {
              // item.nowSlotChild.map((nowSlotChilds) => {
              // });
              setnowSlotChild(item.nowSlotChild);
              setIdentifier(item.Identifier);
              return item.nowSlotChild;
            }
            return null;
          });
          if (statementLibrary[0] !== null) {
            changeSlotChild(statementLibrary[0]);
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    [
      slotChild,
      setslotChild,
      slots,
      nowSlotChild,
      setnowSentenceTypeOption,
      changeSlotChild,
    ],
  );
  React.useEffect(() => {
    if (nowSentenceTypeOption.length === 0) {
      setslotChild(undefined);
      setIdentifier([]);
    }
  }, [nowSentenceTypeOption]);
  // 選擇關鍵字
  const chooseKeyword = React.useCallback(
    (Keyword: String, index: String) => {
      setkeywordInput(true);
      // 清除當前關鍵字資料
      setKeywordvalue('');
      // 清除語句庫分類已選項目
      setnowSentenceTypeOption([]);
      setInputValue('');

      // 選擇的例句
      const nowkeywordOption = keywordOption.find((item) => {
        return item.name === dataCheckValue && item;
      });

      console.log(nowkeywordOption);
      // 選擇的關鍵字
      const choose = nowkeywordOption.keywordType[index].keyType;
      // 更新例句關鍵字狀態
      const newOption = keywordOption;
      newOption.forEach((item) => {
        console.log(item.name === dataCheckValue);
        if (item.name === dataCheckValue) {
          item.slotType = Number(index) + 1;
        }
      });

      // 選擇當前同義字
      const nowlabel = allLabel.find((item) => {
        return item.keyType === choose && item;
      });
      setIdentifier(nowlabel);
      console.log(choose);
      console.log(nowkeywordOption);
      console.log(nowlabel);
      console.log(newOption);
      // 當前關鍵字
      setKeywordvalue(Keyword);
      setnowkeyword({ value: Keyword, error: '' });
      setkeywordOption(newOption);
      // 語句庫分類已選項目
      // setnowSentenceTypeOption
      // 多選標籤狀態
      // setnowSlotChild([]);
      // 語句庫分類選擇
      changeSentenceTypeOption({ value: choose, error: choose });
    },
    [
      setnowkeyword,
      keywordInput,
      setkeywordInput,
      allLabel,
      setIdentifier,
      Identifier,
      nowSlotChild,
      slotChild,
      keywordOption,
      dataCheckValue,
      setKeywordvalue,
      setnowSentenceTypeOption,
      setInputValue,
    ],
  );
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
  const [onlyOneloadkeywordOption, setonlyOneloadkeywordOption] =
    React.useState(0);
  // 載入關鍵字資料
  const loadkeywordOption = React.useCallback(
    (e: String) => {
      setKeywordvalue('');
      setnowkeyword({ value: '', error: '' });
      setnowSentenceTypeOption([]);
      setInputValue('');

      setkeywordInput(false);

      console.log(e);
      // 要更新的關鍵字資料
      let updatekeywordOption;
      // 第一次載入需要設定的資料
      if (onlyOneloadkeywordOption === 0) {
        setkeywordInput(true);
        updatekeywordOption = questionValue.map((item) => {
          console.log(item.question);
          console.log(e);
          if (item.question === e) {
            return {
              id: uuid(), // key值
              name: item.question, // 例句名稱
              check: 'true', // 是否被選擇
              isSave: '', // 關鍵字是否都存檔
              slotType: 1, // 現在選擇哪個關鍵字
              keywordType: [], // 所有關鍵字
            };
          }
          return {
            id: uuid(),
            name: item.question,
            check: 'false',
            isSave: '',
            slotType: 1,
            keywordType: [],
          };
        });
        console.log(updatekeywordOption);
      } else {
        updatekeywordOption = keywordOption;
        updatekeywordOption.forEach((item) => {
          if (item.name === e) {
            item.check = 'true';
            // 載入已存的關鍵字資料
            setkeywordType(item.keywordType);
            // 載入選擇的關鍵字
            const newslotType = item.slotType - 1;
            let newkeywordType = '';
            let newnowSentenceTypeOption = '';
            if (item.keywordType[newslotType]?.label) {
              newkeywordType = item.keywordType[newslotType]?.label;
              newnowSentenceTypeOption = {
                value: item.keywordType[newslotType]?.keyType,
                label: item.keywordType[newslotType]?.keyType,
              };
            }
            console.log(newnowSentenceTypeOption);
            // 語句庫分類已選項目
            setnowSentenceTypeOption(newnowSentenceTypeOption);
            // 多選標籤狀態
            setnowSlotChild([]);
            // 語句庫分類選擇
            changeSentenceTypeOption(newnowSentenceTypeOption);
            // 當前關鍵字
            setKeywordvalue(newkeywordType);
          } else {
            item.check = 'false';
          }
        });
      }
      const dataCheckValues = keywordOption.find(
        (ko) => ko.name === e && ko.check === 'true',
      )
        ? e
        : '';
      setonlyOneloadkeywordOption(1);
      setdataCheckValue(dataCheckValues);
      setkeywordOption(updatekeywordOption);
    },
    [
      setkeywordInput,
      keywordInput,
      keywordOption,
      setkeywordOption,
      setnowSlotChild,
      setnowkeyword,
      setInputValue,
      setKeywordvalue,
      questionValue,
      dataCheckValue,
      nowSentenceTypeOption,
      setnowSentenceTypeOption,
      setonlyOneloadkeywordOption,
      onlyOneloadkeywordOption,
      setdataCheckValue,
    ],
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
  // // 關鍵字組例句
  const keywordGroup = React.useCallback(() => {
    console.log(keywordOption[0].name);
    // 主要例句
    const keywordQuestion = keywordOption[0].name;
    let entitiesValue = '';
    console.log(keywordOption[0].keywordType);
    if (keywordOption[0].keywordType.length === 1) {
      entitiesValue = [
        {
          start: keywordQuestion.indexOf(keywordOption[0].keywordType[0].label),
          end:
            keywordQuestion.indexOf(keywordOption[0].keywordType[0].label) +
            keywordOption[0].keywordType[0].label.length,
          value: keywordOption[0].keywordType[0].label,
        },
      ];
    } else {
      console.log(keywordOption);
      entitiesValue = keywordOption[0].keywordType.map((item) => ({
        start: keywordQuestion.indexOf(item.label),
        end: keywordQuestion.indexOf(item.label) + item.label.length,
        entity: item.keyType,
        value: item.label,
      }));
    }
    console.log(entitiesValue);
    console.log('keywordOption');
    console.log(keywordOption);
    console.log('allLabel');
    console.log(allLabel);
    // const start = keywordQuestion.indexOf(nowkeyword.value);
    // const end = start + nowkeyword.value.length;
    // 取出所有標籤並分類
    const allLabels = allLabel.flatMap(({ keyType, Identifier }) =>
      Identifier.flatMap(({ value, data }) => [
        { keyType, value, data: value },
        ...data.map(({ value: dataValue }) => ({
          keyType,
          value,
          data: dataValue,
        })),
      ]),
    );
    console.log(allLabels);
    // 20230322start
    const result = [];
    keywordOption.forEach((option) => {
      // 例句
      const { name } = option;
      // 例句的關鍵字
      const keywordTypes = option.keywordType;
      // 例句組合
      let combinations = [{ text: name }];
      keywordTypes.forEach((keywordType) => {
        // 關鍵字的語句庫分類
        const { keyType } = keywordType;
        // 關鍵字
        const { label } = keywordType;
        // 語句庫分類
        const matchingLabels = allLabels.filter(
          (allLabel) => allLabel.keyType === keyType,
        );
        // 將所有可能的例句組合起來
        combinations = combinations.flatMap((combination) =>
          matchingLabels.map((matchingLabel) => ({
            text: combination.text.replaceAll(label, matchingLabel.data),
          })),
        );
      });

      // 組合的新例句，並抽取出實體
      combinations.forEach((combination) => {
        const { text } = combination;
        let currentIndex = 0;
        let entities = [];
        let previousEntityEnd = -1;
        keywordTypes.forEach((keywordType) => {
          const { keyType } = keywordType; // 關鍵字類型
          const { label } = keywordType; // 關鍵字標籤

          // 從所有標籤中選擇符合該類型的標籤
          const matchingLabels = allLabels.filter(
            (allLabel) => allLabel.keyType === keyType,
          );
          matchingLabels.forEach((matchingLabel) => {
            const { value } = matchingLabel; // 實體值
            const { data } = matchingLabel; // 關鍵字
            let start = text.indexOf(data);
            while (start !== -1) {
              const end = start + data.length;
              const entity = {
                start,
                end,
                value,
                entity: keyType,
              };
              // 判斷當前 entity 是否已經存在
              const duplicateEntities = entities.filter(
                (e) => e.entity === entity.entity,
              );
              if (duplicateEntities.length > 0) {
                // 找出所有與當前 entity 重複的 entity，比較 end-start 範圍大小
                const allEntities = [entity, ...duplicateEntities];
                const smallestRangeEntity = allEntities.reduce((prev, curr) => {
                  const prevRange = prev.end - prev.start;
                  const currRange = curr.end - curr.start;
                  return prevRange < currRange ? prev : curr;
                });
                if (smallestRangeEntity === entity) {
                  // 如果當前 entity 的 end-start 範圍最小，則不加入 entities
                  currentIndex = end;
                } else {
                  // 如果當前 entity 的 end-start 範圍不是最小，則刪除已經存在的 entity，加入當前 entity
                  entities = entities.filter(
                    (e) => !duplicateEntities.includes(e),
                  );
                  entities.push(entity);
                  previousEntityEnd = end;
                  currentIndex = end;
                }
              } else {
                // 當前 entity 不存在於 entities 中，直接加入
                entities.push(entity);
                previousEntityEnd = end;
                currentIndex = end;
              }
              start = text.indexOf(data, end); // 找下一個關鍵字
            }
          });
        });
        result.push({
          entities,
          intent: storeName.name,
          text,
        });
      });
    });

    console.log(result);
    // 20230322end
    // const examplesValue = keywordOption.map((keyoptions) => {
    //   console.log(keyoptions);
    //   // 例句名稱
    //   // const exampleName = keyoptions.name;
    //   return allLabel.map((allLabels) => {
    //     console.log(allLabels);
    //     return allLabels.Identifier.flatMap((item) => {
    //       return item.data.map((dataItem) => ({
    //         // entities: [
    //         //   {
    //         //     start: exampleName.indexOf(item.label),
    //         //     end: exampleName.indexOf(item.label) + dataItem.label.length,
    //         //     value: item.label,
    //         //     entity: item.keyType,
    //         //   },
    //         // ],
    //         a: item,
    //         exampleName: keyoptions.name,
    //         allLabelsKeyword: allLabels.keyword,
    //         intent: storeName.name,
    //         text:
    //           keyoptions.name.slice(
    //             0,
    //             keyoptions.name.indexOf(allLabels.keyword),
    //           ) +
    //           dataItem.label +
    //           keyoptions.name.slice(
    //             keyoptions.name.indexOf(allLabels.keyword) +
    //               dataItem.label.length,
    //           ),
    //       }));
    //     });
    //   });
    // });
    // console.log(examplesValue);
    // const examplesValue = Identifier.flatMap((item) =>
    //   item.data.map((dataItem) => ({
    //     entities: [
    //       {
    //         start,
    //         end: start + dataItem.label.length,
    //         value: item.label,
    //     entity:語句庫分類
    //       },
    //     ],

    //     intent: storeName.name,
    //     text:
    //       keywordQuestion.slice(0, start) +
    //       dataItem.label +
    //       keywordQuestion.slice(end),
    //   })),
    // );
    // // 關鍵字抓start end
    // const step = [
    //   {
    //     user: keywordQuestion, // 使用者問句
    //     intent: storeName.name, // 故事名稱

    //     // 標籤
    //     entities: [
    //       {
    //         end,
    //         entity: nowSentenceTypeOption.toString(), // 語句庫分類
    //         start,
    //         // value: '新竹', // 標籤
    //       },
    //     ],
    //     // 使用者例句
    //     examples: examplesValue,
    //     // 故事分類
    //     // metadata: {
    //     //   category: '測試',
    //     // },
    //   },
    // ];
    // setallleywordStep(step);
    // console.log('step資料');
    // console.log(step);
  }, [
    keywordOption,
    nowkeyword,
    Identifier,
    storeName,
    nowSentenceTypeOption,
    setallleywordStep,
  ]);

  // },[])
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
            loadkeywordOption(questionValue[0].question);
            settitle('');
          }
        }
        if (stepName === 'creactkeywords') {
          keywordGroup();
          // if (stepError !== 'error') {
          //   setcreactStoryStep('creactBot');
          //   settitle('機器人回應');
          // }
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
      loadkeywordOption,
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
            <div className={style.creactTrainImg}>
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
                    {keywordOption.map((item) => {
                      return (
                        <div key={`questionValue${item.id}`}>
                          <label
                            data-check={item.check}
                            data-slot={item.isSave}
                            onClick={() => loadkeywordOption(item.name)}
                            className={cx(style.customCheckbox)}
                            htmlFor={item.id}
                          >
                            <input
                              id={item.id}
                              key={`questionValueinput${item.id}`}
                              name="creactkeywords"
                              type="radio"
                            />
                            <span name="checkIcon" data-foo={item.name} />
                            <span name="checkItem">
                              {item.isSave === 'false' && (
                                <img
                                  src={require('../../images/creactStory/bi_exclamation-circle-fill.png')}
                                  alt=""
                                />
                              )}
                              {item.isSave === 'true' && (
                                <img
                                  src={require('../../images/creactStory/avatar.png')}
                                  alt=""
                                />
                              )}
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
                                        nowkeyword?.error.length > 0
                                          ? (style.storyInputBlock, style.error)
                                          : style.storyInputBlock
                                      }
                                    >
                                      <div
                                        name="now"
                                        className={
                                          nowkeyword?.value.length > 0
                                            ? style.keywordBtn
                                            : undefined
                                        }
                                      >
                                        {nowkeyword?.value.length > 0 && (
                                          <img
                                            src={require('../../images/creactStory/exclamation.png')}
                                            alt=""
                                          />
                                        )}

                                        {nowkeyword?.value}
                                      </div>
                                      {keywordType?.map((itm, index) => {
                                        return (
                                          <button
                                            name="other"
                                            onClick={() => {
                                              chooseKeyword(itm.label, index);
                                            }}
                                            key={`${itm.label}`}
                                            className={style.keywordBtn}
                                          >
                                            {itm.state !== 'true' && (
                                              <img
                                                src={require('../../images/creactStory/exclamation.png')}
                                                alt=""
                                              />
                                            )}

                                            {itm.label}
                                          </button>
                                        );
                                      })}
                                      {keywordInput === false && (
                                        <button
                                          name="add"
                                          className={style.keywordBtn}
                                          onClick={() => {
                                            addKeyword();
                                          }}
                                        >
                                          + 新增關鍵字
                                        </button>
                                      )}
                                    </div>
                                    {keywordInput === true && (
                                      <>
                                        <div
                                          className={
                                            nowkeyword?.error.length > 0
                                              ? (style.storyInputBlock,
                                                style.error)
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
                                              setKeywordvalue(e.target.value);
                                              checkKeyword(e.target.value);
                                            }}
                                            value={Keywordvalue}
                                            type="text"
                                          />
                                          {nowkeyword?.error.length > 0 && (
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
                                            key={`SentenceType-${nowSentenceTypeOption}`}
                                            isClearable
                                            id="SentenceType"
                                            name="SentenceType"
                                            placeholder="輸入即可新增語句庫分類"
                                            value={nowSentenceTypeOption}
                                            onChange={(e) => {
                                              setnowSlotChild([]);
                                              setnowSentenceTypeOption([e]);
                                              changeSentenceTypeOption(e);
                                            }}
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
                                                key={`select-${nowSentenceTypeOption}`}
                                                isMulti
                                                id="Selectlabel"
                                                value={nowSlotChild}
                                                placeholder="輸入即可新增標籤"
                                                name="Selectlabel"
                                                options={slotChild[0]}
                                                onChange={(e) => {
                                                  setnowSlotChild(e);
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
                                              {nowSlotChild?.map(
                                                (resemblance) => {
                                                  return (
                                                    <div
                                                      key={resemblance?.value}
                                                      className="row"
                                                    >
                                                      <div className="col-5">
                                                        <div>
                                                          <label htmlFor="">
                                                            標籤
                                                          </label>
                                                        </div>
                                                        <div
                                                          key={`resemblance${resemblance?.value}`}
                                                          className={cx(
                                                            style.formStyle,
                                                          )}
                                                        >
                                                          {resemblance?.value}
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
                                                            key={`ss${resemblance?.value}`}
                                                            components={
                                                              components
                                                            }
                                                            inputValue={
                                                              Identifier?.find(
                                                                (obj) =>
                                                                  obj.label ===
                                                                  resemblance?.value,
                                                              )?.oninput ?? ''
                                                            }
                                                            isClearable
                                                            isMulti
                                                            menuIsOpen={false}
                                                            onChange={(
                                                              newValue,
                                                            ) => {
                                                              let a = '';
                                                              a =
                                                                newValue.filter(
                                                                  (nv) =>
                                                                    nv.length !==
                                                                    0,
                                                                );

                                                              changeIdentifier(
                                                                a,
                                                                resemblance?.value,
                                                                'onChange',
                                                              );
                                                            }}
                                                            onInputChange={(
                                                              newValue,
                                                            ) => {
                                                              changeIdentifier(
                                                                newValue,
                                                                resemblance?.value,
                                                                'onInputChange',
                                                              );
                                                            }}
                                                            onKeyDown={(e) => {
                                                              handleKeyDown(
                                                                e,
                                                                resemblance?.value,
                                                              );
                                                            }}
                                                            value={
                                                              Identifier?.find(
                                                                (obj) =>
                                                                  obj.label ===
                                                                  resemblance?.value,
                                                              )?.data ?? ''
                                                            }
                                                            placeholder={`請輸入${resemblance?.value}的同義詞`}
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                },
                                              )}
                                              <div
                                                className={cx(
                                                  style.saveBlock,
                                                  'mt-2',
                                                )}
                                              >
                                                <button
                                                  className={cx(style.stepBtn)}
                                                  onClick={() => {
                                                    cancelKeyword();
                                                  }}
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
              <div className={style.creactTrainBlock}>
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
