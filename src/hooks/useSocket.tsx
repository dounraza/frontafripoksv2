import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// On définit le type du contexte correctement
interface SocketContextType {
  socket: Socket | null;
  tableData: any;
  error: string | null;
  joinTable: (playerName: string, tableId: string, buyIn: string) => void;
  leaveTable: () => void;
  sendAction: (action: string, amount?: number) => void;
  sendEmoji: (emoji: string) => void;
  newEmoji: { playerName: string, emoji: string } | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tableData, setTableData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [joinedTableId, setJoinedTableId] = useState<string | null>(null);
  const [newEmoji, setNewEmoji] = useState<{ playerName: string, emoji: string } | null>(null);

  const connectSocket = useCallback((token: string) => {
    if (socket) return; // Déjà connecté

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connecté');
      setError(null);
      
      const activeTable = localStorage.getItem('active_table');
      if (activeTable) {
        newSocket.emit('joinTable', { tableId: activeTable, buyIn: "0" });
        setJoinedTableId(activeTable);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Erreur socket:', err);
      setError(`Erreur: ${err.message}`);
    });

    newSocket.on('tableUpdated', (data) => setTableData(data));
    newSocket.on('newEmoji', (data) => {
      setNewEmoji(data);
      setTimeout(() => setNewEmoji(null), 3000);
    });
  }, [socket]);

  useEffect(() => {
    // Tentative de connexion automatique au démarrage si token présent
    const savedUser = localStorage.getItem('poker_user');
    const token = savedUser ? JSON.parse(savedUser).token : null;
    if (token) connectSocket(token);

    return () => {
      if (socket) socket.disconnect();
    };
  }, [connectSocket]);

  const joinTable = useCallback((playerName: string, tableId: string, buyIn: string) => {
    if (socket) {
      socket.emit('joinTable', { playerName, tableId, buyIn });
      setJoinedTableId(tableId);
    }
  }, [socket]);

  const leaveTable = useCallback(() => {
    if (socket && joinedTableId) {
      socket.emit('leaveTable', { tableId: joinedTableId });
      setJoinedTableId(null);
      setTableData(null);
    }
  }, [socket, joinedTableId]);

  const sendAction = useCallback((action: string, amount: number = 0) => {
    if (socket && joinedTableId) {
      socket.emit('playerAction', { tableId: joinedTableId, action, amount });
    }
  }, [socket, joinedTableId]);

  const sendEmoji = useCallback((emoji: string) => {
    if (socket && joinedTableId) {
      socket.emit('emoji', { tableId: joinedTableId, emoji });
    }
  }, [socket, joinedTableId]);

  return (
    <SocketContext.Provider value={{ socket, tableData, error, joinTable, leaveTable, sendAction, sendEmoji, newEmoji, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
