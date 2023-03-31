const express = require('express');
var cors = require('cors')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const generateRandom = require('./utils/random');

const port = process.env.PORT || 3000;

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});


const socketIdToUser = new Map();
const socketIdToRoomId = new Map();
const socketIdToPeerId = new Map();

app.use(cors());

app.get('/', (req, res) => {
    res.send("ok")
});

app.use('/compile', require('./routes/compiler'));

app.get('/room/:roomId', async (req, res) => {
    var roomId = req.params.roomId;

    //get all room client-sockets
    roomClientSockets = await io.in(roomId).fetchSockets();

    var roomClients = [];

    roomClientSockets.filter((client) => roomClients.push(client.id));
    res.send(roomClients);
});


io.on('connection', (socket) => {
    console.log(socket.id, ' connected');

    /* Create Room */
    socket.on('create-room', () => {
        // Generate Random Room ID
        var roomId = generateRandom()

        // Join Room with random Id
        socket.join(roomId);
        socketIdToRoomId.set(socket.id, roomId);
        console.log(socket.id, ' has joined room ', roomId);

        // Sending response user succesfully join the room
        socket.emit("joined-room", { roomId: roomId });
    });

    /* Join Room */
    socket.on('join-room', async (data) => {
        const { roomId } = data;

        //Get room clients
        roomClients = await io.in(roomId).fetchSockets();

        //room user max 2
        if (roomClients.length < 2) {

            socket.join(roomId);
            socketIdToRoomId.set(socket.id, roomId);
            console.log(socket.id, ' has joined room ', roomId);

            // Sending response user succesfully join the room
            socket.emit("joined-room", { roomId: roomId });
            console.log(roomClients.length);
        }
        else {
            // Sending response room is full
            socket.emit("join-room-error", { message: "room is full" });
            console.log(roomId, ' room is full');
        }
    });


    socket.on("join-meeting", async (data) => {
        const { user, roomId, peerId, } = data;

        socketIdToPeerId.set(socket.id, peerId);
        socketIdToUser.set(socket.id, user);

        //Get room clients
        roomClients = await io.in(roomId).fetchSockets();


        if (roomClients.length == 1) {
            socket.emit("joined-meeting");
            return;
        }


        if (roomClients.length == 2) {
            var anotherClient = roomClients.filter((client) => client.id != socket.id);
            var peer = socketIdToPeerId.get(anotherClient[0].id);
            socket.emit("joined-meeting-call", { peerId: peer });

            for (const index in roomClients) {

                if (roomClients[index].id != socket.id) {
                    var existedUser = socketIdToUser.get(roomClients[index].id)
                    var newUser = socketIdToUser.get(socket.id)
                    // send new user to existed user data
                    socket.emit('recived-existed-user', { user: existedUser });
                    // send existed user to new user data  
                    io.to(roomClients[index].id).emit('new-user-joined', { user: newUser });
                }
            }

        }
    });


    socket.on('code-change', async (data) => {

        const { roomId, code } = data;
        var roomClients = await io.in(roomId).fetchSockets();

        if (roomClients.length == 0) return;
        var anotherClient = roomClients.filter((client) => client.id != socket.id);

        if (anotherClient.length == 0) return;
        io.to(anotherClient[0].id).emit('code-change', { code: code });
    });

    socket.on('send-message', ({ text, username, room }) => {
        io.to(room).emit('recived-message', { text: text, username: username, time: new Date() });
    })



    /* client disconnect */
    socket.on('disconnect', () => {
        var roomId = socketIdToRoomId.get(socket.id);
        var user = socketIdToUser.get(socket.id);
        socket.to(roomId).emit('disconnected', { user: user });
        socketIdToUser.delete(socket.id);
        socketIdToPeerId.delete(socket.id);
        socketIdToRoomId.delete(socket.id);
        console.warn(socket.id, roomId, ' disconnected');
    })


});

server.listen(port, () => console.log(`Example app listening on port ${port}!`));