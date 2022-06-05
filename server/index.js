const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const {v4 : uuid} = require("uuid")
const io = new Server(server,{
    cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
});
const cors = require('cors')

app.use(cors())

io.on('connection', (socket) => {
  console.log(socket.id + " is connected");
  socket.on("create",data=>{
    console.log(data)
    const roomID = uuid()
    socket.join(roomID)
    socket.emit("creator",{
        roomID,
    })
  })
  socket.on("join",data=>{
    if(io.of("/").adapter.rooms.has(data.roomID)){
        const roomID = data.roomID
        socket.username = data.name
        socket.join(roomID)
        socket.emit("joiner",{ok:true,roomID:roomID,...data})
        socket.to(roomID).emit("join-room",{ok:true,...data})
    }
    else{
        socket.emit("joiner",{ok:false,msg:"roomID is not existed, please check your room ID or create new meet"})
    }  
  })
  socket.on("send",data=>{
    console.log(data)
    socket.to(data.roomID).emit("recv",data)
  })
  socket.on("disconnect",()=>{
      console.log(socket.id + " disconnected")
  })
});


const port = process.env.PORT || 3001
server.listen(port, () => {
  console.log(`server open at port ${port} `);
});