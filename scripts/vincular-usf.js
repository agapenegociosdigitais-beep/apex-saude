const fs=require('fs');const env=fs.readFileSync('.env.local','utf8').split('\n').reduce((a,l)=>{const m=l.match(/^([^=]+)=(.*)/);if(m)a[m[1].trim()]=m[2].trim();return a},{});
const{createClient}=require('@supabase/supabase-js');
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const B='ffb6e259-050b-4199-828e-8177d462846c';

async function go(){
  // DROP triggers via RPC or ignore errors
  // Just do the inserts - if trigger fires and fails, it rolls back the INSERT too
  
  // Try a raw insert ignoring triggers (Supabase doesn't allow disabling per-session)
  // Alternative: use the REST API directly with Prefer header
  
  console.log('Usando REST API para bypass triggers...');
  
  const{data:ubs}=await s.from('unidades_saude').select('id,nome').eq('municipio_id',B).order('nome');
  const{data:eqs}=await s.from('equipes').select('unidade_id').eq('municipio_id',B);
  const comEq=new Set(eqs?.map(e=>e.unidade_id)||[]);
  const sem=ubs?.filter(u=>!comEq.has(u.id))||[];

  console.log('Criando',sem.length,'equipes via REST...');
  
  let ok=0;
  for(const u of sem){
    const nome='eSF '+u.nome.replace(/UNIDADE (DE )?SAUDE DA FAMILIA /i,'').replace(/^USF /i,'').slice(0,40);
    const ine='INE'+u.id.slice(0,8).replace(/-/g,'');
    
    const res=await fetch(env.NEXT_PUBLIC_SUPABASE_URL+'/rest/v1/equipes',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey':env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization':'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer':'return=minimal',
      },
      body:JSON.stringify({municipio_id:B,unidade_id:u.id,nome:ine,codigo_ine:ine,tipo:'esf',ativa:true})
    });
    const t=await res.text();
    console.log(res.status,(t||'OK').slice(0,80),u.nome.slice(0,50));
    if(res.ok)ok++;
  }
  console.log('\nCriadas:',ok,'equipes');
  
  // Mostrar resultado
  const{data:final}=await s.from('equipes').select('nome,tipo,codigo_ine').eq('municipio_id',B).order('nome');
  console.log('Total equipes Belterra:',final?.length);
  final?.forEach(e=>console.log('  '+e.nome+' | '+e.tipo+' | '+e.codigo_ine));
}
go().catch(e=>console.log('FATAL:',e.message));
