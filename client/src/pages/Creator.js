import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'
import { Peer } from "peerjs"
import {FiShare} from 'react-icons/fi'
import {BsCameraVideoFill, BsCameraVideoOffFill, BsMicFill} from 'react-icons/bs'



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
  const [videoIcon,setVideoIcon] = useState(true)
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
  const stopStream = () => {
    streamRef.current.getVideoTracks()[0]?.stop()
    streamRef.current.getAudioTracks()[0]?.stop()
  }
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
        video: { frameRate: { ideal: 100, max: 200 } },
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
      stopStream()
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
  const stopVideo = () => {
    streamRef.current.getVideoTracks()[0].enabled = streamRef.current.getVideoTracks()[0].enabled ? false : true
    setVideoIcon(streamRef.current.getVideoTracks()[0].enabled)
  }
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
            <div onClick={share} className='action-icon-container'>
              <FiShare className='action-icon'/>
            </div>
            <div onClick={stopVideo} className='action-icon-container'>
              {videoIcon ?
                <BsCameraVideoFill className='action-icon' />
              : <BsCameraVideoOffFill className='action-icon danger' />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
