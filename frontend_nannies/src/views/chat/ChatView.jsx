/**
 * ChatView - Vista mejorada del sistema de mensajería
 * Con fotos de perfil, indicadores de estado, timestamps mejorados y separadores de fecha
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Stack,
  Divider,
  Badge,
  CircularProgress,
  InputAdornment,
  Chip,
} from '@mui/material';
import { Send, MessageCircle, Search, Check, CheckCheck, Circle } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import chatApi from '@/api/chatApi';
import { useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';

export const ChatView = () => {
  const location = useLocation();
  const userIdFromState = location.state?.userId;
  const conversationIdFromState = location.state?.conversationId;
  const messagesEndRef = useRef(null);
  const userRole = useAuthStore(state => state.role);
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);
  const [hasProcessedUserId, setHasProcessedUserId] = useState(false);
  const [hasProcessedConversationId, setHasProcessedConversationId] = useState(false);

  // Auto-scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar conversaciones
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Si viene un conversationId desde navigation state, seleccionar esa conversación
  useEffect(() => {
    if (!conversationIdFromState || hasProcessedConversationId || conversations.length === 0) return;
    
    const conversation = conversations.find(conv => conv.id === conversationIdFromState);
    
    if (conversation) {
      setSelectedConversation(conversation);
      setHasProcessedConversationId(true);
    }
  }, [conversationIdFromState, conversations, hasProcessedConversationId]);

  // Si viene un userId desde navigation state, seleccionar esa conversación o preparar nueva
  useEffect(() => {
    if (!userIdFromState || hasProcessedUserId || conversations.length === 0) return;
    
    const conversation = conversations.find(conv => {
      const otherUser = getOtherUser(conv);
      return otherUser.id === userIdFromState;
    });
    
    if (conversation) {
      setSelectedConversation(conversation);
      setPendingUserId(null);
    } else {
      setPendingUserId(userIdFromState);
      setSelectedConversation(null);
      setMessages([]);
    }
    
    setHasProcessedUserId(true);
  }, [userIdFromState, conversations, hasProcessedUserId]);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      const interval = setInterval(() => loadMessages(selectedConversation.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const data = await chatApi.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!selectedConversation && !pendingUserId) {
      console.error('No hay conversación ni usuario pendiente');
      return;
    }

    try {
      let receiverId;
      
      if (selectedConversation) {
        // Determinar el ID del usuario actual basado en su rol
        const currentUserId = userRole === 'parent' 
          ? selectedConversation.parent 
          : selectedConversation.nanny;
          
        console.log('Current user ID:', currentUserId);
        console.log('User role:', userRole);
        console.log('Selected conversation:', selectedConversation);
        
        // El otro usuario es el que NO es el actual
        receiverId = currentUserId === selectedConversation.parent
          ? selectedConversation.nanny
          : selectedConversation.parent;
          
        console.log('Calculated receiver ID:', receiverId);
      } else {
        receiverId = pendingUserId;
        console.log('Using pending user ID:', receiverId);
      }

      console.log('Enviando mensaje:', { receiverId, content: newMessage.trim() });
      
      await chatApi.sendMessage(receiverId, newMessage.trim());
      setNewMessage('');
      
      if (selectedConversation) {
        await loadMessages(selectedConversation.id);
      } else {
        const updatedConversations = await chatApi.getConversations();
        const newConversation = updatedConversations.find(conv => {
          const otherUser = getOtherUser(conv);
          return otherUser.id === receiverId;
        });
        if (newConversation) {
          setSelectedConversation(newConversation);
          setHasProcessedUserId(true);
        }
        setPendingUserId(null);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        alert('Error al enviar mensaje: ' + (error.response.data?.error || error.message));
      } else if (error.request) {
        console.error('Error request (sin respuesta):', error.request);
        alert('Error: No se recibió respuesta del servidor');
      } else {
        console.error('Error configurando request:', error.message);
        alert('Error al enviar mensaje: ' + error.message);
      }
    }
  };

  const getOtherUser = (conversation) => {
    // Determinar cuál es el otro usuario según nuestro rol
    return userRole === 'parent'
      ? conversation.nanny_info
      : conversation.parent_info;
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getOtherUser(conv);
    const fullName = otherUser.full_name?.toLowerCase() || '';
    const username = otherUser.username?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || username.includes(search);
  });

  // Agrupar mensajes por fecha
  const groupMessagesByDate = (messages) => {
    const groups = {};
    // Invertir el array para que los mensajes más antiguos aparezcan primero
    const sortedMessages = [...messages].reverse();
    sortedMessages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  // Formatear timestamp relativo
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const messageGroups = groupMessagesByDate(messages);
  
  // Calcular el ID del usuario actual desde la conversación seleccionada
  const currentUserId = selectedConversation 
    ? (userRole === 'parent' ? selectedConversation.parent : selectedConversation.nanny)
    : null;

  return (
    <MainLayout>
      <Box sx={{ height: 'calc(100vh - 100px)', p: 2 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Lista de conversaciones */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <MessageCircle size={24} color="#667eea" />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Mensajes
                  </Typography>
                </Stack>
                <TextField
                  placeholder="Buscar conversación..."
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} color="#A0AEC0" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : filteredConversations.length === 0 ? (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'No se encontraron conversaciones' : 'No tienes conversaciones'}
                    </Typography>
                  </Box>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    const isSelected = selectedConversation?.id === conversation.id;

                    return (
                      <ListItem key={conversation.id} disablePadding>
                        <ListItemButton
                          selected={isSelected}
                          onClick={() => setSelectedConversation(conversation)}
                          sx={{
                            px: 2,
                            py: 1.5,
                            '&.Mui-selected': {
                              bgcolor: '#EDF2F7',
                              borderLeft: '4px solid #667eea',
                            },
                            '&:hover': {
                              bgcolor: '#F7FAFC',
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={conversation.unread_count}
                              color="error"
                              max={9}
                              overlap="circular"
                            >
                              <Avatar 
                                src={otherUser.profile_image}
                                sx={{ 
                                  width: 48, 
                                  height: 48,
                                  bgcolor: otherUser.role === 'nanny' ? '#667eea' : '#10B981',
                                  border: '2px solid white',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }}
                              >
                                {otherUser.full_name?.charAt(0) || otherUser.username?.charAt(0) || '?'}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primaryTypographyProps={{ component: 'div' }}
                            secondaryTypographyProps={{ component: 'div' }}
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                  {otherUser.full_name || otherUser.username}
                                </Typography>
                                {conversation.last_message && (
                                  <Typography variant="caption" component="span" sx={{ color: '#A0AEC0', fontSize: '0.7rem' }}>
                                    {formatRelativeTime(conversation.last_message.created_at)}
                                  </Typography>
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  component="span"
                                  sx={{
                                    color: conversation.unread_count > 0 ? '#2D3748' : '#718096',
                                    fontWeight: conversation.unread_count > 0 ? 600 : 400,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 200,
                                    display: 'block'
                                  }}
                                >
                                  {conversation.last_message?.content || 'Sin mensajes'}
                                </Typography>
                                <Chip 
                                  label={otherUser.role === 'nanny' ? 'Niñera' : 'Padre/Madre'} 
                                  size="small"
                                  sx={{ 
                                    mt: 0.5,
                                    height: 18,
                                    fontSize: '0.65rem',
                                    bgcolor: otherUser.role === 'nanny' ? '#EDE9FE' : '#D1FAE5',
                                    color: otherUser.role === 'nanny' ? '#6B46C1' : '#065F46'
                                  }}
                                />
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })
                )}
              </List>
            </Paper>
          </Grid>

          {/* Vista de chat */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
              {selectedConversation || pendingUserId ? (
                <>
                  {/* Header del chat con información del usuario */}
                  <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid #e0e0e0',
                    bgcolor: '#F7FAFC',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        src={selectedConversation ? getOtherUser(selectedConversation).profile_image : null}
                        sx={{ 
                          width: 56, 
                          height: 56,
                          bgcolor: selectedConversation 
                            ? (getOtherUser(selectedConversation).role === 'nanny' ? '#667eea' : '#10B981')
                            : '#9CA3AF',
                          border: '3px solid white',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {selectedConversation 
                          ? (getOtherUser(selectedConversation).full_name?.charAt(0) || 
                             getOtherUser(selectedConversation).username?.charAt(0) || '?')
                          : '?'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                          {selectedConversation 
                            ? (getOtherUser(selectedConversation).full_name || 
                               getOtherUser(selectedConversation).username)
                            : 'Nueva conversación'}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Circle size={8} fill="#48BB78" stroke="none" />
                          <Typography variant="caption" sx={{ color: '#718096' }}>
                            {selectedConversation 
                              ? (getOtherUser(selectedConversation).role === 'nanny' ? 'Niñera' : 'Padre/Madre')
                              : 'Envía el primer mensaje'}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Mensajes con separadores de fecha */}
                  <Box sx={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    p: 3, 
                    bgcolor: '#F9FAFB',
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}>
                    {loadingMessages ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : messages.length === 0 ? (
                      <Box sx={{ textAlign: 'center', p: 4 }}>
                        <MessageCircle size={48} color="#CBD5E0" style={{ marginBottom: 16 }} />
                        <Typography color="text.secondary" variant="h6" sx={{ fontWeight: 500 }}>
                          No hay mensajes
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          Envía el primero para iniciar la conversación
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={3}>
                        {Object.entries(messageGroups).map(([date, dateMessages]) => (
                          <Box key={date}>
                            {/* Separador de fecha */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 2 
                            }}>
                              <Divider sx={{ flex: 1 }} />
                              <Chip 
                                label={date} 
                                size="small" 
                                sx={{ 
                                  mx: 2,
                                  bgcolor: 'white',
                                  color: '#718096',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }} 
                              />
                              <Divider sx={{ flex: 1 }} />
                            </Box>

                            {/* Mensajes del día */}
                            <Stack spacing={1.5}>
                              {dateMessages.map((message, idx) => {
                                const isOwn = message.sender === currentUserId || message.sender?.id === currentUserId;
                                const showAvatar = !isOwn && (
                                  idx === 0 || 
                                  dateMessages[idx - 1].sender !== message.sender
                                );

                                return (
                                  <Box
                                    key={message.id}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                      alignItems: 'flex-end',
                                      gap: 1
                                    }}
                                  >
                                    {!isOwn && (
                                      <Avatar 
                                        src={message.sender_info?.profile_image}
                                        sx={{ 
                                          width: 32, 
                                          height: 32,
                                          visibility: showAvatar ? 'visible' : 'hidden',
                                          bgcolor: '#667eea'
                                        }}
                                      >
                                        {message.sender_info?.full_name?.charAt(0) || '?'}
                                      </Avatar>
                                    )}
                                    
                                    <Paper
                                      elevation={isOwn ? 2 : 1}
                                      sx={{
                                        maxWidth: '70%',
                                        px: 2,
                                        py: 1.5,
                                        bgcolor: isOwn ? '#667eea' : 'white',
                                        color: isOwn ? 'white' : '#2D3748',
                                        borderRadius: isOwn 
                                          ? '18px 18px 4px 18px' 
                                          : '18px 18px 18px 4px',
                                        boxShadow: isOwn 
                                          ? '0 4px 12px rgba(102, 126, 234, 0.25)' 
                                          : '0 2px 8px rgba(0,0,0,0.08)'
                                      }}
                                    >
                                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 0.5 }}>
                                        {message.content}
                                      </Typography>
                                      <Stack 
                                        direction="row" 
                                        spacing={0.5} 
                                        alignItems="center" 
                                        justifyContent="flex-end"
                                        sx={{ mt: 0.5 }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            opacity: 0.8,
                                            fontSize: '0.7rem',
                                            color: isOwn ? 'rgba(255,255,255,0.9)' : '#A0AEC0'
                                          }}
                                        >
                                          {new Date(message.created_at).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </Typography>
                                        {isOwn && (
                                          message.read ? (
                                            <CheckCheck size={14} color="rgba(255,255,255,0.9)" />
                                          ) : (
                                            <Check size={14} color="rgba(255,255,255,0.9)" />
                                          )
                                        )}
                                      </Stack>
                                    </Paper>

                                    {isOwn && <Box sx={{ width: 32 }} />}
                                  </Box>
                                );
                              })}
                            </Stack>
                          </Box>
                        ))}
                        <div ref={messagesEndRef} />
                      </Stack>
                    )}
                  </Box>

                  {/* Input de mensaje mejorado */}
                  <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid #e0e0e0',
                    bgcolor: 'white',
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <form onSubmit={handleSendMessage}>
                      <Stack direction="row" spacing={1} alignItems="flex-end">
                        <TextField
                          fullWidth
                          placeholder="Escribe un mensaje..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          size="small"
                          multiline
                          maxRows={4}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              bgcolor: '#F7FAFC',
                              '&:hover': {
                                bgcolor: '#EDF2F7',
                              }
                            }
                          }}
                        />
                        <IconButton
                          type="submit"
                          disabled={!newMessage.trim()}
                          sx={{
                            bgcolor: '#667eea',
                            color: 'white',
                            width: 48,
                            height: 48,
                            '&:hover': { 
                              bgcolor: '#5568d3',
                              transform: 'scale(1.05)'
                            },
                            '&:disabled': { 
                              bgcolor: '#CBD5E0',
                              color: '#A0AEC0'
                            },
                            transition: 'all 0.2s',
                            alignSelf: 'flex-end',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                          }}
                        >
                          <Send size={20} />
                        </IconButton>
                      </Stack>
                    </form>
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  p: 4,
                  textAlign: 'center'
                }}>
                  <MessageCircle size={64} color="#CBD5E0" style={{ marginBottom: 24 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2D3748', mb: 1 }}>
                    Selecciona una conversación
                  </Typography>
                  <Typography color="text.secondary">
                    Elige un chat de la lista para comenzar a enviar mensajes
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default ChatView;
