# heecsbot-v14 🚀✨

![Discord.js v14](https://img.shields.io/badge/Discord.js-v14-blue)
![Node.js v16+](https://img.shields.io/badge/Node.js-v16%2B-brightgreen)
![License MIT](https://img.shields.io/badge/license-MIT-green)

---

## English Version 🇺🇸

### heecsbot-v14 — Advanced Discord Slash Command Bot Template

**heecsbot-v14** is a robust Discord bot built with Discord.js v14, optimized for seamless slash command handling. Ideal starter template for developers aiming for scalable, maintainable, and clean Discord bots.

---

### Table of Contents

- [Features](#features)  
- [Prerequisites](#prerequisites)  
- [Installation & Setup](#installation--setup)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  
- [Acknowledgements](#acknowledgements)  

---

### Features ✨

- Clean and efficient slash command management.  
- Modular architecture for easy scalability and maintenance.  
- Environment variables support via `.env` for secure configuration.  
- Built-in event handlers for common Discord events.  
- Actively maintained, with new features coming soon.  

---

### Prerequisites 🚦

- Node.js v16 or higher installed.  
- A Discord bot token obtained from the [Discord Developer Portal](https://discord.com/developers/applications).  
- Your bot’s `CLIENT_ID`, `GUILD_ID`, `DEV_ID`, and MongoDB connection URI (if used).

---

### Installation & Setup ⚙️

```bash
git clone https://github.com/Hoocs151/heecsbot-v14.git
cd heecsbot-v14
npm install
````

Create a `.env` file in the root directory with the following content:

```env
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-client-id
GUILD_ID=your-guild-id
DEV_ID=your-dev-id
MONGODB=your-mongodb-uri
```

Start the bot:

```bash
npm start
```

---

### Usage 📌

* Add new slash commands in `src/commands`.
* Add or customize event handlers in `src/events`.
* Extend and adapt as needed for your project.

---

### Contributing 🤝

Contributions, bug reports, and feature requests are welcome! Feel free to open issues or submit pull requests.

---

### License 📜

This project is licensed under the MIT License — free to use, modify, and distribute.

---

### Contact 📬

Find me on GitHub: [Hoocs151](https://github.com/Hoocs151)

---

### Acknowledgements 🙏

Inspired by [DiscordBotV14-template](https://github.com/Kkkermit/DiscordBotV14-template). Big thanks to the open-source community!

---

![GitHub stars](https://img.shields.io/github/stars/Hoocs151/heecsbot-v14?style=social)
![GitHub forks](https://img.shields.io/github/forks/Hoocs151/heecsbot-v14?style=social)
![GitHub issues](https://img.shields.io/github/issues/Hoocs151/heecsbot-v14)