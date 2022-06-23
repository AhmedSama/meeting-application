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
    socket.handsUp = false
    socket.status = null
    socket.join(roomID)
    socket.emit("creator",{
        roomID,...data
    })
  })
  socket.on("join",async(data) => {
    const sockets = await io.in(data.roomID).fetchSockets()
    sockets.forEach(s=>{
      if(s.name === data.name){
        data.name = data.name + "#" + Math.floor(Math.random()*100).toString()
      }
    })
    if(io.of("/").adapter.rooms.has(data.roomID)){

        const roomID = data.roomID       
        socket.name = data.name
        socket.roomID = data.roomID
        socket.role = 1
        socket.handsUp = false
        socket.status = null
        socket.join(roomID)
        console.log(data)
        socket.emit("joiner",{ok:true,roomID:roomID,...data})
        socket.broadcast.to(roomID).emit("join-room",{ ok : true, name : data.name })
        let connectedUsersData;
        io.in(roomID).fetchSockets().then(sockets=>{
          connectedUsersData = sockets.map(s=>{
            return {name : s.name,role:s.role,id:Math.random(),status : s.status, handsUp : s.handsUp}
          })
          socket.emit("users-data",{users : connectedUsersData})
        })
    }
    else{
        socket.emit("joiner",{ok:false,msg:"roomID is not existed, please check your room ID or create new meet"})
    }  
  })
  socket.on("send-peerID",data=>{
    data = {...data, socketID : socket.id}
    socket.to(data.roomID).emit("recv-peerID",data)
  })
  socket.on("send-peerIDs",data=>{
    socket.to(data.socketID).emit("recv-peerIDs",{peerIDs : data.peerIDs})
  })
  socket.on("join-room",data=>{
    socket.to(data.roomID).emit("join-room")
  })
  socket.on("msg",data=>{
    io.to(socket.roomID).emit("msg",data)
  })
  socket.on("call-end",data=>{
    socket.to(socket.roomID).emit("call-end",data)
  })
  socket.on("raise-hand",data=>{
    socket.handsUp = !socket.handsUp
    socket.to(socket.roomID).emit("raise-hand",data)
  })
  socket.on("shared-screen",data=>{
    socket.to(socket.roomID).emit("shared-screen",data)
  })

  socket.on("disconnect",()=>{
      console.log(socket.id + " disconnected")
      socket.to(socket.roomID).emit("leave-room",{name:socket.name})
      if(socket.role === 0){
        // ON TEST
        socket.to(socket.roomID).emit("call-end",{end:true})
      }
      socket.leave(socket.roomID)
  })
});


const port = process.env.PORT || 3001
server.listen(port, () => {
  console.log(`server open at port ${port} `);
});