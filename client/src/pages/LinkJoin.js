import { useContext, useEffect, useId, useRef } from "react"
import { IoVideocam } from "react-icons/io5"
import { Link, useNavigate, useParams } from "react-router-dom"
import { context } from "../App"

export const LinkJoin = () => {
    const {socket,setRoomID,setUsers,setName} =  useContext(context)
    const navigate = useNavigate()
   const {roomID} = useParams()
   const nameRef = useRef()
   const id = useId()

   useEffect(()=>{
    socket.on("users-data",data=>{
      setUsers(data.users)
    })
  },[])
  useEffect(()=>{
    socket.on("joiner",data=>{
      if(data.ok){
        setName(data.name)
        setRoomID(data.roomID)
        socket.emit("join-room",{
          roomID : data.roomID,
          name : data.name
        })
        navigate(`/join/${data.roomID}`)
      }
      else{
        alert(data.msg)
      }
    })
  },[])
   const join = () => {
    if(nameRef.current.value.length <= 0) return
      const data = {
        roomID : roomID,
        name : nameRef.current.value
      }
      socket.emit("join",data)
  }
  return (
    <div>
        <div className="container">
          <h1 className="title">just enter your name to enter the meet</h1>
          <div className="form">
          <div className='input-controller'>
            <label htmlFor={id} className="label">username</label>
            <input ref={nameRef} placeholder={"username"} type={"text"} className="input" id={id} />
          </div>
            <button onClick={join} className="btn">
              <IoVideocam className="icon"/>
              <span className="btn-text">join the meet</span>
            </button>
          </div>
            <p className="small"><Link className="link" to={"/"}>create</Link> a new meet</p>
        </div>
    </div>
  )
}
