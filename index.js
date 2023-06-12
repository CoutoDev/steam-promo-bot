require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const token = process.env.DISCORD_APP_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async c => {
	try {
		cron.schedule('* * * * * *', async () => {
			const channel = await c.channels.fetch('824302971914289194');

			const steamPromotions = await axios.get('https://store.steampowered.com/contenthub/ajaxgetcontenthubdata', {
				headers: {
					key: process.env.STEAM_KEY,
				},
				params: { hubtype: 'specials' },
			});
			const { dailyDeals } = steamPromotions.data;

			if (!dailyDeals) {
				await channel.send('@player Infelizmente hoje não temos joguinhos em promoção.');
				return;
			}

			await channel.send('@player\n Promoções do dia:');

			dailyDeals.forEach(async (el) => {
				if (el.item.type !== 'app') return;

				const appDetails = await axios.get('https://store.steampowered.com/api/appdetails', {
					headers: {
						key: process.env.STEAM_KEY,
					},
					params: { appids: el.item.id },
				});

				const appData = appDetails.data[el.item.id].data;

				await channel.send(`${appData.name}\n${appData.short_description}\n${appData.price_overview.initial_formatted}\n${appData.price_overview.final_formatted}\nDesconto de: ${appData.price_overview.discount_percent}% \n${appData.capsule_image}
				`);
			});
		});
		// Log in to Discord with your client's token
		client.login(token);
	}
	catch (error) {
		console.error(error);
	}
});


