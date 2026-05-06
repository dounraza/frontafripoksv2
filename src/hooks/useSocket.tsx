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
  const joinedTableIdRef = React.useRef<string | null>(null);
  const [newEmoji, setNewEmoji] = useState<{ playerName: string, emoji: string } | null>(null);

  useEffect(() => {
    joinedTableIdRef.current = joinedTableId;
  }, [joinedTableId]);

  useEffect(() => {
    const checkTokenAndConnect = () => {
      const savedUser = localStorage.getItem('poker_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;

      if (!token) {
        console.log('No token found, waiting for login...');
        return;
      }

      if (socket) return; // Already connected

      console.log('Attempting to connect to socket at:', SOCKET_URL, '(with token)');
      
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: { token }
      });
      
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected successfully!');
        setError(null);
        
        // Auto-rejoin logic
        const activeTable = localStorage.getItem('active_table');
        const savedUserCurrent = localStorage.getItem('poker_user');
        if (activeTable && savedUserCurrent) {
          const user = JSON.parse(savedUserCurrent);
          console.log(`Auto-rejoining table ${activeTable} for ${user.name}`);
          newSocket.emit('joinTable', { 
            tableId: activeTable, 
            buyIn: "0" 
          });
          setJoinedTableId(activeTable);
        }
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setError("Erreur de server, ou server is down");
      });

      newSocket.on('tableUpdated', (data) => {
        // Sécurité : Ne mettre à jour que si les données correspondent à la table rejointe
        // On utilise le Ref pour éviter les closures périmées du useEffect initial
        if (!joinedTableIdRef.current || String(data.id) === String(joinedTableIdRef.current)) {
          setTableData(data);
        }
      });

      newSocket.on('newEmoji', (data) => {
        setNewEmoji(data);
        setTimeout(() => setNewEmoji(null), 3000); // Clear emoji after 3 seconds
      });

      newSocket.on('error', (err) => {
        console.error('Socket error event:', err);
        setError(err.message || 'An unknown error occurred');
      });
    };

    checkTokenAndConnect();

    // Re-check periodically or listen for storage changes if needed
    const interval = setInterval(checkTokenAndConnect, 2000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [socket]);

  const joinTable = useCallback((playerName: string, tableId: string, buyIn: string) => {
    if (socket) {
      // Nettoyer les données de la table précédente avant d'en rejoindre une nouvelle
      setTableData(null);
      // On envoieplayerName pour compatibilité mais le backend utilisera le token
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
    <SocketContext.Provider value={{ socket, tableData, error, joinTable, leaveTable, sendAction, sendEmoji, newEmoji }}>
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
