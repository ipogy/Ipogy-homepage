# Ipogy's Homepage

私自身のホームページの公開レポジトリです。

<img src="https://api.ipogy.org/api/images/1743619041820-0c42710e.png" width="600" alt="ホームページの画像">


Reactやnode.js、DBなどの仕組みを学び、3層アーキテクチャを意識して開発したホームページです。

管理人のログインに二段階認証を備えており、最新のセキュアな認証システムを実現しています。

## 技術スタック

このホームページは以下の技術スタックで構築されています。

* **フロントエンド:** Vite + React (TypeScript)
* **バックエンド:** Node.js
* **データベース:** PostgreSQL

## キーフィーチャー

* **画像アップロード機能:** ユーザーは画像をアップロードできます。
* **ブログ機能:**
    * ブログ記事の**新規作成**、**編集**、**削除**が可能です。
    * 作成したブログ記事の表示が可能です。
* **管理人用ログインページ:** 管理者専用のログインページを提供します。
* **二段階認証 (2FA):** 管理者ログインには JWT (JSON Web Tokens) と OTP (One-Time Password) を用いた二段階認証を実装し、セキュリティを高めています。
* **パスワードの安全性:** バックエンドではリポジトリ内に存在する `bcrypt.js` を使用してパスワードを安全にハッシュ化して保存しています。
* **レート制限:** `express-rate-limit` を使用して、API への過度なリクエストを制限し、DoS 攻撃などを防御します。
* **メール送信機能:** `nodemailer` を使用して、パスワードリセットや OTP 通知などのメール送信機能を提供します。

## 使い方

### 事前準備

1.  **Backend ディレクトリへの移動:**
    まず、プロジェクトのルートディレクトリから `backend` ディレクトリに移動します。

    ```bash
    cd backend
    ```

2.  **依存関係のインストール:**
    `npm install` コマンドを実行して、バックエンドに必要な Node.js の依存関係をインストールします。本来は不要ですが 3. パスワードの暗号化に必要なため、この時点でインストールしてください。

    ```bash
    npm install
    ```

3.  **パスワードの暗号化:**
    管理者アカウントのパスワードを安全に保存するため、リポジトリ内に存在する `bcrypt.js` を使用して事前に暗号化する必要があります。Node.js 環境で以下のコードを実行して、暗号化されたパスワードを生成してください。

    生成されたハッシュ化されたパスワードは.envで使います。

4.  **データベース初期化ファイル (`db/init.sql`) の作成:**
    `db` ディレクトリに `init.sql` ファイルを作成し、以下の `init-example.sql` の内容を参考に、初期データを記述してください。

5.  **環境変数ファイル (`.env`) の作成と設定:**
    プロジェクトのルートディレクトリに `.env` ファイルを作成し、`env.example` ファイルを参考に、データベース接続情報、JWT シークレットキー、SMTP サーバー情報、管理者アカウント情報などの環境変数をあなたの環境に合わせて設定してください。特に、手順 3 で生成したハッシュ化された管理者パスワードを適切な環境変数に設定する必要があります。

### 起動方法

すべての事前準備が完了したら、プロジェクトのルートディレクトリに戻り、以下のコマンドを実行することでホームページを起動できます。

```bash
docker-compose up -d
```
-d オプションをつけると、バックグラウンドでコンテナが起動します。

## バックエンド (backend/)

バックエンドは Node.js と Express.js をベースに、主に以下の機能を担当しています。

* **API 提供:** フロントエンドとの通信窓口
* **認証・認可:** 管理者ログインとセッション管理 (JWT, OTP)
* **データ処理:** PostgreSQL データベースとの連携 (CRUD)
* **画像処理:** アップロードされた画像の保存と管理
* **ブログ管理:** 記事の作成、編集、削除、取得
* **セキュリティ:** パスワードハッシュ化 (`bcrypt`)、レート制限 (`express-rate-limit`)
* **メール送信:** OTP 通知、パスワードリセットなど (`nodemailer`)

## フロントエンド (frontend/)

フロントエンドは、モダンな JavaScript フレームワークである **React** を中心に、以下の技術を採用し構築しています。

* **UI 構築:** React
* **型安全性:** TypeScript
* **状態管理:** React Hooks など
* **UI デザイン:** Material-UI (MUI)
* **非同期処理:** Axios
* **ルーティング:** React Router DOM
* **通知機能:** react-toastify
* **アイコン:** react-icons
* **ビルドツール:** Vite

これらの技術選定により、パフォーマンスが高く、保守性に優れ、ユーザー体験の良いフロントエンドアプリケーションを開発しました。


## 公開リンク

ホームページ: [**https://ipogy.org**](https://ipogy.org)
