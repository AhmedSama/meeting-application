import { useContext, useRef, useState } from 'react';
import ReactDom from 'react-dom'
import { IoCloseOutline, IoCopyOutline } from 'react-icons/io5'
import { context } from '../App';


export const LinkModal = ({toast,show,setShow}) => {
    const notify = () => toast.success('copyed to clipboard')
    const roomIDRef = useRef()
    const url = window.location.origin
    const linkRef = useRef()
    const {roomID} = useContext(context)
    function copyText(element){
        const textToCopy = element.dataset.data
        console.log(textToCopy)
        navigator.clipboard.writeText(textToCopy)
        notify()
    }

    if(!show) return null

  return ReactDom.createPortal(
    <div className='invite-container'>
        <div onClick={()=>setShow(false)} >
            <IoCloseOutline className='close-icon' />
        </div>
        <p className='small ml-10 mt-10'>Invite by ID</p>
        <div onClick={()=>copyText(roomIDRef.current)} className='invite'>
            <IoCopyOutline className='invite-icon' />
            <div data-data={roomID} ref={roomIDRef}>Copy ID</div>
        </div>
        <p className='small ml-10 mt-10'>Invite by Link</p>
        <div onClick={()=>copyText(linkRef.current)} className='invite'>
            <IoCopyOutline className='invite-icon' />
            <div data-data={url + "/" + "link" + "/" + roomID } ref={linkRef}>Copy Invite Link</div>
        </div>
    </div>
    , document.getElementById("link-modal")
  )
}
