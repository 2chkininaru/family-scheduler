# ファミリー週末スケジュール

家族で共有できる週末スケジュール管理アプリです。

## 📱 スマホでの使用方法（Vercelデプロイ手順）

### ステップ1：GitHubにリポジトリを作成
1. https://github.com にアクセス
2. 右上の「+」 → 「New repository」をクリック
3. リポジトリ名：`family-scheduler`
4. 「Create repository」をクリック

### ステップ2：ファイルをGitHubにアップロード
1. リポジトリページの「Add file」 → 「Upload files」
2. 以下のファイルをすべてアップロード：
   - `package.json`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `next.config.js`
   - `.gitignore`
   - `app/globals.css`
   - `app/layout.js`
   - `app/page.js`
   - `app/WeekendScheduler.js`
3. Commit changes

### ステップ3：Vercelでデプロイ
1. https://vercel.com にアクセス
2. 「Sign Up」でGitHubアカウントで登録
3. 「New Project」をクリック
4. GitHubアカウントを接続
5. 「family-scheduler」リポジトリを選択
6. 「Deploy」をクリック
7. デプロイ完了後、生成されたURLをコピー

### ステップ4：スマホで使用
1. スマホのブラウザ（Safari/Chrome）でそのURLにアクセス
2. ホーム画面に追加（iPhoneはSafariの「共有」→「ホーム画面に追加」）
3. アプリのように使える！

## 🔑 特徴
- ✅ 祝日・GW対応
- ✅ 黒板風の家族連絡ボード
- ✅ サッカー情報（対戦相手、見に行くか、など）
- ✅ 娘との外出（父母別選択、場所、時間）
- ✅ 買い物リスト（チェック機能付き）
- ✅ イレギュラーな日付追加
- ✅ 家族全員で共有可能
- ✅ データは自動保存

## 💾 データ保存
- ブラウザのローカルストレージに自動保存
- 他のデバイスからアクセスすると同じデータが表示される（window.storage API使用）
