
Yarn is used instead of NPM, as NPM has a tendency of breaking dependencies.

TO RUN APPLICATION,
First install, using 'yarn install' in both front and back directories.
Then start both the server and frontend, using 'yarn start' in both front and back directories.

Used in Frontend - React.js Framework, react router, jquery, axios(to make api requests), socket.io
Used in backend - node.js, express, socket.io

App.js
Decides what to show based on whether user is logged in or not.

User.js
Parent container to decide whether to show login or signup component based on active tab (by default - login)

Login.js
Sends api request to server, if username and password matches, sets username

Signup.js
Send api request to server for signup. If username already present, server send back 409 code to show conflict.

Tabs.js
Main component which holds all the logic and functions to emit to server. 

Message.js
Displays messages

Tab.js
Returns chat username tabs to click on.

Config.js
All the configuration of the application is stored in this file. Ex-API endpoint

Things to note :
- Username and password are stored in plaintext. No type of encryption is used.

- 4 usernames are hard-coded. They are sushma(password: sushma), mucchala(password: mucchala), preetham(password: preetham) and john(password: john)

- There is no restriction on how many users there can be. Anyone can simply signup, given that the username is available.

- Maximum length is 10 and minimum is 4 for username and password.

- Username and password are case-sensitive

- If there is need to change API-Endpoint or any other configuration, it can be done so in config.js

- Jquery is only for showing and animating, hiding and showing images and error message. At no-point does Jquery interfere with the logic of the application

- No database has been used, instead data is stored in arrays and dictionaries that mimic database.

- There is a constant warning from react that ‘Each child in a list should have a unique "key" prop.’ Which occurs in Messages component. It is because key id of messages is not present. In real case scenario, every message will have an id so that warning is not an issue.

- Chat history of every user will remain saved irrespective of user is logged in or out, given that server is running. 

- When server stops, all the chat history and users(except for hard-coded ones) will get lost.

- Website is not responsive, due to time constraits.
