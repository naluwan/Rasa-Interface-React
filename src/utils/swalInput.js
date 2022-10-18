import Swal from 'sweetalert2';

export const swalInput = async (
  title: string,
  input: string,
  inputPlaceholder: string,
  inputValue: string,
  showCancelButton: boolean,
) => {
  if (title === '編輯使用者對話' || title === '編輯機器人回覆') {
    const { value: formValue } = await Swal.fire({
      title,
      html: `
      <input id="ori" class="swal2-input" style="display:none" value="${inputValue}">
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

export const confirmWidget = (storyName: string, type: string) => {
  let currentTitle = '';
  let currentText = '';
  switch (type) {
    case 'delete':
      currentTitle = `刪除`;
      currentText = `確認要刪除『${storyName}』?`;
      break;
    default:
      currentTitle = '離開';
      currentText = `故事『${storyName}』尚未儲存，確定要離開?`;
  }
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-danger mx-1',
      cancelButton: 'btn btn-secondary mx-1',
    },
    buttonsStyling: false,
  });

  return swalWithBootstrapButtons
    .fire({
      title: currentTitle,
      text: currentText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      reverseButtons: false,
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
