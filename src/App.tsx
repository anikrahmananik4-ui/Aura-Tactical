import React, { useState, useEffect, useRef } from "react";
import { WalkieUser, ChatMessage, ConnectionStatus } from "./types";
import { TacticalView } from "./components/TacticalView";
import {
  float32ArrayToBase64,
  base64ToFloat32Array,
  downsampleBuffer,
  playStartBeep,
  playEndSquelch
} from "./utils/audio";

const BANGLADESH_DISTRICTS = [
  "Chittagong (চট্টগ্রাম)",
  "Cumilla (কুমিল্লা)",
  "Dhaka (ঢাকা)",
  "Sylhet (সিলেট)",
  "Rajshahi (রাজশাহী)",
  "Khulna (খুলনা)",
  "Barishal (বরিশাল)",
  "Rangpur (রংপুর)",
  "Mymensingh (ময়মনসিংহ)"
];

// Simple distance matrix (rough approximation in km from Chittagong)
const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  "Chittagong (চট্টগ্রাম)": {
    "Chittagong (চট্টগ্রাম)": 0,
    "Cumilla (কুমিল্লা)": 135,
    "Dhaka (ঢাকা)": 240,
    "Sylhet (সিলেট)": 290,
    "Rajshahi (রাজশাহী)": 440,
    "Khulna (খুলনা)": 380,
    "Barishal (বরিশাল)": 300,
    "Rangpur (রংপুর)": 490,
    "Mymensingh (ময়মনসিংহ)": 310,
  },
  "Cumilla (কুমিল্লা)": {
    "Chittagong (চট্টগ্রাম)": 135,
    "Cumilla (কুমিল্লা)": 0,
    "Dhaka (ঢাকা)": 100,
    "Sylhet (সিলেট)": 170,
    "Rajshahi (রাজশাহী)": 310,
    "Khulna (খুলনা)": 250,
    "Barishal (বরিশাল)": 180,
    "Rangpur (রংপুর)": 370,
    "Mymensingh (ময়মনসিংহ)": 180,
  }
};

