# 🎵 Discord Music Bot

Discord Music Bot ที่ใช้ DisTube + yt-dlp สำหรับการเล่นเพลงจาก YouTube, Spotify, SoundCloud

## 📋 Features

- ✅ เล่นเพลงจาก YouTube, Spotify, SoundCloud
- ✅ Queue system (คิวเพลง)
- ✅ Loop mode (เพลงเดียว / ทั้งคิว)
- ✅ Volume control
- ✅ Shuffle
- ✅ Auto-disconnect เมื่อไม่มีคนใน voice channel

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ติดตั้ง yt-dlp (จำเป็น!)

**macOS:**
```bash
brew install yt-dlp
```

**Windows:**
```bash
winget install yt-dlp
```

**Linux:**
```bash
sudo apt install yt-dlp
# หรือ
pip install yt-dlp
```

### 3. ตั้งค่า Bot Token

1. ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. สร้าง Application ใหม่
3. ไปที่ Bot > Reset Token > Copy
4. สร้างไฟล์ `.env`:

```bash
cp .env.example .env
```

5. ใส่ Token ในไฟล์ `.env`:

```
DISCORD_TOKEN=your_bot_token_here
PREFIX=!
```

### 4. เปิด Bot Intents

ใน Discord Developer Portal:
1. ไปที่ Bot
2. เปิด:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT

### 5. Invite Bot ไปยัง Server

1. ไปที่ OAuth2 > URL Generator
2. เลือก Scopes: `bot`, `applications.commands`
3. เลือก Bot Permissions:
   - Send Messages
   - Embed Links
   - Connect
   - Speak
   - Use Voice Activity
4. Copy URL และเปิดใน browser

### 6. รัน Bot

```bash
npm start
```

หรือรันแบบ development (auto-restart):

```bash
npm run dev
```

## 📖 Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `!play <ชื่อ/URL>` | `!p` | เล่นเพลง |
| `!stop` | - | หยุดเล่น |
| `!pause` | - | หยุดชั่วคราว |
| `!resume` | - | เล่นต่อ |
| `!skip` | `!s` | ข้ามเพลง |
| `!queue` | `!q` | ดูคิวเพลง |
| `!volume <0-100>` | `!vol` | ปรับเสียง |
| `!loop <0/1/2>` | `!repeat` | Loop mode |
| `!shuffle` | - | สลับคิว |
| `!nowplaying` | `!np` | เพลงปัจจุบัน |
| `!help` | - | คำสั่งทั้งหมด |

## 🔧 Troubleshooting

### ❌ "yt-dlp not found"
```bash
# ติดตั้ง yt-dlp
brew install yt-dlp  # macOS
```

### ❌ "Opus encoder is not available"
```bash
npm install @discordjs/opus
```

### ❌ YouTube ไม่โหลด / Error 403
รัน update yt-dlp:
```bash
yt-dlp -U
```

## 📄 License

MIT
