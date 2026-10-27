import { useEffect, useRef, useState } from 'react'
import './ShopChat.css'

const API = 'http://localhost:8080/api/chat'
const prompts = ['Show baby care products', 'Where do you deliver?', 'How do I place an order?']
export default function ShopChat({ onFindProduct }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('checking')
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState('')
  const [error, setError] = useState('')
  const end = useRef(null)
  const input = useRef(null)
  const toggle = useRef(null)
  const request = useRef(null)
  const locked = useRef(false)

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    if (!open) return
    input.current?.focus()
    const controller = new AbortController()
    let alive = true
    const timer = setTimeout(() => controller.abort(), 8000)
    fetch(`${API}/status`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => setMode(data.mode === 'ai' ? 'ai' : 'catalogue'))
      .catch(() => { if (alive) setMode('offline') })
      .finally(() => clearTimeout(timer))
    return () => { alive = false; clearTimeout(timer); controller.abort() }
  }, [open])
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [messages, pending, error, open])
  function close() { setOpen(false); toggle.current?.focus() }
  async function send(text) {
    const question = text.trim()
    if (!question || question.length > 1200 || locked.current) return
    locked.current = true
    setError(''); setDraft(''); setPending(question)
    const controller = new AbortController()
    request.current = controller
    const timeout = setTimeout(() => controller.abort(), 50000)
    try {
      const history = messages.slice(-10).map(({ role, content }) => ({ role, content: content.slice(0, 800) }))
      const response = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ messages: [...history, { role: 'user', content: question }] }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'The assistant is unavailable. Please try again.')
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('The assistant returned an empty reply. Please try again.')
      if (data.mode === 'ai' || data.mode === 'catalogue') setMode(data.mode)
      setMessages(previous => [...previous, { role: 'user', content: question }, {
        role: 'assistant', content: data.reply, products: Array.isArray(data.products) ? data.products : [], mode: data.mode,
      }].slice(-40))
    } catch (failure) {
      setDraft(question)
      setError(failure.name === 'AbortError' ? 'The reply took too long. Please try again.' : failure instanceof TypeError ? 'Cannot reach the backend. Check that the backend terminal is running, then retry.' : failure.message)
    } finally {
      clearTimeout(timeout); locked.current = false; request.current = null; setPending('')
      input.current?.focus()
    }
  }
  return <div className="shop-chat">
    {open && <section className="shop-chat-panel" role="dialog" aria-label="CHITTI shopping assistant" onKeyDown={e => { if (e.key === 'Escape') close() }}>
      <header className="shop-chat-header">
        <div><span className="shop-chat-eyebrow">SRI RAJESWARI</span><h2>CHITTI</h2>
          {(mode === 'offline' || mode === 'checking') && <span className="shop-chat-status">{mode === 'offline' ? 'Backend unavailable' : 'Connecting…'}</span>}</div>
        <button className="shop-chat-icon" type="button" onClick={close} aria-label="Close chat">×</button>
      </header>
      <div className="shop-chat-feed" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
        <div className="shop-chat-welcome"><div className="shop-chat-mark" aria-hidden="true">✦</div><h3>A little help with your shopping.</h3><p>Find products, check prices, or learn how to order.</p></div>
        {messages.length === 0 && !pending && <div className="shop-chat-suggestions">{prompts.map(prompt => <button type="button" key={prompt} onClick={() => send(prompt)}>{prompt}<span aria-hidden="true">↗</span></button>)}</div>}
        {messages.map((message, index) => <div key={index} className={`shop-chat-message shop-chat-${message.role}`}>
          <span className="shop-chat-speaker">{message.role === 'user' ? 'You' : 'CHITTI'}</span>
          <p>{message.content}</p>
          {message.products?.length > 0 && <div className="shop-chat-products">{message.products.map(product => <article key={product.id}>
            <strong>{product.name}</strong><span>{product.price === 'unknown' ? 'Price unavailable' : `₹${product.price}`} · {product.stock == null ? 'Stock unknown' : product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
            <button type="button" onClick={() => { onFindProduct(product.name); close() }}>View in store <span aria-hidden="true">↗</span></button>
          </article>)}</div>}
        </div>)}
        {pending && <><div className="shop-chat-message shop-chat-user"><span className="shop-chat-speaker">You</span><p>{pending}</p></div><div className="shop-chat-thinking" role="status">Checking the catalogue…</div></>}
        <div ref={end} />
      </div>
      {error && <div className="shop-chat-error" role="alert">{error} <button type="button" onClick={() => send(draft)} disabled={!!pending}>Retry</button></div>}
      <footer className="shop-chat-footer">
        <p className="shop-chat-notice">Shopping help, not medical advice. In AI mode, messages and catalogue details go to Groq. Don’t share personal or health details.</p>
        <form onSubmit={e => { e.preventDefault(); send(draft) }}>
          <label className="shop-chat-sr" htmlFor="shop-chat-input">Ask a shopping question</label>
          <textarea id="shop-chat-input" ref={input} value={draft} onChange={e => setDraft(e.target.value)} maxLength={1200} rows={2} placeholder="Ask about a product…" disabled={!!pending} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(draft) } }} />
          <button className="shop-chat-send" type="submit" disabled={!!pending || !draft.trim()} aria-label="Send message">↑</button>
        </form>
        <div className="shop-chat-bottom"><span>{draft.length}/1200</span><button type="button" disabled={!!pending || !messages.length} onClick={() => { setMessages([]); setError(''); setDraft(''); input.current?.focus() }}>Clear conversation</button></div>
      </footer>
    </section>}
    <button type="button" className="shop-chat-toggle" ref={toggle} onClick={() => open ? close() : setOpen(true)} aria-expanded={open} aria-label={open ? 'Close CHITTI' : 'Open CHITTI'}><span aria-hidden="true">✦</span> {open ? 'Close CHITTI' : 'Chat with CHITTI'}</button>
  </div>
}
