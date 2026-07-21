const fs=require('fs');const env=fs.readFileSync('.env.local','utf8');const lines=env.split('\n');const vars={};
lines.forEach(l=>{const m=l.match(/^([^=]+)=(.*)/);if(m)vars[m[1].trim()]=m[2].trim();});
const{createClient}=require('@supabase/supabase-js');
const s=createClient(vars.NEXT_PUBLIC_SUPABASE_URL,vars.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
async function go(){
  const cnesMap={
    'POSTO DE SAUDE DE BETANIA':'2332132',
    'POSTO DE SAUDE DE PRAINHA':'6295665',
    'NUCLEO AMPLIADO DE SAUDE DA FAMILIA':'9642455',
    'ACADEMIA DE SAUDE DE BELTERRA':'7465653',
    'UBS SEDE BELTERRA':'150145300',
    'UBS SANTA ISABEL':'150145301',
  };
  let ok=0;
  for(const [nome,cnes] of Object.entries(cnesMap)){
    const{error}=await s.from('unidades_saude').update({cnes}).eq('nome',nome);
    console.log((error?error.message:'OK')+' | '+nome+' -> '+cnes);
    if(!error)ok++;
  }
  console.log('\nAtualizados:',ok);

  // List all
  const{data:ubs}=await s.from('unidades_saude').select('nome,cnes').order('nome');
  console.log('\nUBS com CNES:');
  ubs?.forEach(u=>console.log('  '+u.nome+' | CNES:'+(u.cnes||'-')));
}
go();
