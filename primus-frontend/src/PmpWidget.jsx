import { useRef, useState } from 'react'
import { api } from './serviceApi'
import './StoreServices.css'

// Canvas uses literal text from the database. No AI or external image service.
async function downloadCard(card) {
  const canvas = document.createElement('canvas'); canvas.width = 1240
  const ctx = canvas.getContext('2d')
  const lines = []
  function wrap(text, size, bold = false) {
    ctx.font = `${bold ? 'bold ' : ''}${size}px Arial`
    const words = String(text || '').split(/\s+/); let line = ''
    for (const word of words) {
      if (ctx.measureText(line + ' ' + word).width > 1080 && line) { lines.push({text:line,size,bold}); line = '' }
      // Bound long unbroken fields as well as ordinary words.
      for (const char of (line ? ' ' : '') + word) {
        if (ctx.measureText(line + char).width > 1080) { lines.push({text:line,size,bold}); line = '' }
        line += char
      }
    }
    if (line) lines.push({text:line,size,bold})
    lines.push({text:'',size:12})
  }
  wrap('Recommended by Hanmumantha Rao (Babji)',28,true)
  wrap('President of Kakinada Rural Medical Association',24)
  wrap(card.hospital_name,38,true); wrap(card.doctor_name,34,true); wrap(card.qualifications,28)
  wrap(card.hospital_address,26); wrap(card.hospital_phone ? 'Hospital contact: ' + card.hospital_phone : '',26)
  wrap('Reference: ' + card.request_token,20)
  wrap('Issued: ' + new Date(card.published_at).toLocaleDateString('en-IN'),22)
  wrap('Recommended destination. This card is not a confirmed appointment.',22)
  canvas.height = 240 + lines.reduce((sum,line)=>sum+line.size*1.5,0)
  ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height)
  ctx.strokeStyle='#237a52';ctx.lineWidth=5;ctx.strokeRect(12,12,canvas.width-24,canvas.height-24)
  const logo = new Image(); logo.src='/logo.png'; await logo.decode()
  const scale=Math.min(140/logo.naturalWidth,140/logo.naturalHeight)
  ctx.drawImage(logo,50,45,logo.naturalWidth*scale,logo.naturalHeight*scale)
  ctx.fillStyle='#173a2c';ctx.font='bold 36px Arial';ctx.fillText('Sri Rajeswari',220,85)
  ctx.font='28px Arial';ctx.fillText('Wellness & General Stores',220,130)
  ctx.font='22px Arial';ctx.fillText('Sarpavaram–Panasapadu Road, Kakinada | 9398643062',220,170)
  let y=240
  for(const line of lines){ctx.font=`${line.bold?'bold ':''}${line.size}px Arial`;ctx.fillText(line.text,65,y);y+=line.size*1.5}
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'))
  if(!blob) throw new Error('Could not generate image. Please retry.')
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`visit-card-${card.request_token}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
export default function PmpWidget(){
  const [open,setOpen]=useState(false),[form,setForm]=useState({name:'',mobile:'',area:'',age:''})
  const [token,setToken]=useState(()=>new URLSearchParams(location.search).get('pmp') || '')
  const [card,setCard]=useState(null),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
  const lock=useRef(false)
  async function run(task){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await task()}catch(e){setError(e.message)}finally{setBusy(false);lock.current=false}}
  function submit(e){e.preventDefault();run(async()=>{const result=await api('/pmp/requests',{method:'POST',body:JSON.stringify({...form,age:Number(form.age)})});setToken(result.token);setCard(null);setMessage('Request received. Our staff will call you. Save your request token or bookmark the link below.');setOpen(false)})}
  function lookup(e){e.preventDefault();run(async()=>{setCard(null);setMessage('');const result=await api('/pmp/cards/'+encodeURIComponent(token.trim()));if(result.card_ready)setCard(result);else setMessage('Your visit card is not ready yet. Please check again after staff publish it.')})}
  return <section className="services"><div className="panel">
    <h2>Speak with our store practitioner</h2><p>Request a call from the PMP.</p><button onClick={()=>setOpen(!open)} aria-expanded={open}>{open?'Close form':'Click here'}</button>
    {open&&<form onSubmit={submit} className="panel"><div className="grid">{[['name','Name','text',120],['mobile','Mobile number','tel',10],['area','Area','text',200],['age','Age','number',3]].map(([key,label,type,max])=><label key={key}>{label}<input required type={type} min={key==='age'?0:undefined} max={key==='age'?120:undefined} maxLength={max} pattern={key==='mobile'?'[6-9][0-9]{9}':undefined} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}</div><p>Your details will be shared with store staff so they can call you.</p><button disabled={busy}>Submit call request</button></form>}
    <form onSubmit={lookup} className="panel"><label>Request token<input required maxLength={36} value={token} onChange={e=>{setToken(e.target.value);setCard(null)}} placeholder="Paste your request token"/></label><button disabled={busy}>Click to generate visit card</button>{token&&<p><a href={'/?pmp='+encodeURIComponent(token)}>Save this visit-card link</a></p>}</form>
    {message&&<p className="notice" role="status">{message}</p>}{error&&<p className="notice error" role="alert">{error}</p>}
    {card&&<><article className="card"><header><img src="/logo.png" alt="Store logo"/><div><h2>Sri Rajeswari</h2><strong>Wellness &amp; General Stores</strong><small>Sarpavaram–Panasapadu Road, Kakinada · 9398643062</small></div></header><p><strong>Recommended by Hanmumantha Rao (Babji)</strong><br/>President of Kakinada Rural Medical Association</p><h3>{card.hospital_name}</h3><h2>{card.doctor_name}</h2><p>{card.qualifications}</p><p>{card.hospital_address}</p><p>{card.hospital_phone}</p><footer>Reference: {card.request_token}<br/>Issued: {new Date(card.published_at).toLocaleDateString('en-IN')}<br/>Recommended destination. This card is not a confirmed appointment.</footer></article><div className="toolbar"><button disabled={busy} onClick={()=>run(()=>downloadCard(card))}>Download image (PNG)</button></div></>}
  </div></section>
}
