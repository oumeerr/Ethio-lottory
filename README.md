# ETHIOLOTTORY BINGO 🎰
Currently Ethiopia's #1 Bingo Game. Join thousands of players, win daily prizes, and enjoy seamless deposits via Telebirr and CBE Birr. 

## 🛠 Today's Latest Updates (May 21, 2026)
- **Official Release**: Final migration to `ETHIOLOTTORY BINGO`.
- **Branding**: Implemented new tri-color **ELB** logo system.
- **Refined Referrals**: Optimized referral system using `t.me` invite links.
- **URL Migration**: Updated all endpoints to point to the new Supabase Edge Function: `https://aqnaafueuloahuituyox.supabase.co/functions/v1/swift-action`.
- **Core User Mapping**: Implemented a mandatory `users` table to ensure strict data integrity between Telegram hits and Profile stats.

## Features

- **Real-time Multiplayer Bingo**: Play live against other players.
- **Classic & Mini Game Modes**: Choose your preferred style of play.
- **Telegram Integration**: Seamless login and notifications via Telegram.
- **Instant Deposits & Withdrawals**: Support for Ethiopian payment providers (Telebirr, CBE Birr).
- **Referral System**: Invite friends to earn bonuses.
- **Leaderboards**: Compete for top rankings.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Express.js, Telegraf (Telegram Bot API)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Google Cloud Run (compatible)

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   WEBHOOK_URL=your_webhook_url
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Start Production Server**
   ```bash
   npm run start
   ```
