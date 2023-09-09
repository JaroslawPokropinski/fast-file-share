import { TorrentFile } from 'webtorrent';

export const getTorrentBuffer = (file: TorrentFile) =>
  new Promise<Buffer | undefined>((resolve, reject) =>
    file.getBuffer(function (err, buf) {
      if (err != null) reject(err);

      resolve(buf);
    }),
  );
