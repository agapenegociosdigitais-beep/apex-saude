const fs=require('fs');const env=fs.readFileSync('.env.local','utf8').split('\n').reduce((a,l)=>{const m=l.match(/^([^=]+)=(.*)/);if(m)a[m[1].trim()]=m[2].trim();return a},{});
const{createClient}=require('@supabase/supabase-js');
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const BELTERRA='ffb6e259-050b-4199-828e-8177d462846c';

async function go(){
  // Pegar todas USF de Belterra que ainda NAO tem equipes
  const{data:ubs}=await s.from('unidades_saude').select('id,nome').eq('municipio_id',BELTERRA).order('nome');
  const{data:eqs}=await s.from('equipes').select('unidade_id').eq('municipio_id',BELTERRA);
  const ubsComEquipe=new Set(eqs?.map(e=>e.unidade_id)||[]);
  const ubsSemEquipe=ubs?.filter(u=>!ubsComEquipe.has(u.id))||[];

  console.log('UBS sem equipe:',ubsSemEquipe.length);
  let count=0;
  for(const u of ubsSemEquipe){
    // Criar 1 eSF por UBS
    const nomeEq='eSF '+u.nome.replace(/UNIDADE (DE )?SAUDE DA FAMILIA /i,'').replace(/^USF /i,'').slice(0,40);
    const ine='INE_'+u.id.slice(0,8).replace(/-/g,'');
    const{error}=await s.from('equipes').insert({
      municipio_id:BELTERRA,unidade_id:u.id,nome:nomeEq,codigo_ine:ine,tipo:'esf',ativa:true
    });
    console.log((error?error.message:'OK')+' | '+nomeEq+' → '+u.nome);
    if(!error)count++;
  }
  console.log('\nCriadas:',count,'equipes');

  // Mostrar resultado
  const{data:final}=await s.from('equipes').select('nome,tipo,unidade_id,codigo_ine').eq('municipio_id',BELTERRA).order('nome');
  console.log('\nTodas equipes Belterra ('+final?.length+'):');
  for(const e of final||[]){
    const u=ubs?.find(x=>x.id===e.unidade_id);
    console.log('  '+e.nome+' ('+e.tipo+') | INE:'+e.codigo_ine+' | UBS:'+(u?.nome||'sem UBS'));
  }
}
go().catch(e=>console.log('FATAL:',e.message));
