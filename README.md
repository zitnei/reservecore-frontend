# ReserveCore Frontend

[ReserveCore](https://github.com/zitnei/ReserveCore) (Spring Boot 予約管理 API) のフロントエンド。
Next.js (App Router) + TypeScript + Tailwind CSS。

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss&logoColor=white)

> 🎯 **このリポジトリの目的**
> バックエンド API を「面接官が実際に触れる」状態にするためのデモ UI。
> 認証 → 店舗閲覧 → 予約作成 → キャンセル、ADMIN による店舗・スタッフ管理まで一通り操作できます。

---

## 🚀 ライブデモ

**👉 https://reservecore-frontend.vercel.app**

ログインしてすぐ予約フローを体験できます（デモデータ投入済み）。

| ロール | メールアドレス | パスワード |
|---|---|---|
| 管理者 (ADMIN) | `admin@reservecore.com` | `admin1234` |
| スタッフ (STAFF) | `staff.sato@reservecore.com` | `password123` |
| 顧客 (CUSTOMER) | `customer.tanaka@reservecore.com` | `password123` |

> ⚠️ バックエンド (Render Free) は 15 分アクセスがないとスリープします。
> 初回アクセスは起動に **30秒〜1分** かかることがあります（2回目以降は高速）。
> 公開デモ用の認証情報です。

---

## 機能

| URL | 機能 | アクセス可 |
|---|---|---|
| `/` | ランディングページ | 全員 |
| `/login` `/register` | 認証 | 未ログイン |
| `/stores` | 店舗一覧 | ログイン済 |
| `/stores/[id]` | 店舗詳細 + 予約作成 | ログイン済 |
| `/reservations` | マイ予約 + キャンセル | ログイン済 |
| `/admin` | 管理ダッシュボード | ADMIN/STAFF |
| `/admin/stores` | 店舗一覧 + 作成 (ADMIN) | ADMIN/STAFF |
| `/admin/stores/[id]/manage` | サービス追加・スタッフ割当 | ADMIN/STAFF |
| `/admin/users` | ユーザー一覧 | ADMIN |

---

## ローカル開発

### 前提
- Node.js 20+ (検証は v24)
- バックエンド (ReserveCore) がローカル `http://localhost:8080` で起動していること

### バックエンドを起動
別ターミナルで:
```bash
cd path/to/ReserveCore
docker compose up
```

### フロントエンドを起動
```bash
git clone https://github.com/<your-user>/reservecore-frontend.git
cd reservecore-frontend
npm install
cp .env.local.example .env.local
npm run dev
# → http://localhost:3000
```

---

## 環境変数

| Key | デフォルト | 説明 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | バックエンド API のベース URL |

---

## アーキテクチャ

```
src/
├── app/                    # App Router ページ
│   ├── layout.tsx          # 日本語ロケール、AuthProvider 組込、Header/Footer
│   ├── page.tsx            # ランディング
│   ├── login/  register/   # 認証
│   ├── stores/             # 顧客フロー (一覧/詳細/予約作成)
│   ├── reservations/       # マイ予約 + キャンセル
│   └── admin/              # ADMIN/STAFF 用管理画面
├── components/
│   ├── Header.tsx          # ロール別ナビゲーション
│   ├── Footer.tsx
│   └── ErrorBanner.tsx     # 統一エラー表示 (fieldErrors 展開)
└── lib/
    ├── types.ts            # バックエンド DTO 対応の TS 型
    ├── api.ts              # fetch ラッパー: JWT 自動付与、401 自動ログアウト
    ├── auth.ts             # login / register / logout
    ├── auth-context.tsx    # React Context (useAuth)
    ├── endpoints.ts        # エンドポイント別ラッパー (stores/services/staff/reservations/users)
    └── use-require-auth.ts # 未認証時 /login へ自動リダイレクト
```

### 認証

- JWT を `localStorage` に保持 (`reservecore.token`)
- `apiFetch` が自動で `Authorization: Bearer <token>` を付与
- 401 を受けたらトークン破棄 + `/login?expired=1` へリダイレクト

### エラー処理

- `ApiError` クラスで `status + message + fieldErrors` を保持
- `ErrorBanner` コンポーネントがフィールドエラー (`@Valid` 由来) も展開表示

---

## デプロイ (Vercel)

1. このリポジトリを GitHub に push
2. [Vercel Dashboard](https://vercel.com/new) → Import Project
3. Environment Variables に追加:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://<your-api>.onrender.com
   ```
4. Deploy
5. デプロイ完了後の URL を、バックエンドの `CORS_ALLOWED_ORIGINS` に追加

詳細手順は [バックエンドの DEPLOYMENT.md](https://github.com/zitnei/ReserveCore/blob/master/DEPLOYMENT.md) を参照。

---

## 関連

- [ReserveCore (バックエンド)](https://github.com/zitnei/ReserveCore) — Spring Boot + PostgreSQL
