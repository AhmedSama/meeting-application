import React from 'react'
import { MdCallEnd } from 'react-icons/md'
import { Link } from 'react-router-dom'
// import endcall from '../images/endcall.svg'
import icon from '../images/meet.svg'

export const EndCall = () => {
  return (
    <div className='end-call'>
        <div className='image'>
            <div className='img-container'>
                <img src={icon} alt="end call" />
            </div>
        </div>
        <div className='contact'>
        <h2 className="title flex items-center">
            call ended
        <div  className=' flex-center  m-10'>
              <MdCallEnd className='icon'/>
            </div>
        </h2>   
        <div className='btns'>
            <Link to={"/"} className='btn' >create a new meet</Link>
            <Link to={"/join"} className='btn'>join a meet</Link>
        </div>
        <h2 className="small"> Contact me <a rel="noreferrer" href="https://www.linkedin.com/in/ahmed-ghazi-samari
" target="_blank">Ahmed Ghazi</a> ❤ </h2>
        </div>
    </div>
  )
}
