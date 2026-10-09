import {useEffect,useState} from 'react';
import {Link,useOutletContext,useParams} from 'react-router-dom';
import {Package} from 'lucide-react';
import type {Me} from '../api/me';
import {getBodegaQueue,type BodegaTicket} from '../api/bodega';
import {can,PERMISSIONS} from '../app/rbac';
import PageHeader from '../components/ui/PageHeader';
import FeedbackBanner from '../components/ui/FeedbackBanner';
import WarehouseReceptionForm from '../components/WarehouseReceptionForm';
export default function WarehouseOperationPage({purpose}:{purpose:'receipt'|'lab'|'qa'}){
 const {osId}=useParams();const me=useOutletContext<Me|null>();
 const [ticket,setTicket]=useState<BodegaTicket|null>(null),[error,setError]=useState(''),[done,setDone]=useState(false),[loading,setLoading]=useState(true);
 const back=purpose==='qa'?'/bodega?tab=para-qa':purpose==='lab'?'/bodega?tab=para-lab':'/bodega?tab=transito';
 useEffect(()=>{let active=true;setTicket(null);setDone(false);setError('');setLoading(true);
  if(!can(me,PERMISSIONS.BODEGA_WRITE)){setError('No tienes permiso para esta operación.');setLoading(false);return;}
  getBodegaQueue().then(rows=>{if(!active)return;const row=rows.find(o=>o.codigo_os===osId&&(purpose==='qa'?o.estado_id===3&&o.fue_laboratorio&&o.es_aprobado_qa==null:purpose==='lab'?o.estado_id===3&&(o.es_aprobado_qa===false||!o.fue_laboratorio):[2,11].includes(o.estado_id)));
   if(row)setTicket(row);else setError('El equipo ya no está pendiente de esta operación. Vuelve a la bandeja.');
  }).catch(()=>{if(active)setError('No se pudo consultar el equipo.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};
 },[osId,purpose,me?.rol]);
 return <div className="page"><nav aria-label="Ruta de navegación"><Link to={back}>Bodega y logística</Link> / {osId}</nav>
 <PageHeader title={purpose==='qa'?'Preparar envío a QA':purpose==='lab'?'Preparar envío a Laboratorio':`Recepción desde ${ticket?.estado_id===11?(ticket.es_aprobado_qa!=null?'QA':'Laboratorio'):'Terreno'}`} icon={<Package size={21}/>} actions={<Link className="btn ghost" to={back}>Volver a Bodega</Link>}/>
 {loading&&<p role="status">Cargando equipo…</p>}{error&&<FeedbackBanner tone="danger">{error}</FeedbackBanner>}
 {done?<><FeedbackBanner tone="success">{purpose==='qa'?'Envío a QA confirmado. Equipo en tránsito.':purpose==='lab'?'Envío a Laboratorio confirmado. Equipo en tránsito.':'Recepción en Bodega confirmada.'}</FeedbackBanner><Link className="btn" to={back}>Continuar con el siguiente equipo</Link></>:ticket&&<WarehouseReceptionForm key={`${purpose}:${ticket.codigo_os}`} purpose={purpose} ticket={ticket} role={me?.rol} onReceived={()=>{setDone(true);window.dispatchEvent(new Event('pmp:warehouse-queue-updated'));}}/>}
 </div>;
}
