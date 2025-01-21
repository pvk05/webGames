import { Server } from 'socket.io';
import chatNsp from './chatNsp.js';

export default function injectSocketIO(server) {
    const io = new Server(server, {
        cors: {
            origin: ["https://sveltesockettest.onrender.com", "http://localhost:3000"],
            
        }
    });

    io.on('connection', (socket) => {
        let username = `User ${Math.round(Math.random() * 999999)}`;
        socket.emit('name', username);

        socket.on('message', (message) => {
            io.emit('message', {
                from: username,
                message: message,
                time: new Date().toLocaleString()
            });
        });
    });

    chatNsp(io)

    console.log('SocketIO injected');
}