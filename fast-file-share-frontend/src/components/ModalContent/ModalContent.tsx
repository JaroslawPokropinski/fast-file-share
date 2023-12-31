import { useState, useEffect, useRef, useCallback } from 'react';
// import QRCode from 'qrcode.react';
import WebTorrent from 'webtorrent';

import clipboardIcon from './clipboard.png';

const shortenString = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength - 3)}...`;
};

function UrlCopyComponent({ url }: { url: string }) {
  const ref = useRef<HTMLInputElement>(null);

  const copyText = useCallback(() => {
    ref.current?.select();
    ref.current?.setSelectionRange(0, 99999);
    document.execCommand('copy');
    ref.current?.setSelectionRange(0, 0);
  }, [ref]);

  return (
    <div className="url-copy">
      <input
        className="url-copy-input"
        type="text"
        value={url}
        ref={ref}
        readOnly
      />
      <span className="url-copy-button" onClick={() => copyText()}>
        <img src={clipboardIcon} alt="Copy url to clipboard" />
      </span>
    </div>
  );
}

function ModalContent(props: {
  files: File[] | FileList | null;
  onClose: () => void;
}) {
  const [uploadState, setUploadState] = useState<
    'loading' | 'uploading' | 'error'
  >('loading');
  const [uuid, setUUID] = useState(null as null | string);

  useEffect(() => {
    if (props.files == null) {
      props.onClose();
    }
  }, [props]);

  useEffect(() => {
    if (props.files == null) return;

    console.log(props.files.length);
    for (let i = 0; i < props.files.length; i++) {
      console.log(props.files[i].name);
    }
  }, [props]);

  useEffect(() => {
    if (props.files == null) return;

    const client = new WebTorrent();

    client.on('error', (error) => {
      setUploadState('error');
      console.error(error);
    });

    client.seed(props.files, (torrent) => {
      console.log(`Hosting ${torrent.files.length} files.`);
      setUploadState('uploading');
      const codedMagnet = Buffer.from(torrent.magnetURI).toString('base64');
      setUUID(codedMagnet);
    });
  }, [props.files, setUUID]);

  const getUrl = () => {
    return `${window.location.href}download/${uuid != null ? uuid : ''}`;
  };

  return (
    <div className="modal-root">
      <div className="modal-body">
        <div>You are sharing file. Do not close this modal.</div>
        <div>
          {/* <QRCode className="qrcode" renderAs="svg" value={getUrl()} /> */}
        </div>
        <div>
          {uploadState === 'uploading'
            ? props.files?.length === 1
              ? shortenString(props.files[0].name, 30)
              : 'many files'
            : 'Loading files...'}
        </div>
        <UrlCopyComponent url={uuid != null ? getUrl() : ''} />
        <button className="button" onClick={props.onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ModalContent;
