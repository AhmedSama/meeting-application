// dummy audio track
export const silence = () => {
  let ctx = new AudioContext(), oscillator = ctx.createOscillator();
  let dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false});
}

// dummy video track
export const black = ({ width= 1280 * 5, height= 720 * 5} = {}) => {
  let canvas = Object.assign(document.createElement("canvas"), {width, height});
  canvas.getContext('2d').fillRect(0, 0, width, height);
  let stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], {enabled: false});
}

export const blackSilence = (...args) => new MediaStream([black(...args), silence()]);

export const getAudioStream = async() => {
  try{
      const audioStream = await navigator.mediaDevices.getUserMedia({audio:true})
      return audioStream
  }
  catch(err){
    return null
  }
}

export const getVideoStream = async() => {
  try{
      const videoStream = await navigator.mediaDevices.getDisplayMedia({video : { width: 1280 * 5, height: 720 * 5}})
      return videoStream
  }
  catch(err){
    return null
  }
}
export const getVideoTracks = (stream) => {
  // return stream.getTracks().find(track=>track.kind === "video")
  try{
    return stream.getVideoTracks()
  }
  catch(err){
    return null
  }
}
export const getAudioTracks = (stream) => {
  // return stream.getTracks().find(track=>track.kind === "video")
  try{
    return stream.getAudioTracks()
  }
  catch(err){
    return null
  }
}










