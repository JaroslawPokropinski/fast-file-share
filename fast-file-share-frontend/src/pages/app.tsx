import { Suspense, useCallback, useEffect, useState } from 'react';
import { DownloadEntry } from '../components/download-entry/download-entry';
import { Upload } from '../components/upload';
import style from './App.module.scss';
import {
  Notification,
  useCreateNotification,
  useNotifications,
} from '../api/notifications';
import WebTorrent from 'webtorrent';
import { getTorrentBuffer } from '../utils/util';
import { delay } from '../utils/delay';

export type UploadEntry = {
  fileName: string;
};

const saveToDrive = (name: string, buffer: Buffer, w = window, d = document) => {
  const url = w.URL.createObjectURL(new Blob([new Uint8Array(buffer, 0, buffer.length)]));
  const tempLink = d.createElement('a');
  tempLink.href = url;
  tempLink.setAttribute('download', name);
  tempLink.click();
};

function App() {
  const {
    data: { notifications },
  } = useNotifications('user');

  const [createNotification] = useCreateNotification();

  const [torrentClient] = useState(
    new WebTorrent({
      tracker: {
        announce: [
          'wss://tracker.files.fm:7073/announce',
          'ws://tracker.files.fm:7072/announce',
        ],
      },
    }),
  );
  const [torrents, setTorrents] = useState<WebTorrent.Torrent[]>([]);

  useEffect(() => {
    window.Notification.requestPermission()
  },[])

  useEffect(() => {
    console.log('WEBRTC_SUPPORT', WebTorrent.WEBRTC_SUPPORT);
    torrentClient.on('error', console.error);

    const onTorrent = () => {
      setTorrents(torrentClient.torrents);
    };
    torrentClient.on('torrent', onTorrent);

    return () => {
      torrentClient.off('error', console.error);
      torrentClient.off('torrent', onTorrent);
    };
  });

  const onUpload = useCallback(
    (files: FileList) => {
      torrentClient.seed(
        files,
        {
          announce: ['wss://vite.merume.ovh/announce'],
        },
        (torrent) => {
          console.debug(`Hosting ${torrent.files.length} files.`);
          console.debug(`Magnet: ${torrent.magnetURI}`);
          createNotification({
            variables: {
              notification: {
                magnet: torrent.magnetURI,
                infoHash: torrent.infoHash,
                fileName:
                  files.length === 1
                    ? files[0].name
                    : `${files[0].name} and ${files.length - 1} others`,
              },
              userId: 'user',
            },
          });
        },
      );
    },
    [createNotification, torrentClient],
  );

  const onDownload = useCallback(
    (downloadEntry: Notification) => {
      const magnet = downloadEntry.magnet;
      console.debug('Look for: ', magnet);

      torrentClient.add(
        magnet,
        // {
        //   announce: [
        //     'wss://tracker.files.fm:7073/announce',
        //     'ws://tracker.files.fm:7072/announce',
        //   ],
        // },
        (torrent) => {
          // Got torrent metadata
          console.debug('Client is downloading:', torrent.infoHash);

          // torrent.on('')

          torrent.on('done', async () => {
            console.debug('Downloading finished');
            for (let i = 0; i < torrent.files.length; i++) {
              try {
                const file = torrent.files[i];

                console.log(file.name);
                console.log(file);

                const buf = await getTorrentBuffer(file);
                // file.getBuffer((err, buffer) => {
                //   console.log('Iv read the file', err, buffer);
                // });
                if (buf == null) continue;

                saveToDrive(file.name, buf);
                await delay(100);
              } catch (error) {
                console.error(error);
              }
            }
          });
        },
      );
    },
    [torrentClient],
  );

  return (
    <Suspense fallback={<div>...</div>}>
      <div className={style.sharingPage}>
        <div className={style.heading}>
          <div className={style.currentUserBadge}>
            <span className={style.username}>User Name</span>
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Decentralized_Identity_icon.svg" />
          </div>
        </div>

        <main>
          <Upload onUpload={onUpload} />
          {notifications.map((entry) => (
            <DownloadEntry
              key={entry.id}
              downloadEntry={entry}
              onDownload={onDownload}
              torrent={torrents.find(
                (torrent) => torrent.magnetURI === entry.magnet,
              )}
            />
          ))}
        </main>
      </div>
    </Suspense>
  );
}

export default App;
