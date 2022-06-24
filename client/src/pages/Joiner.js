import {Peer} from 'peerjs'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'
import { BsFillChatSquareTextFill, BsList, BsMicFill, BsMicMuteFill} from 'react-icons/bs'
import { User } from '../components/User'
import { Chat } from '../components/Chat'
import { FaUsers } from 'react-icons/fa'
import msgAudioSrc from "../sounds/msg.mp3"
import { CgClose } from "react-icons/cg"
import { IoHandRightSharp } from 'react-icons/io5'
import { MdCallEnd } from 'react-icons/md'
import { getAudioStream, silence } from '../utility'


export const Joiner = ({toast}) => {
  const navigate = useNavigate()
  const {socket,roomID,users,setUsers,msgs,setMsgs,name} = useContext(context)
  // sidebar => true for the users , false for the chat
  const [sidebar,setSideBar] = useState(true)
  const [circleNotify,setCircleNotify] = useState(false)
  const peerRef = useRef(new Peer())
  const peerConnectionsRef = useRef([])
  const peerIDRef = useRef(null)
  const audioTrack = silence()
  const streamRef = useRef( new MediaStream() )
  streamRef.current.addTrack(audioTrack)
  const [audioIcon,setAudioIcon] = useState(false)
  const [audioStreamAllowed,setAudioStreamAllowed] = useState(false)
  const videoRef = useRef()
  const [playMsgSound,setPlayMsgSound] = useState(false)
  const [hostScreenIsSharing,setHostScreenIsSharing] = useState(false)
  let msgSound =  new Audio(msgAudioSrc) 

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

  // useEffect(()=>{
  //   // initiate the video stream and audio stream with dummy tracks
  //   const audioTrack = silence()
  //   streamRef.current = new MediaStream() 
  //   streamRef.current.addTrack(audioTrack)
  // },[])
  const getVideoTracks = (stream) => {
    // return stream.getTracks().find(track=>track.kind === "video")
    try{
      return stream.getVideoTracks()
    }
    catch(err){
      return null
    }
  }
  useEffect(()=>{
    if(playMsgSound){
      msgSound.currentTime = 0
      msgSound.play()
    }
  },[playMsgSound])
  useEffect(()=>{
    socket.on("recv-peerIDs",data=>{
      if(data.peerIDs.length > 0){
        callAll(data.peerIDs)
      }
    })
  },[])
  const callAll = (peerIDs) => {
    console.log(peerIDs)
    for(let pID of peerIDs){
      call(pID)
    }
  } 
  const call = async(peerID) => {

    const c = peerRef.current.call(peerID,streamRef.current)
    c.on('stream', function(remoteStream) {
      peerConnectionsRef.current.push(c.peerConnection)
      console.log(c.peerConnection)
      const video = document.createElement("video")
      video.srcObject = remoteStream
      video.play()
    })
  }
  useEffect(()=>{
    socket.on("call-end",data=>{
      peerRef.current.destroy()

      streamRef.current.getTracks().forEach(function(track) {
        track.stop();
      })
      socket.disconnect()
      window.location.href = "/"
    })
  },[])
  const closeCall = () => {
    peerRef.current?.destroy()
    const tracks = streamRef.current.getTracks();
    if(tracks.length > 0){
      tracks.forEach(function(track) {
        track.stop();
      })
    }
    socket.disconnect()
    window.location.href = "/"
  }

  useEffect(()=>{
    peerRef.current.on('call', async (call) => {
      
      call.answer(streamRef.current)

      // adding the peerConnection after answering the call 
      // cuz it is undefiend before answer
      peerConnectionsRef.current.push(call.peerConnection)
      call.on('stream', (remoteStream) => {

          const videoTracks = getVideoTracks(remoteStream)
          if(videoTracks.length > 0){
            setHostScreenIsSharing(videoTracks[0].enabled)
            videoRef.current.srcObject = remoteStream
          }
          else{
            console.log("audio answer")
            const video = document.createElement("video")
            video.srcObject = remoteStream
            video.play()
          }
        })
    })
  },[])
  useEffect(()=>{
    socket.on("msg", data => {
      if(data.name !== name){
        toast(data.name + " sent a message: \n" + data.msg,{duration: 7000,
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

  const replaceTrack = (kind,track) => {
    console.log(peerConnectionsRef.current)
    for(let peerConnection of peerConnectionsRef.current){
      const sender = peerConnection?.getSenders().find(s=>s.track.kind === kind)

      if(sender){
        sender.replaceTrack(track)
        console.log(sender)
      }
    }
  }
  const toggleAudio  = async() => {
    if(audioStreamAllowed){
      console.log("video off")
      streamRef.current.getAudioTracks()[0].enabled = !audioIcon
      setAudioIcon(!audioIcon)
    }
    else{
      const newAudioStream = await getAudioStream()
      if(newAudioStream){
        const audioTrack = newAudioStream.getAudioTracks()[0]
        streamRef.current = newAudioStream
        streamRef.current.getAudioTracks()[0].enabled = true
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
  const raiseHand = (e) => {
    e.currentTarget.classList.toggle("active")
    setUsers(prevUsers => {
      return prevUsers.map(u=>{
        if(u.name === name){
          socket.emit("raise-hand",{name:name,handsUp :!u.handsUp })
          return {...u,handsUp : !u.handsUp}
        }
        else{
          return u
        }
      })
    })
  }
  useEffect(()=>{
    socket.on("shared-screen",data=>{
      setHostScreenIsSharing(data.screenIsSharing)
    })
  },[])
  return (
    <div className='meet-container' id='meet-container'>
      <div className='left'>
      <CgClose onClick={handleToggleSideBar} className={'close-sidebar '} />
        <div className='section-top flex-column'>
            {
              sidebar ?
              <h1 className='title border-bottom'>all users</h1>
              :
              <h1 className='title border-bottom'>chat messages</h1>
            }
            {sidebar ?
              users.map(user=>{
                return <User key={user.id} name={user.name} role={user.role}  status={user.status} handsUp={user.handsUp}    />
              }) :
              <Chat msgs={msgs} />
            
            }
          </div>
          <div className='section-bottom flex-center border-top'>
            <div className='actions sidebar'>
              <div data-chat={true} onClick={handleSideBar} className='action-icon-container sidebar'>
                {
                  sidebar && circleNotify?
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
            <video style={{display : hostScreenIsSharing ? "block" : "none"}} autoPlay ref={videoRef}></video>
            {
              !hostScreenIsSharing &&
              <div className='first-letter big'>{name[0]}</div>
            }

          </div>
        </div>
        <div className='section-bottom flex-center'>
          <div className='actions'>
            <div onClick={closeCall} className='action-icon-container danger'>
              <MdCallEnd className='action-icon'/>
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
            <div onClick={raiseHand} className='action-icon-container'>
              <IoHandRightSharp className='action-icon' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}