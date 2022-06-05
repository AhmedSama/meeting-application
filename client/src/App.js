import { createContext, useEffect, useRef, useState } from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom"
import { io } from "socket.io-client";
import { Create } from "./pages/Create";
import { Creator } from "./pages/Creator";
import { Join } from "./pages/Join";
import { Joiner } from "./pages/Joiner";

export const url = "http://localhost:3001" 

export const context = createContext()

function App() {
  const[socket,_] = useState(io(url,{autoConnect:false}))
  const [roomID,setRoomID] = useState(null) 
  useEffect(()=>{
    socket.connect()
    socket.on("join-room",data=>{
      console.log(data)
    })
  },[])
  
  return (
    <context.Provider value={{socket,roomID,setRoomID}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Create/>}/>
          <Route path="/:id" element={<Creator/>}/>
          <Route path="/join" element={<Join/>}/>
          <Route path="/join/:id" element={<Joiner/>}/>
        </Routes>
      </BrowserRouter>
    </context.Provider>
  );
}

export default App;
