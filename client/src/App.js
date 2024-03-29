import { createContext, useEffect, useState } from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom"
import { io } from "socket.io-client";
import { Create } from "./pages/Create";
import { Creator } from "./pages/Creator";
import { Join } from "./pages/Join";
import { Joiner } from "./pages/Joiner";
import toast, { Toaster } from 'react-hot-toast';
import { LinkJoin } from "./pages/LinkJoin";
import { EndCall } from "./pages/EndCall";

export const url = "http://localhost:3001"
// export const url = "https://salty-tor-48866.herokuapp.com/" 

export const context = createContext()

function App() {
  const[socket,_] = useState(io(url,{autoConnect:false}))
  const [roomID,setRoomID] = useState(null) 
  const [users,setUsers] = useState([])
  const [msgs,setMsgs] = useState([])
  const [name,setName] = useState(null)

  useEffect(()=>{
    socket.connect()
  },[])
  useEffect(()=>{
    socket.on("join-room",data=>{
      if(!data) return
      toast(data.name + " just entered the meet",{duration: 7000,
        position: 'top-right',icon: '😃'})
        console.log(data)
      setUsers(prevUsers=>{
        // role 0 host , role 1 normal

        return [...prevUsers,{name : data.name, id : Math.random(),role:1,status : null, handsUp : false}]
      })
      
    })
    socket.on("leave-room",data=>{
      toast(data.name + " has left the meet",{duration: 7000,
        position: 'top-right',icon: '😢'})
      setUsers(prevUsers=>{
        return prevUsers.filter(user=>{
          return user.name !== data.name
        })
      })
    })
  },[])

  
  return (
    <>
      <context.Provider value={{socket,roomID,setRoomID,users,setUsers,msgs,setMsgs,name,setName}}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Create/>}/>
            <Route path="/:id" element={<Creator toast={toast}/>}/>
            <Route path="/join" element={<Join/>}/>
            <Route path="/join/:id" element={<Joiner toast={toast}/>}/>
            <Route path="/link/:roomID" element={<LinkJoin/>}/>
            <Route path="/endcall" element={<EndCall/>}/>
          </Routes>
        </BrowserRouter>
      </context.Provider>
      <Toaster />
    </>
  );
}

export default App;
