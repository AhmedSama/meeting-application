import {Peer} from 'peerjs'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { context } from '../App'
import {BsCameraVideoFill, BsFillChatSquareTextFill, BsList, BsMicFill, BsMicMuteFill} from 'react-icons/bs'
import { User } from '../components/User'
import { Chat } from '../components/Chat'
import { FaUsers } from 'react-icons/fa'
import msgAudioSrc from "../sounds/msg.mp3"
import { CgClose } from "react-icons/cg"
import { IoHandRightSharp } from 'react-icons/io5'
import { MdCallEnd } from 'react-icons/md'


export const Joiner = ({toast}) => {
  const navigate = useNavigate()
  const {socket,roomID,users,setUsers,msgs,setMsgs,name} = useContext(context)
  // sidebar => true for the users , false for the chat
  const [sidebar,setSideBar] = useState(true)
  const [circleNotify,setCircleNotify] = useState(false)
  const peerRef = useRef(new Peer)
  const peerIDRef = useRef(null)
  const streamRef = useRef(null)
  const [audioIcon,setAudioIcon] = useState(true)
  const videoRef = useRef()
  const [playMsgSound,setPlayMsgSound] = useState(false)
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
    console.log(peerID)
    try{
      streamRef.current = await navigator.mediaDevices.getUserMedia({audio:true})
      const c = peerRef.current.call(peerID,streamRef.current)
      c.on('stream', function(remoteStream) {
        const video = document.createElement("video")
        video.srcObject = remoteStream
        video.play()
      })
    }
    catch(error){
        console.log(error)
    }
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
    peerRef.current.destroy()

      streamRef.current.getTracks().forEach(function(track) {
        track.stop();
      })
      socket.disconnect()
      window.location.href = "/"
  }
  useEffect(()=>{
    peerRef.current.on('call', async function(call) {
      try{
        streamRef.current = await navigator.mediaDevices.getUserMedia({audio:true})
      }catch(error){
        navigate("/error")
        return
      }
      call.answer(streamRef.current)
      call.on('stream', function(remoteStream) {
          const videoTracks = getVideoTracks(remoteStream)
          // const audioTracks = getAudioTracks(remoteStream)

          if(videoTracks.length > 0){
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
  const toggleAudio  = () => {
    streamRef.current.getAudioTracks()[0].enabled = streamRef.current.getAudioTracks()[0].enabled ? false : true
    setAudioIcon(streamRef.current.getAudioTracks()[0].enabled)
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
  const raiseHand = () => {
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
            <video autoPlay ref={videoRef}></video>
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