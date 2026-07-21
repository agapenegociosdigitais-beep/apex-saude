const fs=require('fs');const env=fs.readFileSync('.env.local','utf8');const lines=env.split('\n');const vars={};
lines.forEach(l=>{const m=l.match(/^([^=]+)=(.*)/);if(m)vars[m[1].trim()]=m[2].trim();});
const{createClient}=require('@supabase/supabase-js');
const s=createClient(vars.NEXT_PUBLIC_SUPABASE_URL,vars.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const BELTERRA='ffb6e259-050b-4199-828e-8177d462846c';

async function go(){
  console.log('Buscando CNES via VPS...');
  const res=await fetch('http://23.106.45.137:3597/cnes/150145');
  const{ubs}=await res.json();
  console.log(ubs.length,'UBS encontradas\n');

  let novos=0, atualizados=0;

  for(const u of ubs||[]){
    // Buscar no banco por CNES
    const{data:existente}=await s.from('unidades_saude').select('id,nome,cnes,endereco').eq('cnes',u.cnes).limit(1);

    if(existente?.length){
      // Atualizar endereco
      const{error}=await s.from('unidades_saude').update({
        nome:u.nome, endereco:u.endereco||null, bairro:u.bairro||null, cep:u.cep||null
      }).eq('id',existente[0].id);
      console.log((error?error.message:'ATUALIZADO')+' | '+u.nome+' | '+u.endereco+' | '+u.bairro);
      if(!error)atualizados++;
    }else{
      // Inserir nova UBS
      const{error}=await s.from('unidades_saude').insert({
        municipio_id:BELTERRA,cnes:u.cnes,nome:u.nome,tipo:'ubs',
        endereco:u.endereco||null,bairro:u.bairro||null,cep:u.cep||null,ativa:true
      });
      console.log((error?error.message:'NOVO')+' | '+u.nome+' | '+u.endereco);
      if(!error)novos++;
    }
  }

  console.log('\nNovos:',novos,'| Atualizados:',atualizados);

  // Lista final
  const{data:final}=await s.from('unidades_saude').select('nome,cnes,endereco,bairro,cep').eq('municipio_id',BELTERRA).order('nome');
  console.log('\n=== UBS BELTERRA ('+final?.length+') ===');
  final?.forEach(u=>console.log(u.nome+' | CNES:'+(u.cnes||'-')+' | '+(u.endereco||'-')+' '+((u.bairro||''))+' | '+(u.cep||'')));
}
go().catch(e=>console.log('FATAL:',e.message));
