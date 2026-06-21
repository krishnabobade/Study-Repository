import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import { 
  MessageSquare, Send, Users, Plus, Hash, 
  Sparkles, ArrowLeft, Info, Smile, CheckCircle 
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'
import SkeletonBase, { SkeletonText } from '../components/shared/Skeleton'

const EMOJIS = ['👋', '👍', '🔥', '💡', '🎉', '💯', '😂', '👀', '💻']

export default function StudyRooms() {
  const { user } = useAuthStore()
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Create Room fields
  const [roomName, setRoomName] = useState('')
  const [roomDesc, setRoomDesc] = useState('')
  const [roomCourse, setRoomCourse] = useState(user?.course || '')
  const [roomSemester, setRoomSemester] = useState(user?.semester || '')
  
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Fetch Rooms
  useEffect(() => {
    setLoadingRooms(true)
    api.get('/rooms')
      .then(res => {
        setRooms(res.data.rooms || [])
        if (res.data.rooms?.length > 0) {
          setActiveRoom(res.data.rooms[0])
        }
      })
      .catch(() => toast.error('Failed to load study rooms'))
      .finally(() => setLoadingRooms(false))
  }, [])

  // Socket Connection setup
  useEffect(() => {
    if (!user) return
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
      : 'http://localhost:5000'
    
    const socket = io(backendUrl)
    socketRef.current = socket

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [user])

  // Join Room & Fetch Messages
  useEffect(() => {
    if (!activeRoom || !socketRef.current) return

    setLoadingMessages(true)
    
    // Join socket channel
    socketRef.current.emit('join_room', activeRoom._id)

    // Load messages from DB
    api.get(`/rooms/${activeRoom._id}/messages`)
      .then(res => {
        setMessages(res.data.messages || [])
      })
      .catch(() => toast.error('Failed to fetch messages'))
      .finally(() => setLoadingMessages(false))

    // Listen for new messages
    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg])
    }
    socketRef.current.on('new_room_message', handleNewMessage)

    return () => {
      socketRef.current.emit('leave_room', activeRoom._id)
      socketRef.current.off('new_room_message', handleNewMessage)
    }
  }, [activeRoom])

  // Auto Scroll Chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send Message
  const handleSendMessage = (e) => {
    e?.preventDefault()
    if (!newMessage.trim() || !activeRoom) return

    socketRef.current.emit('send_room_message', {
      roomId: activeRoom._id,
      senderId: user._id || user.id,
      content: newMessage.trim()
    })
    
    setNewMessage('')
  }

  // Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!roomName.trim()) return toast.error('Room name is required')

    try {
      const { data } = await api.post('/rooms', {
        name: roomName.trim(),
        description: roomDesc.trim(),
        course: roomCourse,
        semester: roomSemester ? Number(roomSemester) : undefined
      })
      setRooms(prev => [data.room, ...prev])
      setActiveRoom(data.room)
      setShowCreateModal(false)
      setRoomName('')
      setRoomDesc('')
      toast.success('Study room created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room')
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-surface relative">
      {/* Rooms List Sidebar */}
      <div className="w-80 border-r border-border bg-panel/30 flex flex-col h-full shrink-0 hidden md:flex">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-ink-400" />
            <h2 className="font-display font-semibold text-text-main">Study Channels</h2>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 rounded-lg hover:bg-panel border border-border hover:border-ink-500/20 text-text-muted hover:text-ink-400 transition-all active:scale-95"
            title="Create Room"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Channels Search/Filter info */}
        <div className="px-4 py-2 border-b border-border bg-panel/10">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
            Course matches: {user?.course || 'None'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingRooms ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="p-3 space-y-2 rounded-xl bg-panel/20">
                <SkeletonBase className="h-4 w-32 rounded opacity-50" />
                <SkeletonBase className="h-3 w-48 rounded opacity-30" />
              </div>
            ))
          ) : (
            rooms.map(room => (
              <button
                key={room._id}
                onClick={() => setActiveRoom(room)}
                className={`w-full text-left p-3 rounded-xl transition-all border flex items-start gap-3 group relative ${
                  activeRoom?._id === room._id
                    ? 'bg-ink-500/10 border-ink-500/20 text-ink-300'
                    : 'border-transparent hover:bg-panel/40 text-text-muted hover:text-text-main'
                }`}
              >
                <div className={`p-2 rounded-xl border shrink-0 transition-all ${
                  activeRoom?._id === room._id
                    ? 'bg-ink-500/20 border-ink-500/30 text-ink-400'
                    : 'bg-panel border-border text-text-muted group-hover:text-text-main group-hover:bg-panel/80'
                }`}>
                  <Hash size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm truncate">{room.name}</span>
                    {room.course && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-ink-500/10 text-ink-300 rounded border border-ink-500/20 uppercase shrink-0">
                        {room.course}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted/70 truncate">{room.description || 'No description'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-surface relative">
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-panel/20 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="min-w-0 flex items-center gap-3">
                <div className="md:hidden">
                  {/* Mobile Back / List Toggle */}
                  <button 
                    onClick={() => setActiveRoom(null)} 
                    className="p-1.5 rounded-lg bg-panel hover:bg-panel/80 border border-border text-text-muted"
                  >
                    <ArrowLeft size={16} />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display font-bold text-base text-text-main truncate">{activeRoom.name}</h1>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase shrink-0">
                      Live Chat
                    </span>
                  </div>
                  <p className="text-xs text-text-muted truncate mt-0.5">{activeRoom.description || 'Welcome to the channel!'}</p>
                </div>
              </div>

              {activeRoom.course && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted font-medium bg-panel/30 border border-border px-3 py-1.5 rounded-xl">
                  <Info size={13} className="text-ink-400" />
                  <span>Targeting: <strong className="text-text-main font-semibold uppercase">{activeRoom.course} (Sem {activeRoom.semester})</strong></span>
                </div>
              )}
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                      <SkeletonBase className="w-8 h-8 rounded-full opacity-40 shrink-0" />
                      <div className="space-y-1.5">
                        <SkeletonBase className="h-3 w-20 opacity-30" />
                        <SkeletonBase className="h-10 w-64 rounded-2xl opacity-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-ink-500/20 to-ink-600/5 flex items-center justify-center border border-ink-500/20 mb-4 ring-8 ring-ink-500/[0.02]">
                    <MessageSquare size={26} className="text-ink-400 animate-pulse" />
                  </div>
                  <h3 className="font-display font-semibold text-text-main mb-1">Silence is golden, but chat is better!</h3>
                  <p className="text-sm text-text-muted max-w-sm">
                    Be the first to say hello, ask a study question, or post a reminder in this channel.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                  const isTeacher = msg.sender?.role === 'teacher';
                  const isAdmin = msg.sender?.role === 'admin' || msg.sender?.role === 'super_admin';

                  return (
                    <div key={msg._id || index} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} group`}>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border shadow-sm">
                        {msg.sender?.avatar ? (
                          <img src={msg.sender.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-ink-200">{msg.sender?.name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>

                      {/* Chat Bubble */}
                      <div className="max-w-[70%] space-y-1">
                        {/* Meta info */}
                        <div className={`flex items-center gap-1.5 text-xs text-text-muted/60 ${isMe ? 'justify-end' : ''}`}>
                          <span className="font-semibold text-text-main/80 truncate max-w-[120px]">
                            {msg.sender?.name}
                          </span>
                          
                          {/* Role Badges */}
                          {isTeacher && (
                            <span className="text-[8px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1 py-0.5 rounded uppercase">
                              Faculty
                            </span>
                          )}
                          {isAdmin && (
                            <span className="text-[8px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25 px-1 py-0.5 rounded uppercase">
                              Staff
                            </span>
                          )}

                          <span className="text-[10px]">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-br from-ink-500 to-ink-600 text-white rounded-tr-none shadow-md shadow-ink-500/10'
                            : 'bg-panel border border-border text-text-main rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-border bg-panel/10 shrink-0">
              {/* Emoji quick shortcuts */}
              <div className="flex gap-1.5 mb-2 px-2">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewMessage(p => p + emoji)}
                    className="text-sm p-1 rounded hover:bg-panel border border-transparent hover:border-border transition-all hover:scale-115 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={`Message #${activeRoom.name}...`}
                  className="input flex-1 py-3 px-4 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary p-3 rounded-xl flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          // Mobile state when no active room is chosen, show Room List
          <div className="flex-1 flex flex-col md:hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-panel/30">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-ink-400" />
                <h2 className="font-display font-semibold text-text-main">Study Channels</h2>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="p-1.5 rounded-lg hover:bg-panel border border-border text-text-muted hover:text-ink-400"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {rooms.map(room => (
                <button
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  className="w-full text-left p-4 rounded-2xl bg-panel/30 hover:bg-panel border border-border/80 flex items-start gap-4"
                >
                  <div className="p-2 bg-panel border border-border text-text-muted rounded-xl">
                    <Hash size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-sm truncate">{room.name}</span>
                      {room.course && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-ink-500/10 text-ink-300 rounded border border-ink-500/20 uppercase shrink-0">
                          {room.course}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted/70 truncate">{room.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-surface/50 backdrop-blur-md"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-container max-w-md w-full"
            >
              {/* Premium Glow auras */}
              <div className="modal-glow-1" />
              <div className="modal-glow-2" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-ink-500/10 flex items-center justify-center border border-ink-500/20">
                    <Users size={20} className="text-ink-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-semibold text-text-main">Create Study Room</h3>
                    <p className="text-xs text-text-muted">Spawn a new channel to discuss specific courses.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateRoom} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Room Name</label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={e => setRoomName(e.target.value)}
                      placeholder="e.g. Java Programming Sem 3"
                      className="input py-2.5"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Description</label>
                    <textarea
                      value={roomDesc}
                      onChange={e => setRoomDesc(e.target.value)}
                      placeholder="e.g. Share assignment guides and exam notes."
                      className="input py-2.5 h-16 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-muted">Course Code (Optional)</label>
                      <input
                        type="text"
                        value={roomCourse}
                        onChange={e => setRoomCourse(e.target.value)}
                        placeholder="e.g. BCA"
                        className="input py-2.5 uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-muted">Semester (Optional)</label>
                      <input
                        type="number"
                        value={roomSemester}
                        onChange={e => setRoomSemester(e.target.value)}
                        placeholder="e.g. 3"
                        className="input py-2.5"
                        min="1"
                        max="8"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn-secondary py-2.5 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary py-2.5 px-4"
                    >
                      Create Channel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
