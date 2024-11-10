// CodeRoom.js
import React, { useEffect, useRef, useState } from "react";
import CodeRoomMembers from "../../components/CodeRoomComponents/CodeRoomMembers";
import { initSocket } from "../../Socket";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import CodeEditor from "../CodeEditor/CodeEditor";
import { toast } from "react-hot-toast";

const CodeRoom = () => {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);
  const codeRef = useRef(""); 
  const { roomId } = useParams();


  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        toast.success('CodeRoom id copied!')
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast.error('Failed to copy room code!')
      });
  };

  useEffect(() => {
    const init = async () => {
      if (!socketRef.current) {
        // Establish socket connection only once
        socketRef.current = await initSocket();

        socketRef.current.on("connect_error", handleError);
        socketRef.current.on("connect_failed", handleError);

        // Emit event to join the room
        socketRef.current.emit("join", {
          roomId,
          username: location.state?.username,
        });

        // Handle new client joining
        socketRef.current.on("joined", ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} has joined the room`);
          }
          setClients(clients);
        });

        // Handle code change from other clients
        socketRef.current.on("code-change", (data) => {
          if (data.roomId === roomId && data.code !== codeRef.current) {
            codeRef.current = data.code;
          }
        });

        // Handle client disconnection
        socketRef.current.on("disconnected", ({ socketId, username }) => {
          toast.success(`${username} left the room`);
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        });
      }
    };

    init();

    // Cleanup on component unmount
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off("joined");
      socketRef.current.off("disconnected");
      socketRef.current.off("code-change");
    };
  }, [roomId, navigate, location.state]);

  if (!location.state) {
    return <Navigate to="/codeRoom/:roomId" />;
  }

  return (
    <main className="codeRoomContainer">
      {/* Sidebar for Members */}
      <aside className="membersSideBar">
        <div className="memberSideHeader">
          <h1>Members</h1>
          <hr />
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto">
        <span className="mb-2 font-semibold">Members</span>
        {clients.map((client) => (
          <CodeRoomMembers key={client.socketId} username={client.username} />
        ))}
      </div>
      
        <div className="memberSideFooter">
          <hr />
          <button className="copyCodeBtn CodeRoomBtn" onClick={copyToClipboard}>Copy CodeRoom Id</button>
          <button className="leaveRoomBtn CodeRoomBtn" onClick={() => navigate('/home')}>Leave Room</button>
        </div>
      </aside>

      {/* Main Editor Area */}
      <div className="editor">
        <CodeEditor
          socketRef={socketRef}
          roomId={roomId}
      
          onCodeChange={(code) => {
            codeRef.current = code;
            socketRef.current.emit("code-change", { roomId, code });
          }}
        />
      </div>
    </main>
  );
};

export default CodeRoom;
