import { useContext, useEffect } from "react"
import { context } from "../App"


export const DropDown = ({items,setShowDropDown}) => {
  const {socket,setUsers,name} = useContext(context)
  const handleEmojiClick = (e) => {
    socket.emit("set-status",{emoji : e.target.innerText,name : name})
    setUsers(prevUsers=>{
        return prevUsers.map(user=>{
            if(user.name === name){
                return {...user,status : e.target.innerText}
            }
            else{
                return user
            }
        })
    })
    setShowDropDown(false)
  }
  useEffect(()=>{
    socket.on("set-status",data=>{
        setUsers(prevUsers=>{
            return prevUsers.map(user=>{
                if(user.name === data.name){
                    return {...user,status : data.emoji}
                }
                else{
                    return user
                }
            })
        })
    })
  },[])
  return (
    <div className="drop-down">
        {
            items.map(item=>{
                return <div onClick={handleEmojiClick} key={item.id} className="drop-down-item flex-center">{item.text}</div>
            })
        }
        
    </div>
  )
}



