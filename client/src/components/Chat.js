import { useContext, useEffect, useRef, useState } from "react"
import {BiSend} from "react-icons/bi"
import { context } from "../App"

export const Chat = ({msgs}) => {
  const { name,socket } = useContext(context)
  const msgRef = useRef()
  const msgsContainerRef = useRef()


  const sendMsg = (e) => {
    
    if(msgRef.current.value.trim() === "") return
    const data = {
      name : name,
      msg : msgRef.current.value 
    }
    socket.emit("msg",data)
    msgRef.current.value = ""
    msgRef.current.focus()
  }
  const handleEnterKey = (e) => {
    if(e.key === "Enter"){
      sendMsg()
    }
  }
  return (
    <div className="chat-container">
      <div ref={msgsContainerRef} className="msgs">
        {msgs.map(msg=>{
          return <div className="msg" key={Math.random()}>
            <div className="msg-name">{msg.name}</div>
              <div className="msg-content">{msg.msg}</div>
          </div>
        })}
      </div>
      <div className="inputs">
        <textarea onKeyDown={handleEnterKey} cols={1} rows={1} ref={msgRef} className="msg-input" type="text" placeholder="enter a message" />
        <div onClick={sendMsg} className="send-icon-container">
          <BiSend className="send-icon" />
        </div>
      </div>
    </div>
  )
}
