import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, Coffee, Heart, Leaf, MessageCircle, Pause, Play, Plus, Send, SkipForward, Sparkles, Timer, Users, Waves, X } from 'lucide-react'
import { environments, friends, prompts, type EnvironmentId, type FriendId } from './data'
import { formatTime } from './timer'

type Screen = 'home' | 'invite' | 'invitations' | 'environment' | 'duration' | 'preparing' | 'room' | 'break' | 'summary'
type Activity = 'chat' | 'drinks' | 'encourage'
type Reaction = { icon: string; label: string } | null
const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`
const prepSteps = ['Scanning available space', 'Preparing study environment', 'Connecting friends', 'Holographic room ready']
const reactionOptions = [{ icon: '👋', label: 'Wave' }, { icon: '👍', label: 'Thumbs up' }, { icon: '💜', label: 'Heart' }, { icon: '✨', label: 'Encouragement' }]

function Scene({ environment, chosenFriends, reaction, compact = false, holograms = false }: { environment: EnvironmentId; chosenFriends: typeof friends[number][]; reaction?: Reaction; compact?: boolean; holograms?: boolean }) {
    return <div className={`scene scene-${environment} ${compact ? 'scene-compact' : ''}`}>
      <img className="scene-art" src={asset(`environments/${environment}.svg`)} alt={`${environments.find(item => item.id === environment)!.name} illustrated study space`} />
      <div className="scene-vignette" />
      <div className="scene-ambience" aria-hidden="true"><span /><span /><span /><span /></div>
      {holograms && <div className="scene-friends">{chosenFriends.map((friend, index) => <div className="hologram" key={friend.id} style={{ animationDelay: `${index * 180}ms` }}><img src={asset(`avatars/${friend.id}.svg`)} alt="" /><span>{friend.name}</span></div>)}</div>}
      {reaction && holograms && <div className="floating-reaction" role="status">{reaction.icon} <span>{reaction.label} sent</span></div>}
    </div>
  }


function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedFriends, setSelectedFriends] = useState<FriendId[]>(['maya', 'jordan'])
  const [inviteMode, setInviteMode] = useState<'individual' | 'group'>('group')
  const [inviteStep, setInviteStep] = useState(0)
  const [environment, setEnvironment] = useState<EnvironmentId>('library')
  const [duration, setDuration] = useState(25)
  const [prepStep, setPrepStep] = useState(0)
  const [focusedMs, setFocusedMs] = useState(0)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [activity, setActivity] = useState<Activity>('chat')
  const [promptIndex, setPromptIndex] = useState(0)
  const [drink, setDrink] = useState('Chai')
  const [encourageFriend, setEncourageFriend] = useState<FriendId>('maya')
  const [encouragement, setEncouragement] = useState('')
  const [reaction, setReaction] = useState<Reaction>(null)
  const [showReactions, setShowReactions] = useState(false)
  const [modal, setModal] = useState<'rooms' | 'end' | null>(null)
  const modalCloseRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const runningStartRef = useRef<number | null>(null)
  const focusedBeforeRunRef = useRef(0)
  const totalMs = duration * 60_000
  const remainingSeconds = Math.max(0, Math.ceil((totalMs - focusedMs) / 1000))
  const chosenFriends = friends.filter(friend => selectedFriends.includes(friend.id))
  const chosenEnvironment = environments.find(item => item.id === environment)!
  const setupScreens: Screen[] = ['invite', 'invitations', 'environment', 'duration', 'preparing']
  const setupIndex = setupScreens.indexOf(screen)

  useEffect(() => {
    if (screen !== 'invitations' || inviteStep >= selectedFriends.length + 1) return
    const id = window.setTimeout(() => setInviteStep(value => value + 1), 850)
    return () => window.clearTimeout(id)
  }, [screen, inviteStep, selectedFriends.length])

  useEffect(() => {
    if (screen !== 'preparing' || prepStep >= prepSteps.length) return
    const id = window.setTimeout(() => setPrepStep(value => value + 1), 700)
    return () => window.clearTimeout(id)
  }, [screen, prepStep])

  useEffect(() => {
    if (!running || screen !== 'room') return
    const update = () => {
      const elapsed = focusedBeforeRunRef.current + (Date.now() - (runningStartRef.current ?? Date.now()))
      if (elapsed >= totalMs) {
        focusedBeforeRunRef.current = totalMs
        runningStartRef.current = null
        setFocusedMs(totalMs)
        setRunning(false)
        setCompleted(true)
      } else setFocusedMs(elapsed)
    }
    update()
    const id = window.setInterval(update, 200)
    return () => window.clearInterval(id)
  }, [running, screen, totalMs])

  useEffect(() => {
    if (!reaction) return
    const id = window.setTimeout(() => setReaction(null), 2600)
    return () => window.clearTimeout(id)
  }, [reaction])

  useEffect(() => {
    if (!modal) return
    previousFocusRef.current = document.activeElement as HTMLElement
    modalCloseRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModal(null)
      if (event.key === 'Tab') {
        const buttons = Array.from(modalRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
        if (!buttons.length) return
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); previousFocusRef.current?.focus() }
  }, [modal])

  function resetSession() {
    setSelectedFriends(['maya', 'jordan']); setInviteMode('group'); setInviteStep(0)
    setEnvironment('library'); setDuration(25); setPrepStep(0)
    setFocusedMs(0); focusedBeforeRunRef.current = 0; runningStartRef.current = null
    setRunning(false); setCompleted(false); setActivity('chat'); setPromptIndex(0)
    setDrink('Chai'); setEncouragement(''); setReaction(null); setShowReactions(false)
    setModal(null)
  }
  function startNew() { resetSession(); setScreen('invite') }
  function freezeTimer() {
    if (runningStartRef.current !== null) {
      const value = Math.min(totalMs, focusedBeforeRunRef.current + Date.now() - runningStartRef.current)
      focusedBeforeRunRef.current = value; setFocusedMs(value); runningStartRef.current = null
    }
    setRunning(false)
  }
  function resumeTimer() {
    if (completed) return
    runningStartRef.current = Date.now(); setRunning(true)
  }
  function finishSession() { freezeTimer(); setModal(null); setScreen('summary') }
  function takeBreak() { freezeTimer(); setShowReactions(false); setScreen('break') }
  function toggleFriend(id: FriendId) {
    setInviteMode('individual')
    setSelectedFriends(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }
  function beginInvites() { if (selectedFriends.length) { setInviteStep(0); setScreen('invitations') } }
  function beginPrep() { setPrepStep(0); setScreen('preparing') }
  function enterRoom() { setScreen('room'); resumeTimer() }
  function selectedNames() { return chosenFriends.map(friend => friend.name).join(chosenFriends.length === 2 ? ' and ' : ', ') }


  return <div className="app-shell">
    <header className="site-header"><button className="brand" onClick={() => { freezeTimer(); setScreen('home') }} aria-label="StudySphere home"><span className="brand-mark"><Sparkles size={21} /></span><span>Study<span>Sphere</span></span></button><span className="header-label"><span className="status-dot" /> A little closer, from anywhere</span></header>
    <main key={screen} className="screen-enter">
      {screen !== 'home' && screen !== 'room' && screen !== 'break' && screen !== 'summary' && <div className="top-progress"><span>CREATE A ROOM</span><div className="progress-track" aria-label={`Setup progress ${Math.min(100, Math.round((setupIndex + 1) / 5 * 100))}%`}><span style={{ width: `${Math.min(100, (setupIndex + 1) / 5 * 100)}%` }} /></div><span>{Math.min(setupIndex + 1, 5)} / 5</span></div>}

      {screen === 'home' && <div className="home-layout"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14} /> YOUR SPACE TOGETHER</div><h1>Study together,<br /><em>even when apart.</em></h1><p>Bring your friends into a shared study space, wherever you are. Settle in, focus, and make room for the little moments in between.</p><div className="hero-actions"><button className="button button-primary" onClick={startNew}><Plus size={19} /> Create Study Room <ArrowRight size={18} /></button><button className="button button-outline" onClick={() => setModal('rooms')}>My Rooms</button></div><div className="hero-highlights"><span><Users size={16} /> Study with friends</span><span><Leaf size={16} /> Explore cozy spaces</span><span><Coffee size={16} /> Take meaningful breaks</span></div></div><div className="hero-visual"><Scene environment={environment} chosenFriends={chosenFriends} /><div className="hero-overlay-card"><div className="mini-avatars">{friends.slice(0, 2).map(friend => <img key={friend.id} src={asset(`avatars/${friend.id}.svg`)} alt="" />)}</div><div><strong>Better together</strong><span>Your study buddies are here</span></div><span className="online-dot" /></div><div className="visual-caption"><Sparkles size={15} /> Your next favorite place to focus</div></div></div>}

      {screen === 'invite' && <div className="content-narrow"><button className="text-back" onClick={() => setScreen('home')}><ArrowLeft size={16} /> Back</button><div className="section-heading"><span className="eyebrow">STEP 01 · INVITE FRIENDS</span><h1>Who would you like<br />to study with?</h1><p>Choose some friends to join your study room.</p></div><div className="segmented" role="group" aria-label="Invitation mode"><button className={inviteMode === 'group' ? 'active' : ''} onClick={() => { setInviteMode('group'); setSelectedFriends(['maya', 'jordan']) }}><Users size={17} /> Study Buddies</button><button className={inviteMode === 'individual' ? 'active' : ''} onClick={() => setInviteMode('individual')}><Check size={17} /> Choose friends</button></div><div className="friend-grid">{friends.map(friend => <button key={friend.id} className={`friend-card ${selectedFriends.includes(friend.id) ? 'selected' : ''}`} onClick={() => toggleFriend(friend.id)} aria-pressed={selectedFriends.includes(friend.id)}><img src={asset(`avatars/${friend.id}.svg`)} alt={`${friend.name} illustrated avatar`} /><span className="friend-info"><strong>{friend.name}</strong><small><span className="availability-dot" /> Available</small><small className="friend-note">{friend.note}</small></span><span className="selection-check">{selectedFriends.includes(friend.id) && <Check size={15} />}</span></button>)}</div><div className="selection-summary"><span>{selectedFriends.length ? `${selectedFriends.length} ${selectedFriends.length === 1 ? 'friend' : 'friends'} selected` : 'Choose at least one friend to continue.'}</span><button className="button button-primary" disabled={!selectedFriends.length} onClick={beginInvites}>Send invitations <ArrowRight size={18} /></button></div><p className="simulation-note">Demo experience: invitations and responses are simulated.</p></div>}

      {screen === 'invitations' && <div className="content-narrow"><button className="text-back" onClick={() => setScreen('invite')}><ArrowLeft size={16} /> Back to friends</button><div className="section-heading centered"><span className="eyebrow">STUDY BUDDIES</span><h1>{inviteStep > selectedFriends.length ? 'Your friends are ready!' : 'Sending invitations...'}</h1><p>{inviteStep > selectedFriends.length ? 'Everyone is here. Let’s find your study space.' : 'Your friends are getting ready to join this demo room.'}</p></div><div className="invitation-list" aria-live="polite">{chosenFriends.map((friend, index) => <div className="invitation-row" key={friend.id}><img src={asset(`avatars/${friend.id}.svg`)} alt="" /><strong>{friend.name}</strong><span className={inviteStep > index ? 'accepted' : 'invited'}>{inviteStep > index ? <><CheckCircle2 size={17} /> Accepted</> : 'Invited'}</span></div>)}</div>{inviteStep <= selectedFriends.length && <div className="loading-line"><span style={{ width: `${inviteStep / (selectedFriends.length + 1) * 100}%` }} /></div>}<div className="bottom-actions"><button className="button button-outline" onClick={() => setInviteStep(selectedFriends.length + 1)}><SkipForward size={17} /> Skip Animation</button><button className="button button-primary" disabled={inviteStep <= selectedFriends.length} onClick={() => setScreen('environment')}>Choose a Space <ArrowRight size={18} /></button></div><p className="simulation-note centered">These invitations are part of the simulation. No one is contacted.</p></div>}

      {screen === 'environment' && <div className="content-wide"><button className="text-back" onClick={() => setScreen('invite')}><ArrowLeft size={16} /> Back</button><div className="section-heading"><span className="eyebrow">STEP 02 · CHOOSE A SPACE</span><h1>Choose your study space</h1><p>Where would you like to study today?</p></div><div className="environment-layout"><div className="environment-cards">{environments.map(item => <button key={item.id} className={`environment-card ${environment === item.id ? 'selected' : ''}`} onClick={() => setEnvironment(item.id)} aria-pressed={environment === item.id}><img src={asset(`environments/${item.id}.svg`)} alt="" loading="lazy" /><span className="environment-card-copy"><strong>{item.name}</strong><small>{item.description}</small></span><span className="selection-check">{environment === item.id && <Check size={15} />}</span></button>)}</div><div className="environment-preview"><div className="preview-image"><img src={asset(`environments/${environment}.svg`)} alt={`${chosenEnvironment.name} illustrated preview`} /><div className={`preview-particles ${environment}`} aria-hidden="true"><span /><span /><span /></div></div><div className="preview-caption"><div><span className="eyebrow">YOUR SELECTED SPACE</span><h2>{chosenEnvironment.name}</h2><p>{chosenEnvironment.ambience}</p></div><Sparkles size={22} /></div></div></div><div className="bottom-actions"><button className="button button-outline" onClick={() => setScreen('invite')}><ArrowLeft size={17} /> Back</button><button className="button button-primary" onClick={() => setScreen('duration')}>Continue <ArrowRight size={18} /></button></div></div>}

      {screen === 'duration' && <div className="content-narrow"><button className="text-back" onClick={() => setScreen('environment')}><ArrowLeft size={16} /> Back</button><div className="section-heading"><span className="eyebrow">STEP 03 · FOCUS TIME</span><h1>Set your focus time</h1><p>Choose how long you and your friends would like to study.</p></div><div className="duration-grid">{[15, 25, 45].map(value => <button key={value} className={`duration-card ${duration === value ? 'selected' : ''}`} onClick={() => setDuration(value)} aria-pressed={duration === value}><Timer size={22} /><strong>{value}</strong><span>minutes</span>{duration === value && <CheckCircle2 className="duration-check" size={18} />}</button>)}</div><div className="ready-card"><div className="ready-icon"><Sparkles size={20} /></div><div><span className="eyebrow">YOUR SESSION</span><p>You’re about to study with <strong>{selectedNames()}</strong> in <strong>{chosenEnvironment.name}</strong> for <strong>{duration} minutes</strong>.</p></div></div><div className="bottom-actions"><button className="button button-outline" onClick={() => setScreen('environment')}><ArrowLeft size={17} /> Back</button><button className="button button-primary" onClick={beginPrep}>Enter Study Room <ArrowRight size={18} /></button></div></div>}

      {screen === 'preparing' && <div className="preparing-layout"><div className="preparing-scene"><Scene environment={environment} chosenFriends={chosenFriends} holograms={prepStep >= prepSteps.length} /><div className="scan-line" aria-hidden="true" /></div><div className="preparing-card"><button className="text-back" onClick={() => setScreen('duration')}><ArrowLeft size={16} /> Back</button><span className="eyebrow"><Sparkles size={14} /> ROOM PREPARATION · SIMULATED</span><h1>{prepStep >= prepSteps.length ? 'Your room is ready.' : 'Preparing your holographic study room...'}</h1><div className="preparation-steps" aria-live="polite">{prepSteps.map((step, index) => <div key={step} className={`preparation-step ${prepStep > index ? 'done' : prepStep === index ? 'current' : ''}`}><span>{prepStep > index ? <Check size={15} /> : index + 1}</span>{step}{prepStep === index && <span className="step-pulse" />}</div>)}</div>{prepStep >= prepSteps.length && <div className="joined-message" aria-live="polite">{chosenFriends.map(friend => <p key={friend.id}>{friend.name} has joined!</p>)}</div>}<div className="bottom-actions"><button className="button button-outline" onClick={() => setPrepStep(prepSteps.length)}><SkipForward size={17} /> Skip Animation</button><button className="button button-primary" disabled={prepStep < prepSteps.length} onClick={enterRoom}>Start Studying <ArrowRight size={18} /></button></div></div></div>}

      {screen === 'room' && <div className="room-layout"><div className="room-topline"><div><span className="eyebrow">YOUR STUDY ROOM</span><h1>{chosenEnvironment.name}</h1></div><span className={`session-pill ${running ? 'is-running' : ''}`}><span className="status-dot" /> {completed ? 'Focus complete' : running ? 'Focus in progress' : 'Session paused'}</span></div><div className="room-scene-wrap"><Scene environment={environment} chosenFriends={chosenFriends} reaction={reaction} holograms /><div className="room-scene-label"><Sparkles size={15} /> {chosenFriends.length} {chosenFriends.length === 1 ? 'friend' : 'friends'} studying with you <span>· simulated</span></div></div><div className="room-control-panel"><div className="timer-block"><span className="eyebrow">FOCUS TIMER</span><div className={`timer-digits ${completed ? 'complete' : ''}`} role="timer" aria-label={`${remainingSeconds} seconds remaining`}>{formatTime(remainingSeconds)}</div><span className="timer-status" aria-live="polite">{completed ? 'Focus session complete!' : running ? 'A little progress, one moment at a time.' : 'Session paused.'}</span></div><div className="room-actions">{!completed && <button className="button button-primary" onClick={running ? freezeTimer : resumeTimer}>{running ? <Pause size={18} /> : <Play size={18} />}{running ? 'Pause' : 'Resume'}</button>}<button className="button button-outline" onClick={takeBreak}><Coffee size={18} /> {completed ? 'Take a Break' : 'Take Break'}</button>{completed ? <button className="button button-quiet" onClick={finishSession}>Finish Session <ArrowRight size={17} /></button> : <button className="button button-quiet" onClick={() => { freezeTimer(); setModal('end') }}>End Session</button>}</div></div><div className="room-footer"><div className="room-friends">{chosenFriends.map(friend => <span key={friend.id}><img src={asset(`avatars/${friend.id}.svg`)} alt="" />{friend.name}</span>)}</div><div className="reaction-area"><button className="button button-small button-outline" onClick={() => setShowReactions(value => !value)} aria-expanded={showReactions}><Heart size={16} /> Reactions</button>{showReactions && <div className="reaction-picker" aria-label="Choose a reaction">{reactionOptions.map(option => <button key={option.label} onClick={() => { setReaction(option); setShowReactions(false) }}><span>{option.icon}</span>{option.label}</button>)}</div>}</div></div></div>}

      {screen === 'break' && <div className="break-layout"><div className="break-intro"><span className="eyebrow">A MOMENT TOGETHER</span><h1>Time for a little break!</h1><p>Enjoy a moment with your study buddies. Your focus timer is paused.</p></div><div className="break-scene"><Scene environment={environment} chosenFriends={chosenFriends} compact holograms />{activity === 'encourage' && encouragement && <div className="scene-encouragement" role="status"><Heart size={16} /> To {friends.find(friend => friend.id === encourageFriend)?.name}: “{encouragement}” <span>· simulated</span></div>}</div><div className="activity-tabs" role="group" aria-label="Break activity"><button className={activity === 'chat' ? 'active' : ''} onClick={() => setActivity('chat')}><MessageCircle size={18} /> Casual Chat</button><button className={activity === 'drinks' ? 'active' : ''} onClick={() => setActivity('drinks')}><Coffee size={18} /> Virtual Chai Break</button><button className={activity === 'encourage' ? 'active' : ''} onClick={() => setActivity('encourage')}><Heart size={18} /> Send Encouragement</button></div><div className="activity-panel" aria-live="polite">{activity === 'chat' && <><div className="activity-icon"><MessageCircle size={23} /></div><span className="eyebrow">CONVERSATION STARTER</span><h2>“{prompts[promptIndex]}”</h2><button className="button button-outline" onClick={() => setPromptIndex(value => (value + 1) % prompts.length)}>Next Question <ChevronRight size={17} /></button></>}{activity === 'drinks' && <><div className="drink-illustration" aria-hidden="true">{drink === 'Chai' ? '🍵' : drink === 'Coffee' ? '☕' : '🍫'}</div><span className="eyebrow">PICK A COZY DRINK</span><h2>Enjoy your {drink.toLowerCase()} with your study buddies!</h2><div className="choice-row">{['Chai', 'Coffee', 'Hot chocolate'].map(item => <button key={item} className={drink === item ? 'choice selected' : 'choice'} onClick={() => setDrink(item)} aria-pressed={drink === item}>{item}</button>)}</div></>}{activity === 'encourage' && <><div className="activity-icon"><Heart size={23} /></div><span className="eyebrow">A LITTLE SUPPORT GOES A LONG WAY</span><h2>Send a kind thought</h2><div className="choice-row">{chosenFriends.map(friend => <button key={friend.id} className={encourageFriend === friend.id ? 'choice selected' : 'choice'} onClick={() => setEncourageFriend(friend.id)} aria-pressed={encourageFriend === friend.id}>{friend.name}</button>)}</div><div className="choice-row">{["You've got this!", 'Nice work today!', 'Keep going!'].map(message => <button key={message} className="choice" onClick={() => setEncouragement(message)}><Send size={14} /> {message}</button>)}</div>{encouragement && <p className="encouragement-bubble" role="status">To {friends.find(friend => friend.id === encourageFriend)?.name}: “{encouragement}” <small>· simulated</small></p>}</>}</div><div className="bottom-actions break-actions"><button className="button button-outline" onClick={() => { setScreen('room'); if (!completed) resumeTimer() }}><ArrowLeft size={17} /> Back to Studying</button><button className="button button-primary" onClick={finishSession}>Finish Session <ArrowRight size={18} /></button></div></div>}

      {screen === 'summary' && <div className="summary-layout"><div className="summary-art"><Scene environment={environment} chosenFriends={chosenFriends} compact /><div className="summary-sparkle"><Sparkles size={32} /></div></div><div className="summary-copy"><span className="eyebrow">SESSION COMPLETE</span><h1>Nice work today!</h1><p>You made progress and spent some time with your friends.</p><div className="summary-card"><div><span><BookOpen size={17} /> Study space</span><strong>{chosenEnvironment.name}</strong></div><div><span><Users size={17} /> With friends</span><strong>{selectedNames()}</strong></div><div><span><Timer size={17} /> Focused time</span><strong>{Math.floor(focusedMs / 60_000)} min {Math.floor((focusedMs % 60_000) / 1000)} sec</strong></div><div><span><CheckCircle2 size={17} /> Session</span><strong>{completed ? 'Completed' : 'Ended early'}</strong></div></div><p className="summary-quote">“Little study sessions add up.”</p><div className="summary-actions"><button className="button button-primary" onClick={startNew}><Plus size={18} /> Create Another Room</button><button className="button button-outline" onClick={() => { resetSession(); setScreen('home') }}>Back to Home</button></div></div></div>}
    </main>
    <footer className="site-footer"><span>StudySphere · Study together, even when apart.</span><span>A speculative study experience · All friend activity is simulated</span></footer>
    {modal && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null) }}><div ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button ref={modalCloseRef} className="modal-close" aria-label="Close dialog" onClick={() => setModal(null)}><X size={19} /></button>{modal === 'rooms' ? <><span className="eyebrow">MY ROOMS</span><h2 id="modal-title">Your study spaces</h2><p>Rooms in this prototype are created for the current session. Nothing is saved or shared online.</p><div className="empty-room"><Waves size={25} /><strong>No rooms yet</strong><span>Your next cozy study space is one click away.</span></div><button className="button button-primary modal-action" onClick={startNew}>Create Study Room <ArrowRight size={17} /></button></> : <><span className="eyebrow">END SESSION</span><h2 id="modal-title">Finish studying for now?</h2><p>Your focused time so far will appear in your session summary.</p><div className="modal-actions"><button className="button button-outline" onClick={() => setModal(null)}>Keep Studying</button><button className="button button-primary" onClick={finishSession}>End Session</button></div></>}</div></div>}
  </div>
}

export default App
