// todo: remove input after selecting
export function fileDialog(): Promise<FileList | null> {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  return new Promise(function (resolve) {
    input.onchange = function () {
      if (input.files == null) return resolve(null);

      return resolve(input.files);
    };
    input.click();
  });
}
