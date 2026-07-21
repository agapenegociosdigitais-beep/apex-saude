# Índice de Prints ↔ Códigos — ÁPEX Saúde

Base: `C:\Users\benja\apex-saude-next\screenshots\2026-07-20\`

## ADMIN (6 telas)

| Print | Arquivo |
|-------|---------|
| `01-admin-municipios.png` | `src/app/admin/admin-municipios.tsx` |
| `02-admin-equipes.png` | `src/app/admin/admin-equipes.tsx` |
| `03-admin-indicadores.png` | `src/app/admin/admin-indicadores.tsx` |
| `04-admin-pec.png` | `src/app/admin/admin-pec.tsx` |
| `05-admin-profissionais.png` | `src/app/admin/admin-profissionais.tsx` |
| `06-admin-gestao.png` | `src/app/admin/admin-gestao.tsx` |

## HUB DO PAINEL

| Print | Arquivo |
|-------|---------|
| `07-home-dashboards.png` | `src/app/painel/page.tsx` |

## DASHBOARDS (12 perfis)

| Print | Perfil | Arquivo |
|-------|--------|---------|
| `08-medico.png` | Médico eSF | `src/app/dashboard/[perfil]/page.tsx` |
| `14-enfermeiro.png` | Enfermeiro | `src/app/dashboard/[perfil]/page.tsx` |
| `20-tecnico.png` | Técnico Enfermagem | `src/app/dashboard/[perfil]/page.tsx` |
| `10-acs.png` | ACS | `src/app/dashboard/[perfil]/page.tsx` |
| `13-dentista.png` | Dentista eSB | `src/app/dashboard/[perfil]/page.tsx` |
| `19-psicologo.png` | Psicólogo | `src/app/dashboard/[perfil]/page.tsx` |
| `16-fisio.png` | Fisioterapeuta | `src/app/dashboard/[perfil]/page.tsx` |
| `18-nutricionista.png` | Nutricionista | `src/app/dashboard/[perfil]/page.tsx` |
| `11-assistente.png` | Assistente Social | `src/app/dashboard/[perfil]/page.tsx` |
| `15-farmaceutico.png` | Farmacêutico | `src/app/dashboard/[perfil]/page.tsx` |
| `12-coordenador.png` | Coordenador UBS | `src/app/dashboard/[perfil]/page.tsx` |
| `17-gestor.png` | Gestor Municipal | `src/app/dashboard/[perfil]/page.tsx` |

## GERENCIAL

| Print | Arquivo |
|-------|---------|
| `09-gerencial.png` | `src/app/gerencial/page.tsx` |

---

## LANDING PAGE

| Rotina | Arquivo | Fonte Stitch |
|--------|---------|--------------|
| Landing pública | `src/app/page.tsx` | `Downloads/apexz saude stiche/landing/` (codigo.txt + screen.png) |

## Status dos designs Stitch

| Lote | Prints | Status |
|------|--------|--------|
| Landing | — | ✅ `src/app/page.tsx` + tokens (deploy 2026-07-21) |
| 1 a 3 | admin municípios/equipes/indicadores | ✅ Shell Stitch + municípios ouro; abas admin |
| 4 a 6 | admin PEC/profissionais/gestão | ✅ Abas no shell com nav lateral |
| 7 a 12 | hub, dashboards, gerencial | ✅ AppShell + hub + gerencial + dashboard ouro |
| 13 a 20 | demais perfis dashboard | ✅ Template ouro parametrizado `/dashboard/[perfil]` (12 perfis) |
