import { useContext, useEffect, useRef, useState } from "react"
import {BiSend} from "react-icons/bi"
import { context } from "../App"

export const Chat = ({msgs}) => {
  const { name,socket } = useContext(context)
  const msgRef = useRef()
  const msgsContainerRef = useRef()


  const sendMsg = () => {
    if(msgRef.current.value === "") return
    const data = {
      name : name,
      msg : msgRef.current.value 
    }
    socket.emit("msg",data)
    msgRef.current.value = ""
    msgRef.current.focus()
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
        <textarea ref={msgRef} className="msg-input" type="text" placeholder="enter a message" />
        <div onClick={sendMsg} className="send-icon">
          <BiSend className="icon" />
        </div>
      </div>
    </div>
  )
}
