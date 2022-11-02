# Steps to run in development mode
1. Install node dependencies
2. install, configure and run ngrok
3. Add a .env file. See .env.example for reference
4. Add all the required files. See the list below
5. Run the bot using `npm run dev`

# Steps to run in production mode
1. Install node dependencies
2. install, configure and run ngrok in one screen session
3. Add a .env file. See .env.example for reference
4. Add all the required files. See the list below
5. Run the bot using `npm run start`. Preferrably in a screen session :)

# List of files required to run the bot
- .env
- resources/secretVideos.json           # file containing the list of secret videos as objects array: `[{name: "Nazvanie", url: "URL_TO_YT_VIDEO"}]`
- resources/tg_rassilka_tochnii.rtf     # this is a file you send me :) i just renamed it from kirrilic to latin
