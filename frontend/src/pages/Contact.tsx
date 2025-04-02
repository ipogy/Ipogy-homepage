import React, { useState } from 'react';
import styles from './Contact.module.css';
import { Helmet } from 'react-helmet-async';

interface FormData {
    name: string;
    email: string;
    message: string;
}

const Contact: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: '',
      });
      const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
    
      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
        }));
      };
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionStatus('送信中...');
    
        try {
          const response = await fetch(`${__API_BASE_URL__}/contact`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
    
          if (response.ok) {
            const data = await response.json();
            setSubmissionStatus(data.message || 'お問い合わせを送信しました。');
            setFormData({ name: '', email: '', message: '' }); // フォームをリセット
          } else {
            const errorData = await response.json();
            setSubmissionStatus(errorData.error || 'お問い合わせの送信に失敗しました。');
          }
        } catch (error) {
          console.error('お問い合わせフォーム送信エラー:', error);
          setSubmissionStatus('お問い合わせの送信中にエラーが発生しました。');
        }
      };


  return (
  <div className="page-container">
              <Helmet>
                <title> Contact | Ipogy </title>
              </Helmet>
      <div className={styles.contactPageWrapper}>
      <div className={styles.contactContainer}>
      <h1>お問い合わせ</h1>
      <p><strong>※必要事項をご記入の上、送信ボタンを押してください。</strong></p>
      {submissionStatus && <p className={`${styles.submissionStatus} ${submissionStatus.includes('成功') ? styles.success : styles.error}`}>{submissionStatus}</p>}
      <form onSubmit={handleSubmit} className={styles.contactForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">氏名</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="例：山田太郎" //プレースホルダー追加
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">メールアドレス</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="例：taro.yamada@example.com"//プレースホルダー追加
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="message">お問い合わせ内容</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={10}
            required
            placeholder="お問い合わせ内容をご記入ください" //プレースホルダー追加
          ></textarea>
        </div>
        <div className={styles.submitButtonWrapper}>
            <button type="submit" className={styles.submitButton}>送信</button>
        </div>
      </form>
      </div>
    </div>
  </div>
  );
};

export default Contact;