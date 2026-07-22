const fs=require('fs');const env=fs.readFileSync('.env.local','utf8').split('\n').reduce((a,l)=>{const m=l.match(/^([^=]+)=(.*)/);if(m)a[m[1].trim()]=m[2].trim();return a},{});
const{createClient}=require('@supabase/supabase-js');
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const B='ffb6e259-050b-4199-828e-8177d462846c';

async function go(){
  // Deletar as equipes com nome feio (INE prefix)
  const{data:feias}=await s.from('equipes').select('id,nome').eq('municipio_id',B).like('nome','INE%');
  if(feias?.length){
    console.log('Deletando',feias.length,'equipes com nome feio...');
    for(const f of feias){
      await s.from('equipes').delete().eq('id',f.id);
    }
  }
  
  // Agora criar com nomes bonitos
  const{data:ubs}=await s.from('unidades_saude').select('id,nome').eq('municipio_id',B).order('nome');
  const{data:eqs}=await s.from('equipes').select('unidade_id').eq('municipio_id',B);
  const comEq=new Set(eqs?.map(e=>e.unidade_id)||[]);
  const sem=ubs?.filter(u=>!comEq.has(u.id))||[];

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
      body:JSON.stringify({municipio_id:B,unidade_id:u.id,nome,codigo_ine:ine,tipo:'esf',ativa:true})
    });
    console.log(res.ok?'OK':'ERR',nome.slice(0,50),'→',u.nome.slice(0,50));
    if(res.ok)ok++;
  }
  console.log('\nCriadas:',ok);
  
  // Final
  const{data:final}=await s.from('equipes').select('nome,tipo,codigo_ine').eq('municipio_id',B).order('nome');
  console.log('Total equipes Belterra:',final?.length);
  final?.forEach(e=>console.log('  '+e.nome+' | '+e.tipo+' | '+e.codigo_ine));
}
go().catch(e=>console.log('FATAL:',e.message));
