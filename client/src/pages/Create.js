import { useContext, useEffect, useId, useRef } from "react"
import { context } from "../App"
import {IoVideocam} from "react-icons/io5"
import { Link, useNavigate } from "react-router-dom"


export const Create = () => {
    const {socket,setRoomID,setUsers,setName} =  useContext(context)
    const navigate = useNavigate()
    const id = useId()
    const nameRef = useRef()
    useEffect(()=>{
      socket.on("creator",data=>{
        // localStorage.setItem("roomID",data.roomID)
        setName(data.name)
        setUsers(prevUsers=>{
          return [...prevUsers,{name:data.name,id : Math.random(),role:0,status : "😍", handsUp : false}]
        })
        setRoomID(data.roomID)
        navigate(`/${data.roomID}`)
      })
    },[])
    const create = () => {
        if(nameRef.current.value.length <= 0) return
        const data = {
          name : nameRef.current.value
        }
          socket.emit("create",data)
    }
  return (
        <div className="container">
          <h1 className="title">create a new meeting room</h1>
          <div className="form">
          <div className='input-controller'>
            <label htmlFor={id} className="label">username</label>
            <input ref={nameRef} placeholder={"username"} type={"text"} className="input" id={id} />
          </div>
            <button onClick={create} className="btn">
              <IoVideocam className="icon"/>
              <span className="btn-text">new meet</span>
            </button>
          </div>
          <p className="small"><Link className="link" to={"/join"}>join</Link> a meet</p>
        </div>
  )
}
