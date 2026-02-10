import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FieldDefinition, IDENTITY_FIELDS, TabId } from './identity-fields'

interface EditorState {
  // Current tab
  activeTab: TabId
  setActiveTab: (tab: TabId) => void

  // Field values (all stored as strings)
  fieldValues: Record<string, string>
  setFieldValue: (fieldId: string, value: string) => void

  // Currently editing field
  editingField: FieldDefinition | null
  editingValue: string
  openEditor: (field: FieldDefinition) => void
  closeEditor: () => void
  setEditingValue: (value: string) => void
  saveAndClose: () => void

  // Helper to check if field has value
  hasValue: (fieldId: string) => boolean

  // Get configured count for current tab
  getConfiguredCount: (tab: TabId) => { configured: number; total: number }
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      activeTab: 'origin',
      setActiveTab: (tab) => set({ activeTab: tab }),

      fieldValues: {},
      setFieldValue: (fieldId, value) =>
        set((state) => ({
          fieldValues: { ...state.fieldValues, [fieldId]: value },
        })),

      editingField: null,
      editingValue: '',
      openEditor: (field) =>
        set((state) => ({
          editingField: field,
          editingValue: state.fieldValues[field.id] || '',
        })),
      closeEditor: () => set({ editingField: null, editingValue: '' }),
      setEditingValue: (value) => set({ editingValue: value }),
      saveAndClose: () => {
        const { editingField, editingValue, fieldValues } = get()
        if (editingField) {
          set({
            fieldValues: { ...fieldValues, [editingField.id]: editingValue },
            editingField: null,
            editingValue: '',
          })
        }
      },

      hasValue: (fieldId) => {
        const value = get().fieldValues[fieldId]
        return Boolean(value && value.trim().length > 0)
      },

      getConfiguredCount: (tab) => {
        const fields = IDENTITY_FIELDS.filter((f) => f.tab === tab)
        const configured = fields.filter((f) => get().hasValue(f.id)).length
        return { configured, total: fields.length }
      },
    }),
    {
      name: 'nothing-machine-editor-v3',
      partialize: (state) => ({
        fieldValues: state.fieldValues,
        activeTab: state.activeTab,
      }),
    }
  )
)
