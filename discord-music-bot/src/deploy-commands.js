const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('เล่นเพลงจาก YouTube/Spotify/SoundCloud')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('ชื่อเพลง หรือ URL')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('หยุดเล่นและล้างคิว'),
    new SlashCommandBuilder()
        .setName('skip')
        .setDescription('ข้ามเพลงปัจจุบัน'),
    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('ดูคิวเพลง'),
    new SlashCommandBuilder()
        .setName('volume')
        .setDescription('ปรับระดับเสียง')
        .addIntegerOption(option =>
            option.setName('percent')
                .setDescription('ความดัง 0-100')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('loop')
        .setDescription('ตั้งโหมดวนซ้ำ')
        .addIntegerOption(option =>
            option.setName('mode')
                .setDescription('0: ปิด, 1: เพลงเดียว, 2: ทั้งคิว')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 0 },
                    { name: 'Song', value: 1 },
                    { name: 'Queue', value: 2 }
                )),
    new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('สุ่มเรียงเพลงในคิวใหม่'),
    new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('ดูเพลงที่กำลังเล่น'),
    new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('สั่งให้บอทออกจากห้องเสียง'),
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('ดูคำสั่งทั้งหมด'),
    new SlashCommandBuilder()
        .setName('247')
        .setDescription('เปิด/ปิด โหมด 24/7 (ไม่ให้ออกห้อง)'),
    new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('ดูเวลาทำงานของบอท'),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('⏳ Started refreshing application (/) commands.');

        // Register globally (takes time) or Guild-only (instant)
        // For development, we'll try global to be easiest for user
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // Need CLIENT_ID
            { body: commands },
        );

        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
