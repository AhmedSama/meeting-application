import { useContext, useEffect, useId, useRef } from "react"
import { context } from "../App"
import {IoVideocam} from "react-icons/io5"
import { Link, useNavigate } from "react-router-dom"


export const Join = () => {
    const {socket,setRoomID} =  useContext(context)

    const nameRef = useRef()
    const roomIDRef = useRef()

    const id1 = useId()
    const id2 = useId()

    const navigate = useNavigate()

    useEffect(()=>{
      socket.on("joiner",data=>{
        console.log(data)
        if(data.ok){
          // localStorage.setItem("roomID",data.roomID)
          setRoomID(data.roomID)
          navigate(`/join/${data.roomID}`)
        }
        else{
          alert(data.msg)
        }
      })
    },[])
    const join = () => {
      if(nameRef.current.value.length <= 0 || roomIDRef.current.value.length <= 0) return
        const data = {
          roomID : roomIDRef.current.value,
          name : nameRef.current.value
        }
        socket.emit("join",data)
    }
  return (
        <div className="container">
          <h1 className="title">join a meeting room</h1>
          <div className="form">
          <div className='input-controller'>
            <label htmlFor={id1} className="label">username</label>
            <input ref={nameRef} placeholder={"username"} type={"text"} className="input" id={id1} />
          </div>
          <div className='input-controller'>
            <label htmlFor={id2} className="label">meet ID</label>
            <input ref={roomIDRef} placeholder={"d2f2-1d434-cveeg2-grgghr2"} type={"text"} className="input" id={id2} />
          </div>
            <button onClick={join} className="btn">
              <IoVideocam className="icon"/>
              <span className="btn-text">join meet</span>
            </button>
          </div>
          <p className="small"><Link className="link" to={"/"}>create</Link> a new meet</p>
        </div>
  )
}
