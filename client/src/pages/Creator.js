import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'
import { Peer } from "peerjs"
import {FiShare} from 'react-icons/fi'
import {BsCameraVideoFill, BsCameraVideoOffFill, BsFillChatSquareTextFill, BsMicFill} from 'react-icons/bs'
import { User } from '../components/User'
import { Chat } from '../components/Chat'
import {FaUsers} from 'react-icons/fa'


export const Creator = () => {
  const {socket,users,msgs} = useContext(context)
  const videoRef = useRef()
  const captureStreamRef = useRef(null)
  const audioStreamRef = useRef(null)
  const navigate = useNavigate()
  const {roomID} = useContext(context)
  const peerRef = useRef(new Peer())
  const peerIDRef = useRef(null)
  const peerConnectionsRef = useRef([])
  const peerIDsRef = useRef([])
  const [videoIcon,setVideoIcon] = useState(true)
  // sidebar => true for the users , false for the chat
  const [sidebar,setSideBar] = useState(true)
  useEffect(()=>{
    if(!roomID)
      navigate("/")
    peerRef.current.on("open",peerID=>{
      peerIDRef.current = peerID
    })
  },[])
  useEffect(()=>{
    socket.on("recv-peerID",data=>{
      console.log(data)
      peerIDsRef.current.push(data.peerID)
      // call
      call(data.peerID)
    })
  },[])

  const getAudioStream = () => {
    try{
        navigator.mediaDevices.getUserMedia({audio:true})
        .then(stream=>{
          return stream;
        })
    }
    catch(err){
      console.error("audio stream denied")
      return null
    }
  }
  const stopStream = () => {
      captureStreamRef.current.getVideoTracks()[0]?.stop()
      captureStreamRef.current.getAudioTracks()[0]?.stop()
  }
  const call = (peerID) => {
    const c = peerRef.current.call(peerID,captureStreamRef.current)
    peerConnectionsRef.current.push(c.peerConnection)
    c.on('stream', function(remoteStream) {
      const video = document.createElement("video")
      video.srcObject = remoteStream
      video.play()
    })
  }
  const captureNewStream = async() =>{
    try {
      captureStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      videoRef.current.srcObject = captureStreamRef.current
    } catch(err) {
      console.error("Error: " + err);
    }
  }
  const changeCurrentStream = async() =>{
    // .peerConnection.getSenders()[0].replaceTrack(newTrack)
    try {
      const newStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      videoRef.current.srcObject = newStream
      stopStream()
      captureStreamRef.current = newStream
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
    if(captureStreamRef.current === null){
      captureNewStream()
    }
    else{
      changeCurrentStream()
    }

  }
  const stopVideo = () => {
    captureStreamRef.current.getVideoTracks()[0].enabled = captureStreamRef.current.getVideoTracks()[0].enabled ? false : true
    setVideoIcon(captureStreamRef.current.getVideoTracks()[0].enabled)
  }
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
            <div onClick={share} className='action-icon-container'>
              <FiShare className='action-icon'/>
            </div>
              {videoIcon ?
                <div onClick={stopVideo} className='action-icon-container'>
                  <BsCameraVideoFill className='action-icon' />
                </div>
              : 
                <div onClick={stopVideo} className='action-icon-container danger'>
                  <BsCameraVideoOffFill className='action-icon ' />
                </div>
              }
          </div>
        </div>
      </div>

    </div>
  )
}