export default function App() {
  // Join Settings
  const [codename, setCodename] = useState("");
  const [channel, setChannel] = useState("ROOM_01");
  const [location, setLocation] = useState("Chittagong (চট্টগ্রাম)");
  const [friendLocation, setFriendLocation] = useState("Cumilla (কুমিল্লা)");
  const [isJoined, setIsJoined] = useState(false);

  // Keyboard and Submenu Controls
  const [activeTab, setActiveTab] = useState<"radio" | "video" | "chat">("radio");
  const [chatInput, setChatInput] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [simulatedLocalFeed, setSimulatedLocalFeed] = useState(false);
  const [simulatedRemoteFeed, setSimulatedRemoteFeed] = useState(false);

  // Connection State
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [myUserId, setMyUserId] = useState<string>("");
  const [users, setUsers] = useState<WalkieUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Audio state
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false); // Locked mic
  const [localVolume, setLocalVolume] = useState(0);
  const [remoteVolume, setRemoteVolume] = useState(0);
  const [remoteSpeakerId, setRemoteSpeakerId] = useState<string | null>(null);
  const [remoteSpeakerName, setRemoteSpeakerName] = useState<string | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);

  // Time & UI Elements
  const [currentTime, setCurrentTime] = useState("");
  const [batteryLevel] = useState(Math.floor(Math.random() * 15) + 85); // Simulated battery level

  // Refs for audio capturing/playing
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextScheduledTimeRef = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for Video/Webrtc
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Dynamic dynamic sine frequency state for oscilloscope wave drawing
  const [wavePhase, setWavePhase] = useState(0);

  // Setup current military block clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set up animation frames for visual oscilloscope wave rendering
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setWavePhase((prev) => (prev + 0.15) % (Math.PI * 2));
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Set up local video source dynamic stream assignment
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, activeTab, isVideoCalling]);

  // Set up remote video source dynamic stream assignment
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, activeTab, isVideoCalling]);

  // Scroll to chat log bottom automatically on new inbound logs
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // System logging helper
  const addSystemMsg = (message: string, type: ChatMessage["type"] = "info", codename?: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        type,
        codename,
        message,
        timestamp: new Date()
      }
    ].slice(-45)); // Keep only last 45 messages to prevent memory creep
  };

  // Setup WebSocket URL dynamically based on hosting protocol
  const getWebSocketUrl = () => {
    const loc = window.location;
    const protocol = loc.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${loc.host}/ws`;
  };

  // Keyboard controls listener (Spacebar triggers talk!)
  useEffect(() => {
    if (!isJoined) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Stop default scroll downs
        if (!isLocalSpeaking && !isHandsFree) {
          triggerTransmissionStart();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isLocalSpeaking && !isHandsFree) {
          triggerTransmissionStop();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isJoined, isLocalSpeaking, isHandsFree]);

  // Connect to the unified Voice signaling Hub on selection
  const handleConnect = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!codename.trim() || !channel.trim()) return;

    setStatus("connecting");
    addSystemMsg("সার্ভারে সংযোগ করার চেষ্টা করা হচ্ছে...", "info");

    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      // Authenticate & Join matching group
      ws.send(
        JSON.stringify({
          type: "join",
          codename: codename.trim(),
          channel: channel.trim().toUpperCase()
        })
      );
    };

    ws.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);

        switch (payload.type) {
          case "joined":
            setMyUserId(payload.userId);
            setIsJoined(true);
            addSystemMsg(`চ্যানেলে যুক্ত হয়েছেন: CH-${payload.channel}`, "system");
            break;

          case "users":
            // Remote participant presences
            const activeUsersList = (payload.users as WalkieUser[]).filter(
              (u) => u.id !== myUserId
            );
            setUsers(activeUsersList);
            break;

          case "status": {
            const { userId, codename: senderName, isSpeaking } = payload;
            setUsers((prev) =>
              prev.map((u) => (u.id === userId ? { ...u, isSpeaking } : u))
            );

            if (isSpeaking) {
              setRemoteSpeakerId(userId);
              setRemoteSpeakerName(senderName);
              addSystemMsg(`${senderName} কথা বলছেন... [TRANSMITTING]`, "status");
            } else {
              setRemoteSpeakerId(null);
              setRemoteSpeakerName(null);
              setRemoteVolume(0);
              
              // Apply squelch locally on complete received transmissions
              if (!audioMuted && audioContextRef.current) {
                playEndSquelch(audioContextRef.current);
              }
              addSystemMsg(`${senderName} এর কথা শেষ হয়েছে।`, "info");
            }
            break;
          }

          case "audio": {
            // Low latency voice packets streaming
            if (audioMuted) return;
            const floatData = base64ToFloat32Array(payload.data);
            enqueueReceivedAudio(floatData, payload.userId, payload.codename);
            break;
          }

          case "chat": {
            const { id, codename: senderName, text, file, timestamp } = payload;
            const inboundMsg: ChatMessage = {
              id: id || Math.random().toString(),
              type: "chat",
              codename: senderName,
              message: text || "",
              timestamp: new Date(timestamp || Date.now()),
              file: file ? {
                name: file.name,
                type: file.type,
                size: file.size,
                data: file.data
              } : undefined
            };
            setChatMessages((prev) => [...prev, inboundMsg].slice(-45));
            break;
          }

          case "signal": {
            const { sender, senderCodename, signal } = payload;
            let pc = peerConnectionsRef.current[sender];
            if (!pc) {
              addSystemMsg(`@${senderCodename} থেকে ভিডিও সেশন প্রারম্ভ হচ্ছে...`, "info");
              pc = createReceiverPeerConnection(sender);
            }

            if (signal.sdp) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
              if (signal.sdp.type === "offer") {
                let stream = localStream || mediaStreamRef.current;
                if (!stream) {
                  try {
                    stream = await navigator.mediaDevices.getUserMedia({
                      video: { width: 320, height: 240 },
                      audio: { echoCancellation: true }
                    });
                    setLocalStream(stream);
                    setSimulatedLocalFeed(false);
                  } catch (e) {
                    console.warn("Iframe/device media block, running Simulated Feed stream", e);
                    setSimulatedLocalFeed(true);
                    setSimulatedRemoteFeed(true);
                  }
                }

                if (stream) {
                  stream.getTracks().forEach((track) => {
                    pc!.addTrack(track, stream!);
                  });
                }

                try {
                  const answer = await pc.createAnswer();
                  await pc.setLocalDescription(answer);
                  wsRef.current?.send(
                    JSON.stringify({
                      type: "signal",
                      target: sender,
                      signal: { sdp: pc.localDescription }
                    })
                  );
                } catch (err) {
                  console.error("WebRTC answering failed error:", err);
                }
                
                setIsVideoCalling(true);
                setActiveTab("video");
              }
            } else if (signal.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
              } catch (e) {
                console.error("Error setting ICE candidate:", e);
              }
            }
            break;
          }

          case "pong":
            // Keep alive confirmed
            break;
        }
      } catch (err) {
        console.error("Websocket dispatcher failed parsing chunk:", err);
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      setIsJoined(false);
      cleanUpLocalStreaming();
      addSystemMsg("সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। দয়া করে আবার চেষ্টা করুন।", "error");
    };

    ws.onerror = () => {
      setStatus("error");
      addSystemMsg("সার্ভার সংযোগ ক্রুটিযুক্ত। দয়া করে চেক করুন।", "error");
    };

    // Ping loop to prevent Cloud Run sandboxes scaling down connections
    pingIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 15000);
  };

  // Broadcast local microphone blocks down current WebSocket link
  const triggerTransmissionStart = async () => {
    try {
      // 1. Initialize audio graph
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Play analog Motorola permission beep locally!
      playStartBeep(ctx);

      // Short delay of 80ms for realistic walkie gear sound to complete before capturing vocals
      await new Promise((r) => setTimeout(r, 85));

      // 2. Request microphone inputs
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaStreamRef.current = stream;
      const sourceNode = ctx.createMediaStreamSource(stream);

      // ScriptProcessorNode - simple, inline sandbox safe bypasses cross-origin dynamic URL blockers
      const processorNode = ctx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = processorNode;

      processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Root-Mean-Square Volume Calculations for beautiful UI visual flatline displacement
        let sumSquared = 0;
        for (let i = 0; i < inputData.length; i++) {
          sumSquared += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sumSquared / inputData.length);
        setLocalVolume(Math.min(rms * 100 * 1.5, 100)); // Scaled sensitivity

        // Downsample single micro channel (e.g. 48kHz -> 16kHz) to optimize bandwidth delivery
        const downsampled = downsampleBuffer(inputData, ctx.sampleRate, 16000);
        const base64Audio = float32ArrayToBase64(downsampled);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "audio",
              data: base64Audio
            })
          );
        }
      };

      // Route mic through zero-gain node to prevent local acoustic feedback screeching on mobile speakers
      const silenceGain = ctx.createGain();
      silenceGain.gain.value = 0;
      sourceNode.connect(processorNode);
      processorNode.connect(silenceGain);
      silenceGain.connect(ctx.destination);

      // Notify other room users that I'm active
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "status",
            speaking: true
          })
        );
      }

      setIsLocalSpeaking(true);
      addSystemMsg("আপনি কথা বলছেন... [TRANSMITTING]", "status", codename);
      
    } catch (err) {
      console.error("Mic hook error:", err);
      addSystemMsg("মাইক পারমিশন দিন অন্যথায় কথা বলা যাবে না!", "error");
      triggerTransmissionStop(false);
    }
  };

  // Kill recording, clean stream rails and broadcast stop
  const triggerTransmissionStop = (playSquelchSound = true) => {
    setIsLocalSpeaking(false);
    setLocalVolume(0);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "status",
          speaking: false
        })
      );
    }

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (_) {}
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Play satisfactory mechanical radio release static squelch!
    if (playSquelchSound && audioContextRef.current) {
      playEndSquelch(audioContextRef.current);
    }
  };

  // Web Audio Dynamic Queue Playback algorithm for seamless low latency stitching
  const enqueueReceivedAudio = (
    float32Audio: Float32Array,
    senderId: string,
    senderName: string
  ) => {
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      // Track volume fluctuations dynamically
      let sumSquared = 0;
      for (let i = 0; i < float32Audio.length; i++) {
        sumSquared += float32Audio[i] * float32Audio[i];
      }
      const rms = Math.sqrt(sumSquared / float32Audio.length);
      setRemoteVolume(Math.min(rms * 100 * 2.5, 100)); // Scaled receiver sensitivity
      setRemoteSpeakerId(senderId);
      setRemoteSpeakerName(senderName);

      // Create new buffer node in 16kHz layout
      const audioBuffer = ctx.createBuffer(1, float32Audio.length, 16000);
      audioBuffer.copyToChannel(float32Audio, 0);

      const bufferSource = ctx.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.connect(ctx.destination);

      const now = ctx.currentTime;
      let startTime = now;
      const safetyBufferOffset = 0.045; // 45ms safety buffer guarantees lag and stutter resistance

      if (nextScheduledTimeRef.current < now) {
        startTime = now + safetyBufferOffset;
      } else {
        startTime = nextScheduledTimeRef.current;
      }

      bufferSource.start(startTime);
      nextScheduledTimeRef.current = startTime + audioBuffer.duration;
      
    } catch (err) {
      console.error("Audio queue stitching error:", err);
    }
  };

  // Safely clean up on logout
  const cleanUpLocalStreaming = () => {
    triggerTransmissionStop(false);
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }

    // Terminate camera stream if any exists
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setIsVideoCalling(false);
    setSimulatedLocalFeed(false);
    setSimulatedRemoteFeed(false);

    // Destroy WebRTC connections
    Object.keys(peerConnectionsRef.current).forEach(id => {
      try {
        peerConnectionsRef.current[id].close();
      } catch (_) {}
    });
    peerConnectionsRef.current = {};

    setIsLocalSpeaking(false);
    setIsHandsFree(false);
    setUsers([]);
  };

  const handleDisconnect = () => {
    cleanUpLocalStreaming();
    setIsJoined(false);
    addSystemMsg("আপনি সফলভাবে সাইন আউট হয়েছেন।", "info");
    setStatus("disconnected");
  };

  // WebRTC & Chat signaling/handling helper modules
  const createReceiverPeerConnection = (senderId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerConnectionsRef.current[senderId] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: "signal",
          target: senderId,
          signal: { candidate: event.candidate }
        }));
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setSimulatedRemoteFeed(false);
      }
    };

    return pc;
  };

  const setupPeerConnections = (stream: MediaStream) => {
    users.forEach(async (u) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      peerConnectionsRef.current[u.id] = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: "signal",
            target: u.id,
            signal: { candidate: event.candidate }
          }));
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          setSimulatedRemoteFeed(false);
        }
      };

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current?.send(JSON.stringify({
          type: "signal",
          target: u.id,
          signal: { sdp: pc.localDescription }
        }));
      } catch (err) {
        console.error("WebRTC initial offer create failed:", err);
      }
    });
  };

  const startVideoCall = async () => {
    try {
      addSystemMsg("ক্যামেরা ও মিডিয়া চ্যানেল সংযোগ করা হচ্ছে...", "info");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 320 }, 
          height: { ideal: 240 }, 
          frameRate: { ideal: 15 } 
        },
        audio: true
      });
      
      setLocalStream(stream);
      setIsVideoCalling(true);
      setSimulatedLocalFeed(false);
      setSimulatedRemoteFeed(users.length > 0); // If someone is in the room, simulate if peer not rendering WebRTC directly
      addSystemMsg("ক্যামেরা সফলভাবে সংযুক্ত হয়েছে।", "system");

      // Set up connections using captured stream
      setupPeerConnections(stream);
    } catch (err) {
      console.warn("Media devices locked / sandbox blocking active. Activating modern visual feed simulator", err);
      addSystemMsg("ক্যামেরায় সংযোগ ব্যর্থ! সুরক্ষিত ক্যামেরা-সিমুলেটর ব্রিজ চালু করা হচ্ছে...", "error");
      
      setSimulatedLocalFeed(true);
      setSimulatedRemoteFeed(true);
      setIsVideoCalling(true);
    }
  };

  const stopVideoCall = () => {
    addSystemMsg("ভিডিও কল সংযোগ বন্ধ করা হচ্ছে...", "info");

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setIsVideoCalling(false);
    setSimulatedLocalFeed(false);
    setSimulatedRemoteFeed(false);

    Object.keys(peerConnectionsRef.current).forEach(id => {
      try {
        peerConnectionsRef.current[id].close();
      } catch (_) {}
    });
    peerConnectionsRef.current = {};

    addSystemMsg("ভিডিও কল সফলভাবে সমাপ্ত হয়েছে।", "info");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msgText = chatInput.trim();
    setChatInput("");

    const selfMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type: "chat",
      codename,
      message: msgText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, selfMsg]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat",
        text: msgText
      }));
    }
  };

  const handleFileShare = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject files larger than 15MB
    if (file.size > 15 * 1024 * 1024) {
      addSystemMsg("সুরক্ষিত স্থানান্তরে ফাইলের সর্বোচ্চ সীমা ১৫ মেগাবাইট!", "error");
      return;
    }

    addSystemMsg("ফাইলটি প্রসেস করা হচ্ছে, দয়া করে অপেক্ষা করুন...", "info");

    const reader = new FileReader();
    reader.onload = () => {
      const b64Data = reader.result as string;

      const selfMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        type: "chat",
        codename,
        message: `ফাইল শেয়ার করেছেন: ${file.name}`,
        timestamp: new Date(),
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: b64Data
        }
      };

      setChatMessages(prev => [...prev, selfMsg]);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "chat",
          text: `ফাইল শেয়ার করেছেন: ${file.name}`,
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: b64Data
          }
        }));
      }

      addSystemMsg(`ফাইল সফলভাবে শেয়ার করা হয়েছে: ${file.name}`, "system");
    };

    reader.onerror = () => {
      addSystemMsg("ফাইলটি ফাইল রিডারে লোড করতে সমস্যা হয়েছে।", "error");
    };

    reader.readAsDataURL(file);
  };

  // Calculate geolocated metrics nicely
  const getSimulatedPathMetrics = () => {
    const from = location;
    const to = friendLocation;
    
    // Matrix Lookup
    const distData = DISTANCE_MATRIX[from]?.[to] ?? DISTANCE_MATRIX[to]?.[from] ?? null;
    const distanceKm = distData !== null ? distData : 185; // Default average fallback
    
    // Light speed in copper/fiber ~200km/ms + standard protocol frame routing packet timeslice
    const routeLatencyMs = Math.round((distanceKm / 200) + 12); 
    
    return {
      distanceKn: distanceKm,
      latencyMs: routeLatencyMs
    };
  };

  const pathMetrics = getSimulatedPathMetrics();

  // Draw the high performance wave oscillator path for SVG display
  const getWavePath = () => {
    const width = 360;
    const height = 48;
    const midY = height / 2;
    let points: string[] = [];

    // Combine volume scales
    const activeVolume = isLocalSpeaking ? localVolume : (remoteSpeakerId ? remoteVolume : 0);
    const scaleFactor = Math.min(Math.max(activeVolume / 8, isLocalSpeaking || remoteSpeakerId ? 1.5 : 0.3), 16);

    for (let x = 0; x <= width; x += 3) {
      // Create noise/waveform calculation using sin/cos combinations
      const rawSine = Math.sin((x / 18) + wavePhase * 1.5);
      const subHarmonic = Math.cos((x / 10) - wavePhase * 2.5) * 0.35;
      
      // Amplification depends entirely on raw volume registers
      const amplitude = (rawSine + subHarmonic) * scaleFactor;
      
      const y = midY + amplitude;
      points.push(`${x},${y}`);
    }

    return `M ${points.join(" L ")}`;
  };

  return (
    <TacticalView
      status={status}
      currentTime={currentTime}
      batteryLevel={batteryLevel}
      audioMuted={audioMuted}
      setAudioMuted={setAudioMuted}
      handleDisconnect={handleDisconnect}
      isJoined={isJoined}
      codename={codename}
      setCodename={setCodename}
      channel={channel}
      setChannel={setChannel}
      location={location}
      setLocation={setLocation}
      friendLocation={friendLocation}
      setFriendLocation={setFriendLocation}
      pathMetrics={pathMetrics}
      handleConnect={handleConnect}
      BANGLADESH_DISTRICTS={BANGLADESH_DISTRICTS}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      users={users}
      isLocalSpeaking={isLocalSpeaking}
      isHandsFree={isHandsFree}
      setIsHandsFree={setIsHandsFree}
      triggerTransmissionStart={triggerTransmissionStart}
      triggerTransmissionStop={triggerTransmissionStop}
      remoteSpeakerId={remoteSpeakerId}
      remoteSpeakerName={remoteSpeakerName}
      getWavePath={getWavePath}
      localVolume={localVolume}
      remoteVolume={remoteVolume}
      isVideoCalling={isVideoCalling}
      simulatedLocalFeed={simulatedLocalFeed}
      simulatedRemoteFeed={simulatedRemoteFeed}
      localVideoRef={localVideoRef}
      remoteVideoRef={remoteVideoRef}
      startVideoCall={startVideoCall}
      stopVideoCall={stopVideoCall}
      chatMessages={chatMessages}
      chatInput={chatInput}
      setChatInput={setChatInput}
      handleSendMessage={handleSendMessage}
      handleFileShare={handleFileShare}
      chatBottomRef={chatBottomRef}
      remoteStream={remoteStream}
    />
  );
}
