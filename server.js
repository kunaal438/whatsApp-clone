// variable assignment...............

const express = require('express');
const path = require('path');
const knex = require('knex');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const fileupload = require('express-fileupload');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'test',
        database: 'chatapp'
    }
})

// current users

let current_users = [];

// init...............

const app = express();


// middleware................

app.use(bodyParser.json());
app.use(session({
    secret: '06D2MP7imE6I8e2n14A7jM6554#C6PA10hoV1o8p',
    resave: false,
    saveUninitialized: false
}));
app.use(fileupload());
app.use(express.static(path.join(__dirname)));

// listening.....

const server = app.listen(press.env.PORT || 3000, () => {
    console.log('listening........');
})

const io = socket(server);

// routes...................

app.get('/', (req, res) => {
    if (req.session.user == null) {
        res.sendFile(path.join(__dirname + "/html" + "/login.html"));
    } else {
        res.redirect('/chating');
    }
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + "/html" + "/register.html"));
})

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            const isGenuine = bcrypt.compareSync(password, data[0].hash);
            if (isGenuine) {
                return db.select('*').from('users')
                    .where('email', '=', email)
                    .then(response => {
                        req.session.user = response[0];
                        res.json(response[0])
                    })
                    .catch(err => res.status(400).json('failed to log in'))
            }
            else {
                res.status(400).json('wrong password');
            }
        })
        .catch(err => res.status(400).json('failed to log in'))
})

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password);
    if (!name.length || !email.length || !password.length) {
        res.json('fill')
    } else {
        db.transaction(trx => {
            trx.insert({
                email: email,
                hash: hash
            })
                .into('login')
                .returning('email')
                .then(userEmail => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            name: name,
                            email: userEmail[0]
                        })
                        .then(data => {
                            req.session.user = data[0];
                            res.json(data[0])
                        })
                        .then(trx.commit)
                        .catch(trx.rollback)
                })
                .catch(err => {
                    res.json(err)
                });
        })
    }
})

app.get('/chating', (req, res) => {
    if (req.session.user == null) {
        res.redirect('/');
    } else {
        res.sendFile(path.join(__dirname + '/html' + '/chating.html'));
        // console.log(req.session.user.email);
    }
})

app.get('/chat', (req, res) => {
    if (req.session.reciver && req.session.user) {
        res.sendFile(path.join(__dirname, "/html", "/chat.html"));
    } else {
        res.redirect('/');
    }
})

app.post('/chat-room', (req, res) => {
    const { id, name, email, dp } = req.body;
    req.session.reciver = {
        id: id,
        name: name,
        email: email,
        dp: dp
    };
    res.json('success');

})

app.post('/insert-chat', (req, res) => {
    const { msg } = req.body;

    if (!msg.length) {
        res.json('no length');
    } else {
        db('chats')
            .returning('*')
            .insert({
                sender: req.session.user.email,
                reciever: req.session.reciver.email,
                msg: msg
            })
            .then(data => {
                res.json(data[0]);
            })
            .catch(err => console.log(err));
    }

})

app.get('/dp', (req, res) => {
    if (req.session.user == null) {
        res.redirect('/');
    } else {
        res.sendFile(path.join(__dirname + '/html' + '/image.html'));
    }
})

app.post('/getting-chats', (req, res) => {
    db.select('*').from('chats')
    .where({
        sender: req.session.user.email,
        reciever: req.session.reciver.email 
    })
    .orWhere({
        sender: req.session.reciver.email,
        reciever: req.session.user.email 
    })
    .then(data => {
        res.json(data);
    })
    .catch(err => console.log(err));
})

app.post('/user-profile', (req, res) => {
    res.json(req.session.user);
})

app.post('/reciever-profile', (req, res) => {
    req.session.reciver.sender = req.session.user.email;
    req.session.reciver.sender_name = req.session.user.name;
    res.json(req.session.reciver);
})

app.post('/filter', (req, res) => {
    const { value } = req.body;

    db.select('*').from('users')
        .where('name', 'like', `${value}%`)
        .orWhere('name', 'like', `%${value}`)
        .orWhere('name', 'like', `%%${value}%%`)
        .then(data => {
            let information = [data, req.session.user.email]
            res.json(information);
        })
        .catch(err => res.json('err'))
})

app.post('/upload', (req, res) => {
    let file = req.files.photo;
    let date = new Date();
    let path = './uploads/' + date.getDate() + date.getTime() + file.name;
    file.mv(path, (err, result) => {
        if (err) {
            throw err;
        } else {
            db.select('*').from('users')
                .where('email', '=', req.session.user.email)
                .update({
                    dp: path
                })
                .then(data => {
                    req.session.user.dp = path;
                    res.send({
                        success: true,
                        msg: file.name
                    })
                })
                .catch(err => console.log(err));
        }
    })
});

app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/html", "/profile.html"));
    } else {
        res.sendFile(path.join(__dirname, "/html", "/login.html"));
    }
})

app.post('/update-profile', (req, res) => {
    const { name } = req.body;

    if (!name.length) {
        res.json('fill the input');
    } else {
        db.select('*').from('users')
            .returning('*')
            .where('name', '=', req.session.user.name)
            .update({
                name: name
            })
            .then(data => {
                req.session.user = data[0];
                res.json(data[0])
            })
            .catch(err => res.json('err in updating'));
    }
})

io.on('connection', (socket) => {
    console.log('connected', socket.id);
    
    socket.on('user-join', (username) => {
        current_users[username] = socket.id;

        console.log(current_users);
    })

    socket.on('chat', (data) => {

        let socketID = current_users[data.reciever];
        let date = new Date();
        let chat = {
            sender: data.sender,
            sender_name: data.sender_name,
            reciever: data.reciever,
            reciever_name: data.reciever_name,
            msg: data.msg,
            hour: date.getHours(),
            min: date.getMinutes()
        };

        io.to(socketID).emit('new-msg', chat);
    })

    socket.on('disconnect', () => {
        delete current_users[socket.id];
     });
})