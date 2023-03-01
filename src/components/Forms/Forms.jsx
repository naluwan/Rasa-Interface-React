import * as React from 'react';
import type { DomainType } from 'components/types';
import style from './Forms.module.scss';
import CreateFormModal from './CreateFormModal';

type FormsProps = {
  domain: DomainType,
};

const Forms: React.FC<FormsProps> = (props) => {
  const { domain } = props;
  const [selectForm, setSelectForm] = React.useState({});
  const [isCreateForm, setIsCreateForm] = React.useState(false);

  // 將表單資料整理成陣列key, value格式，[表單名稱, 需要設定的slot]
  const allForms = React.useMemo(() => {
    return Object.entries(domain.forms);
  }, [domain.forms]);

  // 設定選取的表單
  const atClickForm = React.useCallback(
    (formName: string) => {
      const selectedForm = allForms.filter((form) => form[0] === formName)[0];
      // eslint-disable-next-line camelcase
      const { required_slots } = selectedForm[1];
      // eslint-disable-next-line camelcase
      setSelectForm({ name: selectedForm[0], required_slots });
    },
    [allForms, setSelectForm],
  );

  return (
    <div className={style.root}>
      <h1>表單設計</h1>
      <div>
        <div>
          {allForms.length > 0 &&
            allForms.map((form) => {
              return (
                <button
                  key={form[0]}
                  type="button"
                  className="btn btn-secondary mx-2"
                  onClick={() => atClickForm(form[0])}
                >
                  {form[0]}
                </button>
              );
            })}
          <button
            key="createNewForms"
            type="button"
            className="btn btn-light m-2"
            onClick={() => setIsCreateForm((prev) => !prev)}
          >
            + 新增表單
          </button>
        </div>
        {Object.keys(selectForm).length > 0 && (
          <div className="mt-3">
            <div>
              <h2>{selectForm.name}</h2>
            </div>
            <div>
              {Object.keys(selectForm.required_slots).length > 0 &&
                Object.entries(selectForm.required_slots).map((slot) => {
                  return (
                    <div
                      className="card mt-2 d-flex "
                      style={{ width: '18rem' }}
                    >
                      <div className="card-body">
                        <h5 className="card-title">{slot[0]}</h5>
                        <p className="card-text">
                          {domain.responses[`utter_ask_${slot[0]}`][0].text}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
      <CreateFormModal
        title="建立表單"
        isVisible={isCreateForm}
        onClose={() => setIsCreateForm((prev) => !prev)}
        allForms={allForms}
      />
    </div>
  );
};

export default React.memo(Forms);
