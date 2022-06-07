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
    socket.name = data.name
    socket.roomID = roomID
    socket.role = 0
    socket.join(roomID)
    socket.emit("creator",{
        roomID,...data
    })
  })
  socket.on("join",data => {
    if(io.of("/").adapter.rooms.has(data.roomID)){
        const roomID = data.roomID
        socket.name = data.name
        socket.roomID = data.roomID
        socket.role = 1
        socket.join(roomID)
        console.log(data)
        socket.emit("joiner",{ok:true,roomID:roomID,...data})
        socket.broadcast.to(roomID).emit("join-room",{ ok : true, name : data.name })
        let connectedUsersData;
        io.in(roomID).fetchSockets().then(sockets=>{
          connectedUsersData = sockets.map(s=>{
            return {name : s.name,role:s.role,id:Math.random()}
          })
          socket.emit("users-data",{users : connectedUsersData})
        })
    }
    else{
        socket.emit("joiner",{ok:false,msg:"roomID is not existed, please check your room ID or create new meet"})
    }  
  })
  socket.on("send-peerID",data=>{
    console.log(data)
    socket.to(data.roomID).emit("recv-peerID",data)
  })
  socket.on("join-room",data=>{
    socket.to(data.roomID).emit("join-room")
  })
  socket.on("msg",data=>{
    io.to(socket.roomID).emit("msg",data)
  })
  socket.on("disconnect",()=>{
      console.log(socket.id + " disconnected")
      socket.to(socket.roomID).emit("leave-room",{name:socket.name})
      socket.leave(socket.roomID)
  })
});


const port = process.env.PORT || 3001
server.listen(port, () => {
  console.log(`server open at port ${port} `);
});