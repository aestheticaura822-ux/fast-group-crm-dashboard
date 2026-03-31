import { create } from 'zustand'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  type: 'hot' | 'warm' | 'cold'
  status: string
}

interface LeadStore {
  leads: Lead[]
  selectedLeads: string[]
  filters: Record<string, any>
  setLeads: (leads: Lead[]) => void
  addLead: (lead: Lead) => void
  updateLead: (id: string, data: Partial<Lead>) => void
  deleteLead: (id: string) => void
  selectLead: (id: string) => void
  deselectLead: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  setFilters: (filters: Record<string, any>) => void
  resetFilters: () => void
}

export const useLeadStore = create<LeadStore>((set) => ({
  leads: [],
  selectedLeads: [],
  filters: {},
  
  setLeads: (leads) => set({ leads }),
  
  addLead: (lead) => set((state) => ({
    leads: [...state.leads, lead]
  })),
  
  updateLead: (id, data) => set((state) => ({
    leads: state.leads.map(lead =>
      lead.id === id ? { ...lead, ...data } : lead
    )
  })),
  
  deleteLead: (id) => set((state) => ({
    leads: state.leads.filter(lead => lead.id !== id)
  })),
  
  selectLead: (id) => set((state) => ({
    selectedLeads: [...state.selectedLeads, id]
  })),
  
  deselectLead: (id) => set((state) => ({
    selectedLeads: state.selectedLeads.filter(i => i !== id)
  })),
  
  selectAll: () => set((state) => ({
    selectedLeads: state.leads.map(lead => lead.id)
  })),
  
  deselectAll: () => set({ selectedLeads: [] }),
  
  setFilters: (filters) => set({ filters }),
  
  resetFilters: () => set({ filters: {} })
}))