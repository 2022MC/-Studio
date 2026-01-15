const http = require('http');
require('dotenv').config();

// Simple HTTP Server for Render Health Check
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Discord Bot is Alive!');
  res.end();
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Web server running on port ${process.env.PORT || 3000}`);
});
const { Client, GatewayIntentBits, Collection, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const ffmpegPath = require('ffmpeg-static');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs'); // Import fs for checking cookies

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Setup DisTube with Debugging
const distube = new DisTube(client, {
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [
    new SpotifyPlugin(),
    new SoundCloudPlugin(),
    new YtDlpPlugin({ update: false }),
  ],
  // 🔧 Debug Configurations
  savePreviousSongs: true,
  ffmpeg: {
    path: ffmpegPath, // Use ffmpeg-static path explicitly
  },
  // 🚀 Performance & Cookies
  ...(fs.existsSync('cookies.json') ? { youtubeCookie: JSON.parse(fs.readFileSync('cookies.json', 'utf-8')) } : {}),
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);

  // Register Slash Commands locally on startup (easiest for single server)
  const commands = [
    new SlashCommandBuilder()
      .setName('play')
      .setDescription('เล่นเพลงจาก YouTube/Spotify/SoundCloud')
      .addStringOption(opt => opt.setName('query').setDescription('ชื่อเพลง หรือ URL').setRequired(true)),
    new SlashCommandBuilder().setName('stop').setDescription('หยุดเล่นและล้างคิว'),
    new SlashCommandBuilder().setName('skip').setDescription('ข้ามเพลงปัจจุบัน'),
    new SlashCommandBuilder().setName('queue').setDescription('ดูคิวเพลง'),
    new SlashCommandBuilder()
      .setName('volume')
      .setDescription('ปรับระดับเสียง')
      .addIntegerOption(opt => opt.setName('level').setDescription('ความดัง 0-100').setRequired(true)),
    new SlashCommandBuilder().setName('disconnect').setDescription('สั่งให้บอทออกจากห้องเสียง'),
    new SlashCommandBuilder().setName('help').setDescription('ดูคำสั่งทั้งหมด'),
    new SlashCommandBuilder().setName('247').setDescription('เปิด/ปิด โหมด 24/7 (ไม่ให้ออกห้อง)'),
    new SlashCommandBuilder().setName('uptime').setDescription('ดูเวลาทำงานของบอท'),
    new SlashCommandBuilder().setName('debug').setDescription('ดูข้อมูล Debug'),
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

// Interaction Handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const voiceChannel = interaction.member.voice.channel;

  if (commandName === 'play') {
    if (!voiceChannel) return interaction.reply({ content: '❌ ต้องเข้า Voice Channel ก่อน!', ephemeral: true });

    const query = interaction.options.getString('query');
    await interaction.deferReply(); // รอสักครู่...

    try {
      await distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel,
        interaction,
      });
      await interaction.editReply('🔎 กำลังค้นหา...');
    } catch (e) {
      try {
        await interaction.editReply(`❌ Error: ${e.message}`);
      } catch (err) {
        console.error('Failed to send error message:', err);
      }
    }
  }

  else if (commandName === 'stop') {
    const queue = distube.getQueue(interaction.guild);
    if (!queue) return interaction.reply({ content: '❌ ไม่มีเพลงเล่นอยู่', ephemeral: true });
    queue.stop();
    interaction.reply('⏹️ หยุดเล่นแล้ว');
  }

  else if (commandName === 'skip') {
    const queue = distube.getQueue(interaction.guild);
    if (!queue) return interaction.reply({ content: '❌ ไม่มีเพลงเล่นอยู่', ephemeral: true });
    try {
      await queue.skip();
      interaction.reply('⏭️ ข้ามเพลง!');
    } catch {
      queue.stop();
      interaction.reply('⏹️ เพลงหมดแล้ว');
    }
  }

  else if (commandName === 'queue') {
    const queue = distube.getQueue(interaction.guild);
    if (!queue) return interaction.reply({ content: '❌ คิวว่าง', ephemeral: true });
    const q = queue.songs.map((song, i) => `${i === 0 ? 'กำลังเล่น:' : `${i}.`} ${song.name} - \`${song.formattedDuration}\``).slice(0, 10).join('\n');
    interaction.reply(`**รายการเพลงในคิว:**\n${q}`);
  }

  else if (commandName === 'volume') {
    const queue = distube.getQueue(interaction.guild);
    if (!queue) return interaction.reply({ content: '❌ ไม่มีเพลงเล่นอยู่', ephemeral: true });
    const vol = interaction.options.getInteger('level');
    queue.setVolume(vol);
    interaction.reply(`🔊 Volume: ${vol}%`);
  }

  else if (commandName === 'debug') {
    interaction.reply(`debug: Node ${process.version}, DisTube v5`);
  }

  else if (commandName === 'disconnect') {
    distube.voices.leave(interaction.guild);
    interaction.reply('👋 บ๊ายบายยย~');
  }

  else if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('ℹ️ คำสั่งทั้งหมด')
      .addFields(
        { name: '/play <ชื่อ/Link>', value: 'เล่นเพลงจาก YouTube/Spotify/SoundCloud' },
        { name: '/stop', value: 'หยุดเล่นและล้างคิว' },
        { name: '/skip', value: 'ข้ามเพลง' },
        { name: '/queue', value: 'ดูรายการเพลงในคิว' },
        { name: '/volume <0-100>', value: 'ปรับระดับเสียง' },
        { name: '/disconnect', value: 'เตะบอทออกจากห้อง' },
        { name: '/247', value: 'เปิด/ปิด โหมดอยู่ยาว (ไม่ให้ออกเอง)' },
        { name: '/uptime', value: 'ดูเวลาการทำงานของบอท' }
      );
    interaction.reply({ embeds: [embed] });
  }

  else if (commandName === 'uptime') {
    const days = Math.floor(client.uptime / 86400000);
    const hours = Math.floor(client.uptime / 3600000) % 24;
    const minutes = Math.floor(client.uptime / 60000) % 60;
    const seconds = Math.floor(client.uptime / 1000) % 60;
    interaction.reply(`🕒 **Uptime:** ${days}d ${hours}h ${minutes}m ${seconds}s`);
  }

  else if (commandName === '247') {
    // Toggle logic: Invert the current setting of 'leaveOnEmpty'
    // DisTube options are global, but we can try to set it.
    // However, usually we set this on the QUEUE or VOICE connection.
    // DisTube's voice manager handles this.
    // A simple hack: toggle distube.options.leaveOnEmpty
    distube.options.leaveOnEmpty = !distube.options.leaveOnEmpty;
    distube.options.leaveOnStop = !distube.options.leaveOnStop;

    // Also update current voice connection if exists
    const queue = distube.getQueue(interaction.guild);
    if (queue) {
      queue.voice.leaveOnEmpty = distube.options.leaveOnEmpty;
    }

    const status = !distube.options.leaveOnEmpty ? '🟢 **เปิด**' : '🔴 **ปิด**';
    interaction.reply(`${status} โหมด 24/7 (Stay in Voice)\n(บอทจะไม่ new ออกจากห้องเองแล้วครับ)`);
  }


});

// Events
distube
  .on('playSong', (queue, song) => {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎵 กำลังเล่น')
      .setDescription(`[${song.name}](${song.url})`)
      .setThumbnail(song.thumbnail)
      .addFields({ name: 'ความยาว', value: song.formattedDuration, inline: true });
    queue.textChannel?.send({ embeds: [embed] });
  })
  .on('addList', (queue, playlist) => {
    queue.textChannel?.send(`✅ เพิ่ม Playlist **${playlist.name}** (${playlist.songs.length} เพลง) เข้าคิวแล้วครับ!`);
  })
  .on('addSong', (queue, song) => {
    // Don't spam if using interaction, usually handled by reply
    // But good for confirmation
    queue.textChannel?.send(`✅ เพิ่ม **${song.name}** เข้าคิวแล้วครับ!`);
  })
  .on('error', (error, queue) => {
    console.error('DisTube Error:', error);
    queue?.textChannel?.send(`❌ Error: ${error.message}`);
  })

  .on('ffmpegDebug', (text) => {
    // console.log('FFmpeg:', text); // Uncomment to see FFmpeg logs
  });

client.login(process.env.DISCORD_TOKEN);
