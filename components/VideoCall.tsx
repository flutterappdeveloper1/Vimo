
import React, { useRef, useEffect } from 'react';
import { HangUpIcon, MicOffIcon, MicOnIcon, VideoOffIcon, VideoOnIcon } from './icons';

interface VideoCallProps {
  myStream: MediaStream;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ myStream, remoteStream, onEndCall }) => {
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMicMuted, setIsMicMuted] = React.useState(false);
  const [isVidHidden, setIsVidHidden] = React.useState(false);

  useEffect(() => {
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMic = () => {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    setIsMicMuted(prev => !prev);
  }

  const toggleVideo = () => {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    setIsVidHidden(prev => !prev);
  }


  return (
    <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <video ref={myVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 w-1/5 max-w-xs h-auto rounded-lg border-2 border-white" />
      </div>
      <div className="absolute bottom-10 flex items-center space-x-6 z-50">
        <button onClick={toggleMic} className="p-4 bg-gray-700 rounded-full text-white hover:bg-gray-600">
            {isMicMuted ? <MicOffIcon /> : <MicOnIcon />}
        </button>
        <button onClick={toggleVideo} className="p-4 bg-gray-700 rounded-full text-white hover:bg-gray-600">
            {isVidHidden ? <VideoOffIcon /> : <VideoOnIcon />}
        </button>
        <button onClick={onEndCall} className="p-4 bg-red-600 rounded-full text-white hover:bg-red-700">
          <HangUpIcon />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
