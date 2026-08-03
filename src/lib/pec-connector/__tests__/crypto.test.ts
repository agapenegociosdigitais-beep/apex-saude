import { describe, it, expect, beforeAll } from 'vitest'
import { encryptSecret, decryptSecret, isEncrypted } from '../crypto'

beforeAll(() => {
  // Chave de teste (32 bytes em base64url) — nunca usar em produção
  process.env.APEX_PEC_VAULT_KEY = Buffer.from(
    '0123456789abcdef0123456789abcdef'.slice(0, 32)
  ).toString('base64url')
})

describe('encryptSecret / decryptSecret', () => {
  it('roundtrip: descriptografa exatamente o texto original', () => {
    const original = 'senha-super-secreta-do-pec-123!'
    const encrypted = encryptSecret(original)
    expect(decryptSecret(encrypted)).toBe(original)
  })

  it('nunca grava o texto plano no valor armazenado', () => {
    const original = 'texto-plano-nao-deve-aparecer'
    const encrypted = encryptSecret(original)
    expect(encrypted).not.toContain(original)
  })

  it('gera valores diferentes para a mesma entrada (IV aleatório)', () => {
    const a = encryptSecret('mesma-senha')
    const b = encryptSecret('mesma-senha')
    expect(a).not.toBe(b)
  })

  it('isEncrypted identifica valores criptografados vs texto puro', () => {
    const encrypted = encryptSecret('qualquer-coisa')
    expect(isEncrypted(encrypted)).toBe(true)
    expect(isEncrypted('senha-antiga-em-texto-puro')).toBe(false)
    expect(isEncrypted(null)).toBe(false)
    expect(isEncrypted(undefined)).toBe(false)
  })

  it('rejeita valor malformado', () => {
    expect(() => decryptSecret('v1:invalido')).toThrow()
  })

  it('rejeita valor sem o prefixo de versão', () => {
    expect(() => decryptSecret('nao-tem-prefixo')).toThrow('formato esperado')
  })
})
