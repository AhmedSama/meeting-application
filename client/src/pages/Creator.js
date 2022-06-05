import React, { useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'
import { Peer } from "peerjs"


export const Creator = () => {
  const {socket} = useContext(context)
  const videoRef = useRef()
  const streamRef = useRef(null)
  const navigate = useNavigate()
  const {roomID} = useContext(context)
  const peerRef = useRef(new Peer())
  const peerIDRef = useRef(null)
  const peerConnectionsRef = useRef([])
  const peerIDsRef = useRef([])
  useEffect(()=>{
    if(!roomID)
      navigate("/")
    peerRef.current.on("open",peerID=>{
      peerIDRef.current = peerID
    })
  },[])
  useEffect(()=>{
    socket.on("recv",data=>{
      console.log(data)
      peerIDsRef.current.push(data.peerID)
      // call
      call(data.peerID)
    })
  },[])

  const call = (peerID) => {
    const c = peerRef.current.call(peerID,streamRef.current)
    peerConnectionsRef.current.push(c.peerConnection)
    c.on('stream', function(remoteStream) {
      const video = document.createElement("video")
      video.srcObject = remoteStream
      video.play()
    })
  }
  const captureNewStream = async() =>{
    try {
      streamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      videoRef.current.srcObject = streamRef.current
    } catch(err) {
      console.error("Error: " + err);
    }
  }
  const changeCurrentStream = async() =>{
    // .peerConnection.getSenders()[0].replaceTrack(newTrack)
    console.log("change stream")
    try {
      const newStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      videoRef.current.srcObject = newStream
      streamRef.current = newStream
      const tracks = newStream.getVideoTracks()[0]
      tracks.enabled = true;
      if(newStream){
        for(let peerConnection of peerConnectionsRef.current){
          peerConnection.getSenders()[0].replaceTrack(tracks)
        }
      }

    } catch(err) {
      console.error("Error: " + err);
    }
  }
  const share = async() => {
    if(streamRef.current === null){
      captureNewStream()
    }
    else{
      changeCurrentStream()
    }

  }
  return (
    <div>
      <div className='left'></div>
      <div className='right'>
        <div className='video-container'>
          <video autoPlay ref={videoRef} muted></video>
        </div>
        <button onClick={share} className='btn'>share</button>
      </div>
    </div>
  )
}
