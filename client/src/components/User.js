import React, { useEffect, useState } from 'react'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { IoHandLeftOutline } from 'react-icons/io5'
import { DropDown } from './DropDown'
import { DropDownContainer } from './DropDownContainer'


export const User = ({name,role,status,handsUp}) => {
    const [color,setColor] = useState(null)
    const [showDropDown, setShowDropDown] = useState(false)
    const randomColor = () => {
        const backgroundColors = ["rgb(68, 12, 119)","rgb(119, 12, 58)","rgb(12, 119, 14)","rgb(119, 12, 12)"]
        const randomColor = backgroundColors[Math.floor(Math.random()*backgroundColors.length)]
        localStorage.setItem("color",randomColor)
        setColor(randomColor)  
    }
    useEffect(()=>{
        if(localStorage.getItem("color")){
            setColor(localStorage.getItem("color"))
        }
        else{
            randomColor()
        }
    },[])
  return (
    <div className='user'>
        <div className='user-info'>
            <div style={{
                backgroundColor : color
            }} className='first-letter'>{name[0]}</div>
            <div className='user-name'>{name}</div>
            {
                // zero for the host , one for normal users
                role === 0
            ?
                <div className='user-role'> ( Host ) </div>
            :
                null
            }
            {
                status !== null &&
                <div>{status}</div>
            }
            {
                handsUp &&
                <IoHandLeftOutline className='hand-shake' /> 
            }
        </div>
        <DropDownContainer>
            <div onClick={()=>{setShowDropDown(prev=>!prev)}} className='list-icon-container flex-center'>
                <BsThreeDotsVertical className='list-icon' />
            </div>
            {
                showDropDown &&
                
                <DropDown setShowDropDown={setShowDropDown} items={[{id:1,text : "👍"},{id:2,text : "😍"},{id:3,text : "😢"}
                                ,{id:4,text : "👏"},{id:5,text : "😎"},{id:6,text : "😂"}
                                ,{id:7,text : "❤"},{id:8,text : "💔"},{id:9,text : "✔"}
                                ,{id:10,text : "😲"},{id:11,text : "🥺"},{id:12,text : "😭"}]} />
            }
        </DropDownContainer>
    </div>
  )
}
