import {Peer} from 'peerjs'
import React, { useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'
import {BsCameraVideoFill, BsMicFill} from 'react-icons/bs'

export const Joiner = () => {
  const navigate = useNavigate()
  const {socket,roomID} = useContext(context)
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
      socket.emit("send",data)
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
  return (
    <div className='meet-container'>
      <div className='left'>
        {/* we have two windows one for users in the meet and other for the chat */}
      </div>
      <div className='right'>
        <div className='section-top'>
          <div className='video-container'>
            <video autoPlay ref={videoRef} muted></video>
          </div>
        </div>
        <div className='section-bottom'>
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