import {Peer} from 'peerjs'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'
import {BsCameraVideoFill, BsFillChatSquareTextFill, BsMicFill} from 'react-icons/bs'
import { User } from '../components/User'
import { Chat } from '../components/Chat'
import { FaUsers } from 'react-icons/fa'

export const Joiner = () => {
  const navigate = useNavigate()
  const {socket,roomID,users,msgs} = useContext(context)
  // sidebar => true for the users , false for the chat
  const [sidebar,setSideBar] = useState(true)
  const peerRef = useRef(new Peer)
  const peerIDRef = useRef(null)
  const videoRef = useRef()
  
  useEffect(()=>{
    if(!roomID){
      navigate("/")
    }
    peerRef.current.on("open",peerID=>{
      peerIDRef.current = peerID
      const data = {
        roomID : roomID,
        peerID : peerID
      }
      console.log(data)
      socket.emit("send-peerID",data)
    })
  },[])
  useEffect(()=>{
    let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    peerRef.current.on('call', function(call) {
        console.log("on call")
        getUserMedia({audio: true}, function(stream) {
          call.answer(stream)
          call.on('stream', function(remoteStream) {
              
              videoRef.current.srcObject = remoteStream
            });
          }, function(err) {
            console.log('Failed to get local stream' ,err);
        });
    });
  },[])
  const handleSideBar = (e) => {
    document.querySelectorAll(".action-icon-container.sidebar").forEach(element=>{
      element.classList.remove("active")
    })
    e.currentTarget.classList.add("active")
    if(e.currentTarget.dataset.chat){
      setSideBar(false)
    }
    else{
      setSideBar(true)
    }
  }
  return (
    <div className='meet-container'>
      <div className='left'>
        <div className='section-top flex-column'>
            {
              sidebar ?
              <h1 className='title border-bottom'>all users</h1>
              :
              <h1 className='title border-bottom'>chat messages</h1>
            }
            {sidebar ?
              users.map(user=>{
                return <User key={user.id} name={user.name} role={user.role}  />
              }) :
              <Chat msgs={msgs} />
            
            }
          </div>
          <div className='section-bottom flex-center border-top'>
            <div className='actions sidebar'>
              <div data-chat={true} onClick={handleSideBar} className='action-icon-container sidebar'>
                <BsFillChatSquareTextFill className='action-icon' />
              </div>
              <div data-users={true} onClick={handleSideBar} className='action-icon-container sidebar active'>
                <FaUsers className='action-icon' />
              </div>
            </div>
          </div>
        </div>
      <div className='right'>
        <div className='section-top flex-center'>
          <div className='video-container'>
            <video autoPlay ref={videoRef} muted></video>
          </div>
        </div>
        <div className='section-bottom flex-center'>
          <div className='actions'>
            <div className='action-icon-container'>
              <BsMicFill className='action-icon' />
            </div>
            <div className='action-icon-container'>
              <BsCameraVideoFill className='action-icon' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}