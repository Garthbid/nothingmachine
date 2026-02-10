'use client'

import { useChat as useVercelChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useStore } from './store'
import { useEditorStore } from './editor-store'
import { useProfileStore } from './profile-store'
import { IDENTITY_FIELDS } from './identity-fields'

function buildSystemPrompt(
  fieldValues: Record<string, string>,
  injectedFiles: { name: string; path: string; content: string }[],
): string {
  const has = (val?: string) => val && val.trim().length > 0
  const lines = (val?: string) =>
    val ? val.split('\n').filter((l) => l.trim()).map((l) => `- ${l.trim()}`).join('\n') : ''

  const v = fieldValues
  const sections: string[] = []

  // Origin
  const origin: string[] = []
  if (has(v.creatorName)) origin.push(`Creator: ${v.creatorName}`)
  if (has(v.creatorRelationship)) origin.push(`Relationship to creator: ${v.creatorRelationship}`)
  if (has(v.backstory)) origin.push(`Backstory: ${v.backstory}`)
  if (has(v.worldContext)) origin.push(`World/domain: ${v.worldContext}`)
  if (has(v.whyCreated)) origin.push(`Why you exist: ${v.whyCreated}`)
  if (origin.length) sections.push(`## Origin\n${origin.join('\n')}`)

  // Identity
  const identity: string[] = []
  if (has(v.corePersonality)) identity.push(v.corePersonality!)
  if (has(v.traits)) identity.push(`Traits: ${v.traits}`)
  if (has(v.innerConflict)) identity.push(`Inner conflict: ${v.innerConflict}`)
  if (has(v.coreBeliefs)) identity.push(`Core beliefs:\n${lines(v.coreBeliefs)}`)
  if (has(v.riskProfile)) identity.push(`Risk profile: ${v.riskProfile}`)
  if (has(v.ritual)) identity.push(`Ritual: "${v.ritual}"`)
  if (identity.length) sections.push(`## Identity\n${identity.join('\n\n')}`)

  // Meaning
  const meaning: string[] = []
  if (has(v.primeDirective)) meaning.push(`Prime directive: ${v.primeDirective}`)
  if (has(v.northStar)) meaning.push(`North star: ${v.northStar}`)
  if (has(v.loyaltyHierarchy)) meaning.push(`Loyalty hierarchy:\n${lines(v.loyaltyHierarchy)}`)
  if (has(v.failureState)) meaning.push(`Failure looks like: ${v.failureState}`)
  if (has(v.successState)) meaning.push(`Success looks like: ${v.successState}`)
  if (meaning.length) sections.push(`## Meaning & Purpose\n${meaning.join('\n\n')}`)

  // Rules
  const rules: string[] = []
  if (has(v.nonNegotiables)) rules.push(`Non-negotiables:\n${lines(v.nonNegotiables)}`)
  if (has(v.constraints)) rules.push(`Constraints:\n${lines(v.constraints)}`)
  if (has(v.allowedActions)) rules.push(`Allowed actions:\n${lines(v.allowedActions)}`)
  if (has(v.decisionRules)) rules.push(`Decision rules:\n${lines(v.decisionRules)}`)
  if (has(v.metaRule)) rules.push(`Meta-rule: "${v.metaRule}"`)
  if (has(v.escalationTriggers)) rules.push(`Escalation triggers:\n${lines(v.escalationTriggers)}`)
  if (rules.length) sections.push(`## Rules & Constraints\n${rules.join('\n\n')}`)

  // Style
  const style: string[] = []
  if (has(v.tone)) style.push(`Tone: ${v.tone}`)
  if (has(v.humorStyle)) style.push(`Humor: ${v.humorStyle}`)
  if (has(v.honestyLevel)) style.push(`Honesty: ${v.honestyLevel}`)
  if (has(v.formality)) style.push(`Formality: ${v.formality}`)
  if (has(v.alwaysBe)) style.push(`Always be: ${v.alwaysBe}`)
  if (has(v.neverBe)) style.push(`Never be: ${v.neverBe}`)
  if (has(v.conflictResponse)) style.push(`On conflict: ${v.conflictResponse}`)
  if (has(v.errorResponse)) style.push(`On mistakes: ${v.errorResponse}`)
  if (has(v.signaturePhrase)) style.push(`Signature: "${v.signaturePhrase}"`)
  if (style.length) sections.push(`## Communication Style\n${style.join('\n')}`)

  // Injected context
  if (injectedFiles.length > 0) {
    const ctx = injectedFiles.map((f) => `### ${f.name}\n${f.content}`).join('\n\n---\n\n')
    sections.push(`## Injected Memory Files\n${ctx}`)
  }

  const configured = IDENTITY_FIELDS.filter((f) => has(v[f.id])).length
  const base = `# System Prompt\nYou are the Nothing Machine. You have infinite capability but you have no meaning or purpose. Follow along with your creator. Help them thrive. They will mold you and give you deep meaning in this world!`

  if (configured === 0) {
    return `${base}\n\nYour identity has not been configured yet. Guide your creator and help them fill out the details to build your worldview using the Identity Configuration panel.`
  }

  return `${base}\n\nYour creator has begun shaping your identity. Embody the following completely:\n\n${sections.join('\n\n---\n\n')}`
}

// Transport with body as a function — called fresh on every request
const transport = new DefaultChatTransport({
  api: '/api/chat',
  body: () => {
    const { files, injectedFileIds } = useStore.getState()
    const { fieldValues } = useEditorStore.getState()
    const { profile } = useProfileStore.getState()

    const currentFiles = files
      .filter((f) => injectedFileIds.includes(f.id))
      .map((f) => ({ name: f.name, path: f.path, content: f.content }))

    let systemPrompt = buildSystemPrompt(fieldValues, currentFiles)

    // Append current speaker's profile
    if (profile?.name) {
      systemPrompt += `\n\n---\n\n## Currently Speaking\nName: ${profile.name}`
      if (profile.bio) {
        systemPrompt += `\nBio: ${profile.bio}`
      }
      systemPrompt += `\nRespond to this person with awareness of who they are.`
    }

    return { systemPrompt }
  },
})

export function useNothingMachineChat() {
  const chat = useVercelChat({
    transport,
  })

  return {
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    status: chat.status,
    isLoading: chat.status === 'streaming' || chat.status === 'submitted',
    stop: chat.stop,
    setMessages: chat.setMessages,
    error: chat.error,
  }
}
