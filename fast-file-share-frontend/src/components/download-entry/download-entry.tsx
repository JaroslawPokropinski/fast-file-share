import { useEffect, useState } from 'react';
import { Notification } from '../../api/notifications';
import style from './download-entry.module.scss';
import WebTorrent from 'webtorrent';

export const DownloadEntry = ({
  downloadEntry,
  onDownload,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  torrent,
}: {
  downloadEntry: Notification;
  onDownload: (downloadEntry: Notification) => void;
  torrent: WebTorrent.Torrent | undefined;
}) => {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!torrent) return;

    console.log('createdBy', torrent.createdBy);

    const onDownload = () => {
      setStatus('downloading');
    };

    const onUpload = () => {
      setStatus('uploading');
    };

    const onError = (err: string | Error) => {
      setStatus('error');
      console.error(err);
    };

    torrent.on('download', onDownload);
    torrent.on('upload', onUpload);
    torrent.on('error', onError);

    return () => {
      torrent.off('download', onDownload);
      torrent.off('upload', onUpload);
      torrent.off('error', onError);
    };
  });

  return (
    <div
      className={style.downloadEntry}
      onClick={() => {
        if (!torrent) {
          onDownload(downloadEntry);
        }
      }}
    >
      {downloadEntry.fileName} {status}
    </div>
  );
};
