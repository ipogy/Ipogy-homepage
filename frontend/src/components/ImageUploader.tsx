import React, { useState, useCallback, useRef } from 'react';
import styles from './ImageUploader.module.css';

const ImageUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResponse, setUploadResponse] = useState<{ url?: string; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState('');
  const [figcaption, setFigcaption] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const uploadUrl = `${__API_BASE_URL__}/v1/images`

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setGeneratedCode('');
      setUploadResponse(null);
      setCopySuccess(false);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setGeneratedCode('');
      setUploadResponse(null);
      setCopySuccess(false);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('ファイルを選択してください。');
      return;
    }

    setUploading(true);
    setUploadResponse(null);
    setGeneratedCode('');
    setCopySuccess(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setUploadResponse(data);

      if (response.ok && data.url) {
        console.log('アップロード成功:', data);
        setPreviewUrl(`${__API_BASE_URL__}` + data.url);
        generateCode(`${__API_BASE_URL__}` + data.url, altText, figcaption);
      } else {
        console.error('アップロード失敗:', data.error);
        alert(`アップロードに失敗しました: ${data.error}`);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('ネットワークエラー:', error);
      alert('ネットワークエラーが発生しました。');
      setUploadResponse({ error: 'ネットワークエラーが発生しました。' });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handlePreviewClick = () => {
    if (!selectedFile) {
      fileInputRef.current?.click(); // ファイルが選択されていなければファイル選択ダイアログを開く
    }
  };

  const handleAltTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAltText(event.target.value);
    if (uploadResponse?.url) {
      generateCode(uploadResponse.url, event.target.value, figcaption);
    }
  };

  const handleFigcaptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFigcaption(event.target.value);
    if (uploadResponse?.url) {
      generateCode(uploadResponse.url, altText, event.target.value);
    }
  };

  const generateCode = (url: string, alt: string, caption: string) => {
    const code = `<figure>\n  <img src="${url}" alt="${alt}">\n  <figcaption>${caption}</figcaption>\n</figure>`;
    setGeneratedCode(code);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000); // 2秒後にメッセージを消す
  };

  return (
    <div className={styles.imageUploader}>
      <h2>画像アップローダー</h2>
      <div className={styles.uploadArea}>
        <div
          className={styles.previewContainer}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handlePreviewClick}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="プレビュー" className={styles.previewImage} />
          ) : (
            <div className={styles.previewPlaceholder}>ここにプレビューが表示されます</div>
          )}
        </div>
        <div className={styles.metadataInputs}>
          <label htmlFor="altText">Alt テキスト:</label>
          <input
            type="text"
            id="altText"
            value={altText}
            onChange={handleAltTextChange}
            placeholder="画像の代替テキストを入力"
          />
          <label htmlFor="figcaption">Figcaption:</label>
          <textarea
            id="figcaption"
            value={figcaption}
            onChange={handleFigcaptionChange}
            placeholder="画像の説明を入力"
          />
        </div>
      </div>
      <div className={styles.uploadControls}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        <button type="button" onClick={handleButtonClick} disabled={uploading}>
          ファイルを選択
        </button>
        <button type="button" onClick={handleUpload} disabled={uploading || !selectedFile}>
          {uploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </div>

      {uploadResponse?.url && (
        <div className={styles.responseArea}>
          <h3>HTML コード</h3>
          <pre className={styles.code}>{generatedCode}</pre>
          <button type="button" onClick={handleCopyCode} disabled={!generatedCode}>
            コードをコピー
          </button>
          {copySuccess && <span className={styles.copySuccessMessage}>コピーしました！</span>}
        </div>
      )}

      {uploadResponse?.error && (
        <div className={styles.responseArea}>
          <h3>エラー</h3>
          <pre>{JSON.stringify(uploadResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;