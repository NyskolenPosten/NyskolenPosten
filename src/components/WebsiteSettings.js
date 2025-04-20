import React, { useState, useEffect } from 'react';
import { websocketClient } from '../utils/websocket';
import { useAuth } from '../contexts/AuthContext';

const WebsiteSettings = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Koble til websocket
    websocketClient.connect();

    // Abonner på globalStatus oppdateringer
    const handleGlobalStatusUpdate = (data) => {
      setIsLocked(data.isLocked);
      setLockMessage(data.lockMessage);
    };

    websocketClient.subscribe('globalStatus', handleGlobalStatusUpdate);

    // Hent initial status
    fetch('/api/global-status')
      .then(res => res.json())
      .then(data => {
        setIsLocked(data.status.isLocked);
        setLockMessage(data.status.lockMessage);
      });

    return () => {
      websocketClient.unsubscribe('globalStatus', handleGlobalStatusUpdate);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/global-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isLocked,
          lockMessage,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere innstillinger');
      }
    } catch (error) {
      console.error('Feil ved oppdatering:', error);
    }
  };

  return (
    <div className="website-settings">
      <h2>Nettstedinnstillinger</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
            />
            Lås nettstedet
          </label>
        </div>
        
        <div className="form-group">
          <label>
            Låsbeskjed:
            <textarea
              value={lockMessage}
              onChange={(e) => setLockMessage(e.target.value)}
              placeholder="Skriv en beskjed som vises når nettstedet er låst..."
            />
          </label>
        </div>
        
        <button type="submit">Lagre innstillinger</button>
      </form>
    </div>
  );
};

export default WebsiteSettings; 