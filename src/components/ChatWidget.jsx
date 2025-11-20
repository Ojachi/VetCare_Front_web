import React, { useEffect, useRef, useState } from 'react';
import { chatApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const refreshTimeoutRef = useRef(null);
  const isGuest = !user;
  const isOwner = user?.role === 'OWNER';
  const guestLimit = 5;
  const ownerLimit = 20;
  const activeLimit = isGuest ? guestLimit : (isOwner ? ownerLimit : Infinity);
  const limitReached = activeLimit !== Infinity && messageCount >= activeLimit;

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await chatApi.status();
        if (!mounted) return;
        const nextStatus = (res.data?.status || 'active').toLowerCase();
        setStatus(nextStatus);
      } catch (err) {
        if (!mounted) return;
        setStatus('offline');
      }
    };
    fetchStatus();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [conversation, open]);

  useEffect(() => {
    if (!isGuest) {
      setMessageCount(0);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    }
  }, [isGuest, user?.role]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const scheduleGuestRefresh = () => {
    if (!isGuest) return;
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      setConversation([]);
      setMessageCount(0);
      setError('');
    }, 5 * 60 * 1000);
  };

  const limitErrorMessage = () => {
    if (isGuest) {
      return 'Has alcanzado el límite de 5 mensajes para invitados. Inicia sesión para continuar.';
    }
    if (isOwner) {
      return 'Has alcanzado el límite de 20 consultas. Vuelve más tarde para continuar chateando.';
    }
    return 'Has alcanzado el límite de mensajes disponible.';
  };

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    setError('');
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    if (loading) return;

    const trimmed = message.trim();
    if (!trimmed) return;
    if (limitReached) {
      setError(limitErrorMessage());
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      from: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    setConversation((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setError('');
    if (activeLimit !== Infinity) {
      const wasZeroGuestMessage = isGuest && messageCount === 0;
      setMessageCount((prev) => prev + 1);
      if (wasZeroGuestMessage) {
        scheduleGuestRefresh();
      }
    }

    try {
      const res = await chatApi.consult(trimmed);
      const botMessage = {
        id: `${Date.now()}-bot`,
        from: 'bot',
        text: res.data?.response || 'Lo siento, no pude obtener una respuesta en este momento.',
        timestamp: res.data?.timestamp || new Date().toISOString(),
        source: res.data?.source || 'AI',
      };
      setConversation((prev) => [...prev, botMessage]);
    } catch (err) {
      setError('No pudimos enviar tu mensaje. Inténtalo de nuevo.');
      setConversation((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot-error`,
          from: 'bot',
          text: 'Estamos experimentando problemas técnicos. Prueba más tarde.',
          timestamp: new Date().toISOString(),
          source: 'ERROR',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    if (status === 'checking') return 'Comprobando disponibilidad…';
    if (status === 'offline') return 'Asistente no disponible';
    return 'Disponible para ayudarte';
  };

  const isOffline = status === 'offline';
  const limitNoticeMessage = () => {
    if (isGuest) {
      return 'Has usado los 5 mensajes disponibles para invitados. Las respuestas se refrescarán automáticamente en 5 minutos o inicia sesión para continuar al instante.';
    }
    if (isOwner) {
      return 'Has alcanzado las 20 consultas disponibles para este periodo. Por favor vuelve más tarde para seguir conversando.';
    }
    return null;
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-teal text-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Asistente VetCare</p>
              <p className="text-xs text-white/80">{renderStatus()}</p>
            </div>
            <button
              type="button"
              onClick={toggleOpen}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Cerrar chat"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="flex-1 max-h-96 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {conversation.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-8">
                <p className="font-medium text-gray-700 mb-1">¡Hola! 👋</p>
                <p>¿En qué puedo ayudarte hoy?</p>
              </div>
            )}
            {conversation.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    msg.from === 'user' ? 'bg-teal text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  {msg.source && (
                    <p className="mt-1 text-[10px] uppercase tracking-wide opacity-70">
                      {msg.source === 'AI' ? 'Asistente IA' : msg.source}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="material-icons text-base animate-spin">autorenew</span>
                El asistente está escribiendo…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-xs border-t border-red-100">{error}</div>
          )}

          {limitReached && limitNoticeMessage() && (
            <div className="px-4 pt-2 text-[11px] text-yellow-700 bg-yellow-50 border-t border-yellow-100">
              {limitNoticeMessage()}
            </div>
          )}

          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              type="text"
              className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder={
                limitReached
                  ? 'Límite alcanzado'
                  : isOffline
                    ? 'Servicio no disponible'
                    : 'Escribe tu mensaje...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading || isOffline || limitReached}
            />
            <button
              type="submit"
              className="h-10 w-10 rounded-full bg-teal text-white flex items-center justify-center shadow-teal-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || isOffline || !message.trim() || limitReached}
              aria-label="Enviar mensaje"
            >
              <span className="material-icons text-base">send</span>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="h-14 w-14 rounded-full bg-teal text-white shadow-lg flex items-center justify-center hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
        aria-label="Abrir chat con el asistente"
        aria-expanded={open}
      >
        <span className="material-icons">{open ? 'close' : 'pets'}</span>
      </button>
    </div>
  );
};

export default ChatWidget;

