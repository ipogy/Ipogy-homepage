import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminLogin.module.css';
import { Helmet } from 'react-helmet-async';
import { toast, ToastContainer } from 'react-toastify';

interface LoginForm {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 送信中フラグ
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    if (name === 'otp') {
      setOtp(value);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true); // 送信開始

    try {
      const response = await fetch(`${__API_BASE_URL__}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setOtpSent(true);
        toast.success('認証コードを送信しました。メールをご確認ください。');
        setIsSubmitting(false); // 送信完了
      } else {
        setLoginError('認証コードの送信に失敗しました。');
        setIsSubmitting(false); // 送信完了
      }
    } catch (error) {
      console.error('OTP送信エラー:', error);
      setLoginError('認証コードの送信中にエラーが発生しました。');
      setIsSubmitting(false); // 送信完了
    }
  };

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true); // 送信開始

    try {
      const response = await fetch(`${__API_BASE_URL__}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        handleSendOtp(e);
      } else {
        const errorData = await response.json();
        setLoginError(errorData.error || 'メールアドレスまたはパスワードが間違っています。');
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      setLoginError('ログイン中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false); // 送信完了
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true); // 送信開始

    try {
      const response = await fetch(`${__API_BASE_URL__}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        const errorData = await response.json();
        setLoginError(errorData.error || '認証コードが間違っています。');
      }
    } catch (error) {
      console.error('OTP検証エラー:', error);
      setLoginError('認証コードの検証中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false); // 送信完了
    }
  };

  return (
    <div className="page-container">
      <Helmet>
        <title>ログイン | Ipogy</title>
      </Helmet>
      <div className={styles.loginFormWrapper}>
        <h1>管理画面 ログイン</h1>
        {loginError && <p className={styles.loginError}>{loginError}</p>}

        {!otpSent ? (
          <form onSubmit={handleInitialLogin} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting} // 送信中はボタンをdisabledにする
            >
              {isSubmitting ? '読み込み中...' : 'ログイン'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="otp">認証コード</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting} // 送信中はボタンをdisabledにする
            >
              {isSubmitting ? '認証中...' : '認証'}
            </button>
          </form>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLogin;