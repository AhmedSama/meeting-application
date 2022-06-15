import React, { useEffect, useState } from 'react'
import { IoHandLeftOutline } from 'react-icons/io5'


export const User = ({name,role,status,handsUp}) => {
    const [color,setColor] = useState(null)
    
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
        <div style={{
            backgroundColor : color
        }} className='first-letter'>{name[0]}</div>
        <div className='user-name'>{name}</div>
        {
            // zero for the host , one for normal users
            role === 0
        ?
            <div className='user-role'> ( host ) </div>
        :
            null
        }
        {
            handsUp &&
            <IoHandLeftOutline className='hand-shake' style={{fontSize : 20}} /> 
        }
    </div>
  )
}
