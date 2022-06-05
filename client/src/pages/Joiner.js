import {Peer} from 'peerjs'
import React, { useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'

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
    <div>
      <div className='left'></div>
      <div className='right'>
        <div className='video-container'>
          <video autoPlay ref={videoRef}></video>
        </div>
      </div>
    </div>
  )
}