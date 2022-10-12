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
      <input id="oriSay" class="swal2-input" style="display:none" value="${inputValue}">
      <textarea id="newSay" class="swal2-textarea col-9">${inputValue}</textarea>
      `,
      inputPlaceholder,
      inputValue,
      showCancelButton,
      preConfirm: () => {
        return {
          oriSay: document.querySelector('#oriSay').value,
          newSay: document.querySelector('#newSay').value,
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

export const confirmWidget = (storyName: string) => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-danger mx-1',
      cancelButton: 'btn btn-secondary mx-1',
    },
    buttonsStyling: false,
  });

  return swalWithBootstrapButtons
    .fire({
      title: `確認要刪除『${storyName}』`,
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
