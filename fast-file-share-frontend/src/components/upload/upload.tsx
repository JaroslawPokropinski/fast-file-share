import { useCallback } from 'react';
import style from './upload.module.scss';
import { fileDialog } from './upload-helpers';

export const Upload = ({
  onUpload,
}: {
  onUpload: (fileList: FileList) => void;
}) => {
  const onClick = useCallback(() => {
    fileDialog().then((files) => {
      if (files == null) return;
      onUpload(files);
    });
  }, [onUpload]);

  return (
    <div className={style.upload} onClick={onClick}>
      Upload
    </div>
  );
};
