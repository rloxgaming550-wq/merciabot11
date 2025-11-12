// ==============================
// Lera Roleplay Discord Ticket Botu
// ==============================

const { 
  Client, GatewayIntentBits, Partials, 
  ButtonBuilder, ButtonStyle, ActionRowBuilder, 
  Events, EmbedBuilder 
} = require('discord.js');
const express = require('express');
require('dotenv').config();

// ==============================
// Express Sunucusu (Koyeb'in botu aktif tutması için)
// ==============================
const app = express();
app.get('/', (req, res) => res.send('Lera Roleplay Bot Aktif!'));
app.listen(process.env.PORT || 8080, () => console.log("✅ Web sunucusu aktif."));

// ==============================
// Discord Bot Ayarları
// ==============================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const ticketCount = {};
const authorizedRoleId = process.env.AUTHORIZED_ROLE_ID;

// ==============================
// Bot Hazır Olduğunda
// ==============================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot aktif: ${client.user.tag}`);
});

// ==============================
// !destek Komutu → Butonlu Menü
// ==============================
client.on(Events.MessageCreate, async (message) => {
  if (message.content === "!destek") {
    const embed = new EmbedBuilder()
      .setTitle("🎟️ Lera Roleplay Destek Sistemi")
      .setDescription("Bir sorunun varsa aşağıdaki butonlardan destek alabilirsin.\nwww.lera-rp.com")
      .setColor("#3498db");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("destek").setLabel("Destek Oluştur").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("malvarlik").setLabel("Mal Varlık").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("oyuncu").setLabel("Oyuncu Şikayeti").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("yetkili").setLabel("Yetkili Şikayeti").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("jailban").setLabel("Jail & Ban İtiraz").setStyle(ButtonStyle.Danger)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ==============================
// Buton Etkileşimleri
// ==============================
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const replies = {
    destek: "✅ Destek talebiniz oluşturuldu! Lütfen bekleyin.",
    malvarlik: "📦 Mal varlık talebiniz alındı!",
    oyuncu: "⚠️ Oyuncu şikayetiniz alındı!",
    yetkili: "🚨 Yetkili şikayetiniz kaydedildi!",
    jailban: "🧾 Jail/Ban itirazınız alındı!"
  };

  if (replies[interaction.customId]) {
    await interaction.reply({ content: replies[interaction.customId], ephemeral: true });
  }
});

// ==============================
// Ticket Kapatma ve Sayaç
// ==============================
client.on(Events.MessageCreate, async (message) => {
  if (message.content.startsWith("!kapat")) {
    if (!message.member.roles.cache.has(authorizedRoleId)) {
      return message.reply("❌ Bu komutu sadece yetkililer kullanabilir.");
    }

    const userId = message.author.id;
    ticketCount[userId] = (ticketCount[userId] || 0) + 1;

    await message.reply(`🎫 Ticket kapatıldı! Toplam kapattığın ticket sayısı: **${ticketCount[userId]}**`);
  }

  if (message.content === "!istatistik") {
    const userId = message.author.id;
    const count = ticketCount[userId] || 0;
    await message.reply(`📊 Toplam kapattığın ticket sayısı: **${count}**`);
  }
});

// ==============================
// Botu Başlat
// ==============================
client.login(process.env.TOKEN);
