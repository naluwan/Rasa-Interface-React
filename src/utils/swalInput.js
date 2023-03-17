import Swal from 'sweetalert2';

export const swalInput = async (
  title: string,
  input: string,
  inputPlaceholder: string,
  inputValue: string,
  showCancelButton: boolean,
) => {
  if (
    title === '編輯使用者對話' ||
    title === '編輯機器人回覆' ||
    title === '編輯意圖'
  ) {
    const { value: formValue } = await Swal.fire({
      title,
      showCloseButton: true,
      html: `
      <textarea id="ori" class="swal2-input" style="display:none">${inputValue}</textarea>
      <textarea id="new" class="swal2-textarea col-9">${inputValue}</textarea>
      `,
      inputPlaceholder,
      inputValue,
      showCancelButton,
      preConfirm: () => {
        return {
          ori: document.querySelector('#ori').value,
          new: document.querySelector('#new').value,
        };
      },
    });
    return formValue;
  }
  const { value: newInput } = await Swal.fire({
    title,
    input,
    inputPlaceholder,
    inputValue,
    showCancelButton,
  });
  return newInput;
};

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
});

export const confirmWidget = (value: string, type: string) => {
  let currentTitle = '';
  let currentText = '';
  switch (type) {
    case 'delete':
      currentTitle = `真的要刪除劇本嗎?`;
      // currentText = `確認要刪除『${value}』?`;
      break;
    case 'deleteEntities':
      currentTitle = `刪除`;
      currentText = `確認要刪除關鍵字『${value}』?`;
      break;
    case 'deleteExample':
      currentTitle = `刪除`;
      currentText = `確認要刪除例句『${value}』?`;
      break;
    default:
      currentTitle = '離開';
      currentText = `故事『${value}』尚未儲存，確定要離開?`;
  }
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn confirmButton mx-2 col-3',
      cancelButton: 'btn cancelButton mx-2 col-3',
      popup: 'showPop',
    },
    buttonsStyling: false,
  });

  return swalWithBootstrapButtons
    .fire({
      title: currentTitle,
      text: currentText,
      icon: 'warning',
      iconColor: 'red',
      showCancelButton: true,
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      reverseButtons: true,
    })
    .then((result) => {
      return result;
    });
};

export const swalMultipleInput = async (
  title: string,
  oriTitle: string,
  oriReply: string,
  showCancelButton: boolean,
) => {
  const { value: formValue } = await Swal.fire({
    title,
    html: `
      <input id="title" class="swal2-input col-9" value="${oriTitle}" placeholder="請輸入選項名稱">
      <input id="payload" class="swal2-input col-9" style="display:none;" value="${`/${oriTitle}`}" placeholder="">
      <textarea id="reply" class="swal2-textarea col-9" placeholder="請輸入選項回覆">${oriReply}</textarea>
      `,
    showCancelButton,
    preConfirm: () => {
      return {
        title: document.querySelector('#title').value,
        reply: document.querySelector('#reply').value,
        oriPayload: document.querySelector('#payload').value,
      };
    },
  });
  return formValue;
};
