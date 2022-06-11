import { createContext, useEffect, useState } from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom"
import { io } from "socket.io-client";
import { Create } from "./pages/Create";
import { Creator } from "./pages/Creator";
import { Join } from "./pages/Join";
import { Joiner } from "./pages/Joiner";
import toast, { Toaster } from 'react-hot-toast';

export const url = "http://localhost:3001" 

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
      setUsers(prevUsers=>{
        // role 0 host , role 1 normal
        return [...prevUsers,{name : data.name, id : Math.random(),role:1}]
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
  const hasTheSameName = (theName) => {
    if(msgs){
      const lastMsg = msgs[msgs.length - 1]
      const lastMsgName = lastMsg.name
      return theName === lastMsgName
    }
    return false
  }
  
  return (
    <>
      <context.Provider value={{socket,roomID,setRoomID,users,setUsers,msgs,setMsgs,name,setName}}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Create/>}/>
            <Route path="/:id" element={<Creator toast={toast}/>}/>
            <Route path="/join" element={<Join/>}/>
            <Route path="/join/:id" element={<Joiner toast={toast}/>}/>
          </Routes>
        </BrowserRouter>
      </context.Provider>
      <Toaster />
    </>
  );
}

export default App;
