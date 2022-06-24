import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'
import { Peer } from "peerjs"
import {FiShare} from 'react-icons/fi'
import { BsFillChatSquareTextFill, BsList, BsMicFill,BsMicMuteFill} from 'react-icons/bs'
import { User } from '../components/User'
import { Chat } from '../components/Chat'
import {FaLink, FaUsers} from 'react-icons/fa'
import { MdCallEnd, MdScreenShare, MdStopScreenShare } from "react-icons/md"
import { CgClose } from "react-icons/cg"
import msgAudioSrc from "../sounds/msg.mp3"
import { LinkModal } from '../components/LinkModal'
import { black, getAudioStream, getVideoStream, silence } from '../utility'

export const Creator = ({toast}) => {
  const {socket,users,setUsers,msgs,setMsgs,name} = useContext(context)
  const videoRef = useRef()
  const captureStreamRef = useRef(null)
  const audioStreamRef = useRef(null)
  const navigate = useNavigate()
  const {roomID} = useContext(context)
  const peerRef = useRef(new Peer())
  const peerIDRef = useRef(null)
  const peerConnectionsRef = useRef([])
  const peerIDsRef = useRef([])
  const [videoIcon,setVideoIcon] = useState(false)
  const [audioIcon,setAudioIcon] = useState(false)
  const [audioStreamAllowed,setAudioStreamAllowed] = useState(false)
  const [circleNotify,setCircleNotify] = useState(false)
  const [playMsgSound,setPlayMsgSound] = useState(false)
  const [shared,setShared] = useState(false)
  const [showModal,setShowModal] = useState(true)
  // sidebar => true for the users , false for the chat
  const [sidebar,setSideBar] = useState(true)
  let msgSound =  new Audio(msgAudioSrc) 



  useEffect(()=>{
    if(!roomID)
      navigate("/")
    peerRef.current.on("open",peerID=>{
      peerIDRef.current = peerID
    })
  },[roomID,navigate])

  useEffect(()=>{
    if(playMsgSound){
      msgSound.currentTime = 0
      msgSound.play()
    }
  },[playMsgSound])
  useEffect(()=>{
    peerRef.current.on("close",()=>{
      socket.emit("call-end",{end : true})
      captureStreamRef.current.getTracks().forEach(function(track) {
        track.stop();
      })
      audioStreamRef.current.getTracks().forEach(function(track) {
        track.stop();
      })
      socket.disconnect()
      window.location.href = "/endcall"
    })
  },[])

  const closeCall = () => {
    peerRef.current.destroy()
  }

  useEffect(()=>{
    socket.on("recv-peerID",data=>{
      socket.emit("send-peerIDs",{peerIDs : peerIDsRef.current,socketID : data.socketID})
      peerIDsRef.current.push(data.peerID)
      // call
      call(data.peerID)
    })
  },[])

  useEffect(()=>{
    // initiate the video stream and audio stream with dummy tracks
    const videoTrack = black()
    captureStreamRef.current = new MediaStream() 
    captureStreamRef.current.addTrack(videoTrack)

    const audioTrack = silence()
    audioStreamRef.current = new MediaStream() 
    audioStreamRef.current.addTrack(audioTrack)

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
  useEffect(()=>{
    socket.on("raise-hand",data=>{
      setUsers(prevUsers => {
        return prevUsers.map(u=>{
          if(u.name === data.name){
            if(data.handsUp){
              toast(data.name + " raised hand",{duration: 7000,
                position: 'bottom-right',icon: '✋🏻',style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                }})
                msgSound.currentTime = 0
                msgSound.play()
            }
            return {...u,handsUp : data.handsUp}
          }
          else{
            return u
          }
        })
      })
    })
  },[])


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

  const replaceTrack = (kind,track) => {
    for(let peerConnection of peerConnectionsRef.current){
      const sender = peerConnection.getSenders().find(s=>s.track.kind === kind)
      if(sender){
        sender.replaceTrack(track)
      }
    }
  }
  const share = async() => {
    let captureNewStream = await getVideoStream();
    
    if(captureNewStream){
      videoRef.current.srcObject = captureNewStream
      stopStream()
      captureStreamRef.current = captureNewStream
      const videoTrack = captureNewStream.getVideoTracks()[0]
      replaceTrack("video",videoTrack)
      setShared(true)
      setVideoIcon(true)
    }

  }
  const toggleVideo = () => {
    captureStreamRef.current.getVideoTracks()[0].enabled = captureStreamRef.current.getVideoTracks()[0].enabled ? false : true
    socket.emit("shared-screen",{screenIsSharing : captureStreamRef.current.getVideoTracks()[0].enabled})
    setVideoIcon(captureStreamRef.current.getVideoTracks()[0].enabled)
  }
  const toggleAudio  = async () => {
    if(audioStreamAllowed){
      audioStreamRef.current.getAudioTracks()[0].enabled = audioStreamRef.current.getAudioTracks()[0].enabled ? false : true
      setAudioIcon(audioStreamRef.current.getAudioTracks()[0].enabled)
    }
    else{
      const newAudioStream = await getAudioStream()
      if(newAudioStream){
        const audioTrack = newAudioStream.getAudioTracks()[0]
        audioStreamRef.current = newAudioStream
        audioStreamRef.current.getAudioTracks()[0].enabled = true
        replaceTrack("audio",audioTrack)
        setAudioStreamAllowed(true)
        setAudioIcon(true)
      }
    }
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
    <>
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
                return <User key={user.id} name={user.name} role={user.role} status={user.status} handsUp={user.handsUp}  />
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
            <video style={{display : shared ? "block" : "none"}} autoPlay ref={videoRef} muted></video>
            {
              !shared &&
              <div className='first-letter big'>{name[0]}</div>
            }
          </div>
        </div>
        <div className='section-bottom flex-center'>
          <div className='actions'>
            <div onClick={closeCall} className='action-icon-container danger'>
              <MdCallEnd className='action-icon'/>
            </div>
            <div id='share-icon' onClick={share} className='action-icon-container'>
              <FiShare className='action-icon'/>
            </div>
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
            
            {
              videoIcon ?
              shared && <div onClick={toggleVideo} className='action-icon-container'>
                <MdScreenShare className='action-icon' />
              </div>
            : 
            shared && <div onClick={toggleVideo} className='action-icon-container danger'>
                <MdStopScreenShare className='action-icon' />
              </div>
            }
            <div onClick={()=>setShowModal(!showModal)} className='action-icon-container'>
              <FaLink className='action-icon' />
            </div>
          </div>
        </div>
      </div>

    </div>
    {showModal && <LinkModal toast={toast} show={showModal} setShow={setShowModal} />}
    </>
  )
}
