import './globals.css'

export const metadata = {
  title: 'ファミリー週末スケジュール',
  description: '家族で共有する週末スケジュール管理アプリ',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
