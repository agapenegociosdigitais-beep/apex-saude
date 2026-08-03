/**
 * PEC Connector — Criptografia de credenciais em repouso
 *
 * A senha do banco PEC Local de cada município é um segredo de terceiro
 * (credencial da prefeitura, não nossa). Antes desta correção ela era
 * gravada em texto puro em `integracoes_pec.senha`, apesar do comentário
 * de tipo dizer "encrypted at rest" — a promessa nunca foi implementada.
 *
 * AES-256-GCM na camada da aplicação: a chave (APEX_PEC_VAULT_KEY) nunca
 * trafega para o Postgres nem aparece em nenhuma query SQL — só existe
 * como variável de ambiente do servidor Next.js. Um dump do banco sozinho
 * não é suficiente para recuperar as senhas.
 */
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // recomendado para GCM
const PREFIX = 'v1:' // permite trocar de algoritmo/versão no futuro sem quebrar dados antigos

function getKey(): Buffer {
  const raw = process.env.APEX_PEC_VAULT_KEY
  if (!raw) {
    throw new Error(
      'APEX_PEC_VAULT_KEY nao configurada. Defina em .env.local e nas env vars da Vercel ' +
      '(gerar com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64url\'))")'
    )
  }
  const key = Buffer.from(raw, 'base64url')
  if (key.length !== 32) {
    throw new Error(`APEX_PEC_VAULT_KEY deve decodificar para 32 bytes (recebeu ${key.length})`)
  }
  return key
}

/** Criptografa um texto (ex: senha do PEC). Retorna string opaca para persistir no banco. */
export function encryptSecret(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // formato: v1:<iv>:<authTag>:<ciphertext>, tudo em base64url
  const parts = [iv, authTag, encrypted].map(b => b.toString('base64url'))
  return PREFIX + parts.join(':')
}

/** Descriptografa um valor gerado por encryptSecret. Lança erro se malformado ou chave errada. */
export function decryptSecret(stored: string): string {
  if (!stored.startsWith(PREFIX)) {
    throw new Error('Valor nao esta no formato esperado (prefixo de versao ausente)')
  }
  const key = getKey()
  const [ivB64, authTagB64, dataB64] = stored.slice(PREFIX.length).split(':')
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error('Valor criptografado malformado')
  }
  const iv = Buffer.from(ivB64, 'base64url')
  const authTag = Buffer.from(authTagB64, 'base64url')
  const data = Buffer.from(dataB64, 'base64url')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
  return decrypted.toString('utf8')
}

/** True se o valor já está no formato criptografado (evita criptografar duas vezes). */
export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX)
}
