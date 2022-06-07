import React, { useEffect, useState } from 'react'

export const User = ({name,role}) => {
    const [color,setColor] = useState(null)
    const randomColor = () => {
        const backgroundColors = ["rgb(68, 12, 119)","rgb(119, 12, 58)","rgb(12, 119, 14)","rgb(119, 12, 12)"]
        setColor(backgroundColors[Math.floor(Math.random()*backgroundColors.length)])  
    }
    useEffect(()=>{
        randomColor()
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
    </div>
  )
}
