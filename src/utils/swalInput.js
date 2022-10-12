import Swal from 'sweetalert2';

export const swalInput = async (
  title: string,
  input: string,
  inputPlaceholder: string,
  inputValue: string,
  showCancelButton: boolean,
) => {
  if (title === '編輯使用者對話') {
    const { value: formValue } = await Swal.fire({
      title,
      html: `
      <input id="oriUserSay" class="swal2-input" style="display:none" value="${inputValue}">
      <textarea id="userSay" class="swal2-textarea col-9">${inputValue}</textarea>
      `,
      inputPlaceholder,
      inputValue,
      showCancelButton,
      preConfirm: () => {
        return {
          oriUserSay: document.querySelector('#oriUserSay').value,
          userSay: document.querySelector('#userSay').value,
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
