import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'
import { Peer } from "peerjs"
import {FiShare} from 'react-icons/fi'
import {BsCameraVideoFill, BsCameraVideoOffFill, BsFillChatSquareTextFill, BsList, BsMicFill,BsMicMuteFill} from 'react-icons/bs'
import { User } from '../components/User'
import { Chat } from '../components/Chat'
import {FaUsers} from 'react-icons/fa'
import { CgClose } from "react-icons/cg"
import msgAudioSrc from "../sounds/msg.mp3"

export const Creator = ({toast}) => {
  const {socket,users,msgs,setMsgs,name} = useContext(context)
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
  const [audioIcon,setAudioIcon] = useState(true)
  const [circleNotify,setCircleNotify] = useState(false)
  const [playMsgSound,setPlayMsgSound] = useState(false)
  // sidebar => true for the users , false for the chat
  const [sidebar,setSideBar] = useState(true)
  let msgSound =  new Audio(msgAudioSrc) 
  useEffect(()=>{
    if(!roomID)
      navigate("/")
    peerRef.current.on("open",peerID=>{
      peerIDRef.current = peerID
    })
  },[])

  useEffect(()=>{
    if(playMsgSound){
      msgSound.currentTime = 0
      msgSound.play()
    }
  },[playMsgSound])

  useEffect(()=>{
    socket.on("recv-peerID",data=>{
      socket.emit("send-peerIDs",{peerIDs : peerIDsRef.current,socketID : data.socketID})
      peerIDsRef.current.push(data.peerID)
      // call
      call(data.peerID)
    })
  },[])
  useEffect(()=>{
    const getIt = async() => {
      audioStreamRef.current = await getAudioStream()
      captureStreamRef.current = await getVideoStream()
      if(captureStreamRef.current == null){
        navigate("/")
      }
      captureStreamRef.current.getVideoTracks()[0].enabled = false
    }
    getIt()
    
  },[])

  useEffect(()=>{
    socket.on("msg", data => {
      if(data.name !== name){
        toast(data.name + " just sent a message: \n" + data.msg,{duration: 7000,
          position: 'bottom-right',icon: '📩',style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }})
          if(sidebar){
            setCircleNotify(true)
          }
          setPlayMsgSound(true)
      }
      setMsgs(prevMsgs=>{
        return [data,...prevMsgs]
      })
    })

    return ()=>{
      socket.off("msg")
    }
  },[name])
  const getVideoStream = async() => {
    try{
        const videoStream = await navigator.mediaDevices.getUserMedia({video:{ width: 1280 * 5, height: 720 * 5}})
        return videoStream
    }
    catch(err){
      console.error("video stream denied")
      return null
    }
  }
  const getAudioStream = async() => {
    try{
        const audioStream = await navigator.mediaDevices.getUserMedia({audio:true})
        return audioStream
    }
    catch(err){
      console.error("audio stream denied")
      return null
    }
  }
  const stopStream = () => {
      captureStreamRef.current?.getVideoTracks()[0]?.stop()
      captureStreamRef.current?.getAudioTracks()[0]?.stop()
  }
  const call = (peerID) => {

    if(captureStreamRef.current === null){
      const c = peerRef.current.call(peerID,audioStreamRef.current)
      peerConnectionsRef.current.push(c.peerConnection)
      c.on('stream', function(remoteStream) {
        const video = document.createElement("video")
        video.srcObject = remoteStream
        video.play()
      })
    }
    else{
      const mixStream = new MediaStream([...captureStreamRef.current.getVideoTracks(),...audioStreamRef.current.getAudioTracks()])
      const c = peerRef.current.call(peerID,mixStream)
      peerConnectionsRef.current.push(c.peerConnection)
      c.on('stream', function(remoteStream) {
        const video = document.createElement("video")
        video.srcObject = remoteStream
        video.play()
      })
    }
  }

  const changeCurrentStream = async() =>{

      const newStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280 * 5, height: 720 * 5 }
      })
      videoRef.current.srcObject = newStream
      stopStream()
      captureStreamRef.current = newStream
      const videoTrack = newStream.getVideoTracks()[0]
      videoTrack.enabled = true;
      if(newStream){
        for(let peerConnection of peerConnectionsRef.current){
          const sender = peerConnection.getSenders().find(s=>s.track.kind === videoTrack.kind)
          if(sender){
            sender.replaceTrack(videoTrack)
          }
          else{
            peerConnection.addTrack(videoTrack,newStream)
            // peerConnection.getSenders().find(s=>s.track.kind === videoTrack.kind).replaceTrack(videoTrack)
          }
        }
      }

  }
  const share = async() => {
    // if(captureStreamRef.current === null && audioStreamRef.current == null){
    //   captureNewStream()
    // }
    // else{
      changeCurrentStream()
    // }
  }
  const toggleVideo = () => {
    captureStreamRef.current.getVideoTracks()[0].enabled = captureStreamRef.current.getVideoTracks()[0].enabled ? false : true
    setVideoIcon(captureStreamRef.current.getVideoTracks()[0].enabled)
  }
  const toggleAudio  = () => {
    audioStreamRef.current.getAudioTracks()[0].enabled = audioStreamRef.current.getAudioTracks()[0].enabled ? false : true
    setAudioIcon(audioStreamRef.current.getAudioTracks()[0].enabled)
  }
  const handleSideBar = (e) => {
    document.querySelectorAll(".action-icon-container.sidebar").forEach(element=>{
      element.classList.remove("active")
    })
    e.currentTarget.classList.add("active")
    if(e.currentTarget.dataset.chat){
      setSideBar(false)
      setCircleNotify(false)
    }
    else{
      setSideBar(true)
      setCircleNotify(false)
      setPlayMsgSound(false)
    }
  }
  const handleToggleSideBar = () => {
    document.getElementById("meet-container").classList.toggle("active")
  }
  return (
    <div className='meet-container' id='meet-container'>
      <div className='left'>
          <CgClose onClick={handleToggleSideBar} className={'close-sidebar '} />
          <div className='section-top flex-column'>
            {
              sidebar ?
              <h1  className='title border-bottom'>All users</h1>
              :
              <h1  className='title border-bottom'>Chat</h1>
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
                {sidebar && circleNotify ?
                <div className='circle'></div>
                : null
                }

                <BsFillChatSquareTextFill className='action-icon' />
              </div>
              <div data-users={true} onClick={handleSideBar} className='action-icon-container sidebar active'>
                <FaUsers className='action-icon' />
              </div>
            </div>
          </div>

      </div>
      <div className='right'>
        <BsList className='toggle-sidebar' onClick={handleToggleSideBar}/>
        <div className='section-top flex-center'>
          <div className='video-container'>
            <video autoPlay ref={videoRef} muted></video>
          </div>
        </div>
        <div className='section-bottom flex-center'>
          <div className='actions'>
            {
              audioIcon ?
            <div onClick={toggleAudio} className='action-icon-container'>
              <BsMicFill className='action-icon' />
            </div>
            :
            <div onClick={toggleAudio} className='action-icon-container danger'>
              <BsMicMuteFill className='action-icon' />
            </div>
            }
            <div onClick={share} className='action-icon-container'>
              <FiShare className='action-icon'/>
            </div>
              {videoIcon ?
                <div onClick={toggleVideo} className='action-icon-container'>
                  <BsCameraVideoFill className='action-icon' />
                </div>
              : 
                <div onClick={toggleVideo} className='action-icon-container danger'>
                  <BsCameraVideoOffFill className='action-icon ' />
                </div>
              }
          </div>
        </div>
      </div>

    </div>
  )
}
