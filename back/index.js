const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = 8080;
const bodyParser = require('body-parser');

// all users are stored here along with references to respecitive chat id's
let users = [{username: 'sushma', password: 'sushma', chats: {}}, {username: 'preetham', password: 'preetham', chats: {}}, {username: 'mucchala', password: 'mucchala', chats: {}}, {username: 'john', password: 'john', chats: {}}];


// contains all the username, it is done so to make checking and send list easier
let list = ['sushma', 'preetham', 'mucchala', 'john'];


// contains all the chats with chat id's as key
let chats = {};

// body-parser middleware
// parse application/x-www-form-urlencodeds
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// setting cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

// checks if username exists or not
function findUser(username) {
    return list.indexOf(username) === -1;

}

// matches username and password to log user in
function match(username, password) {
    for (let i=0; i<users.length; i++){
        if (users[i].username === username && users[i].password === password) {
            return true
        }
    }

    return false;
}

// function to signup user
app.post('/api/signup', (req, res)=> {
    if (!req.body.username || !req.body.password || typeof (req.body.password) !== 'string' || typeof (req.body.username) !== 'string' || req.body.username.length > 10 || req.body.password.length > 10 || req.body.username.includes(' ') || req.body.password.length < 4 || req.body.username.length < 4) {
        return res.status(400).json({
            error: 'Required fields not provided'
        })
    }

    let user = {
        username: req.body.username,
        password: req.body.password,
        chats: {}
    };

    // checks if user exits or not
    if (findUser(req.body.username)) {
        users.push(user);
        list.push(user.username);
        return res.status(200).json({
            message: 'User successfully created'
        })
    }

    return res.status(409).json({
        error: 'User already exists'
    })
});


// function to log user in
app.post('/api/login', (req, res) => {
    if (!req.body.username || !req.body.password || typeof (req.body.password) !== 'string' || typeof (req.body.username) !== 'string' || req.body.username.length > 10 || req.body.password.length > 10 || req.body.username.includes(' ') || req.body.password.length < 4 || req.body.username.length < 4) {
        return res.status(400).json({
            error: 'Required fields not provided'
        })
    }

    // matches username and password
    if (match(req.body.username, req.body.password)) {
        return res.status(200).json({
            message: 'Login successful'
        })
    }

    return res.status(400).json({
        error: 'Invalid username/password'
    })
});

// on connection, join the user to a room
io.on('connection', (socket) => {
    console.log('user connected');

    // join this connection in a room whose name is equal to user's username
    socket.join(socket.handshake.query.username);

    // sends back the list of all the usernames present in system
    socket.on('sendList', () => {
        io.emit('list', list);
    });

    // sends back the chats of the user
    socket.on('allChats', (data) => {
        for (let i=0; i<users.length; i++) {
            if (users[i].username === data) {
                let chatsToSend = {};
                for (const [key, value] of Object.entries(users[i].chats)) {
                    chatsToSend[key] = chats[value];
                }
                socket.emit('allChats', chatsToSend);
            }
        }
    });

    // recieves new messages, adds it to respective chat object.
    // If chat object not present, create a new chat object
    socket.on('sendPrivate', (data) => {
        if (data.message.message.trim().length === 0 || data.message.message.trim().length > 500) {
            return;
        }

        data['message']['message'] = data['message']['message'].trim();
        let chat = [];
        for (let i=0; i<users.length; i++) {
            if (users[i].username === data.sender) {
                if (data.receiver in users[i].chats) {
                    chats[users[i].chats[data.receiver]].push(data.message)
                } else {
                    let found = false;
                    for (let j=0; j<users.length; j++) {
                        if (users[j].username === data.receiver) {
                            users[j].chats[data.sender] = `${data.sender}-${data.receiver}`;
                            users[i].chats[data.receiver] = `${data.sender}-${data.receiver}`;
                            chats[`${data.sender}-${data.receiver}`] = [data.message];
                            found = true
                        }
                    }

                    if (!found) {
                        return
                    }

                }

                chat = chats[users[i].chats[data.receiver]]
            }
        }

        // send the new chats to the receiver
        socket.to(data.receiver).emit('updateChat', {chats: chat, chatName: `${data.sender}`});
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    })
});

server.listen(port, () => console.log(`Listening on port ${port}`));