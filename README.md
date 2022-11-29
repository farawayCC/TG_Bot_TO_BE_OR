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


# TODO:
- [X] Verification by phone number
- [X] /help command
- [X] /videos command
- [X] /donate command
- [ ] Improve the parser

# Known issues
- Phone numbers: users are typing pns how they please, together with the fact that there are a low amount of them (around 1%) we can easily cut them and place in a file by hand.

# Current functionality
## User side
- /start command will tell if the user is in the list
  - not found: tells that they might be in a phone list, plesents a way to share a phone
  - found: Thanks the user and send the videos list

## Admin side
- Admin can restart the bot by uploading new files to the dir (js,mjs,json,rtf). This helps to update the list of donaters
- Admin can change a token in .env file in order to swap the functionality to another bot instance (obtained through BotFather)

## Code-wise
- Starts the Express server with node-telegram-bot-api integration
- Builds the needed files from sources on top of a controller.js. 
The results are build by and stored in DonatersInstance and TextsInstance
- Listens for a TG users messages. 
  - on /start: 
    - comparing them agains a prebuild list
    - not found: tells that they might be in a phone list, plesents a way to share a phone
    - found: Thanks the user and send the videos list

  
 
