import React, { useState } from 'react';

export default function RoomManager({ socket, setRoomId, setConnectedRoom }) {
  const [inputRoomId, setInputRoomId] = useState('')

  function createRoom() {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    console.log('Creating room:', newRoomId);
    setRoomId(newRoomId);
    socket.emit('createRoom', newRoomId);
    setConnectedRoom(true);
  }

  function joinRoom() {
    if (!inputRoomId) return
    setRoomId(inputRoomId);
    socket.emit('joinRoom', inputRoomId)
    setConnectedRoom(true);
  }

  return (
    <div className="room-manager">
      <input
        value={inputRoomId}
        onChange={(e) => setInputRoomId(e.target.value)}
        placeholder="Enter Room ID"
        className="px-2 py-1 border"
      />
      <button onClick={createRoom} className="px-3 py-1 mx-2">
        Create Room
      </button>
      <button onClick={joinRoom} className="px-3 py-1">
        Join Room
      </button>
    </div>
  );
};
