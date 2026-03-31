'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  type: 'hot' | 'warm' | 'cold'
  status: 'new' | 'contacted' | 'followup' | 'interested' | 'converted' | 'not_interested'
  source: string
  assigned_to: string
  created_by: string
  deal_value: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function ConvertLeadPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const leadId = searchParams.get('id')
  const { user } = useAuth()
  const supabase = createClient()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lead, setLead] = useState<Lead | null>(null)
  const [salesTeam, setSalesTeam] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    dealValue: '',
    closeDate: '',
    assignedTo: '',
    paymentTerms: 'full',
    notes: '',
    commission: '',
    commissionType: 'percentage' as 'percentage' | 'fixed'
  })

  const fetchLead = useCallback(async () => {
    if (!leadId) {
      setError('No lead ID provided')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Lead not found')

      if (data.status === 'converted') {
        setError('This lead has already been converted')
        setLoading(false)
        return
      }

      if (data.status !== 'interested') {
        setError('Only leads with "interested" status can be converted')
        setLoading(false)
        return
      }

      setLead(data)
    } catch (error: any) {
      console.error('Error fetching lead:', error)
      setError(error.message || 'Failed to fetch lead')
    } finally {
      setLoading(false)
    }
  }, [leadId, supabase])

  const fetchSalesTeam = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('role', 'sales')
        .order('name')

      if (error) throw error
      setSalesTeam(data || [])
    } catch (error: any) {
      console.error('Error fetching sales team:', error)
    }
  }, [supabase])

  useEffect(() => {
    fetchLead()
    fetchSalesTeam()
  }, [fetchLead, fetchSalesTeam])

  useEffect(() => {
    if (!leadId) return

    const channel = supabase
      .channel(`lead-${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`
        },
        (payload) => {
          console.log('🔄 Lead updated:', payload.new)
          const updatedLead = payload.new as Lead
          
          if (updatedLead.status === 'converted') {
            setError('This lead has been converted by another user')
            setTimeout(() => {
              router.push('/sales/reports?converted=success')
            }, 2000)
          } else {
            setLead(updatedLead)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [leadId, supabase, router])

  useEffect(() => {
    if (formData.dealValue && formData.commissionType === 'percentage') {
      const value = parseFloat(formData.dealValue)
      const commission = value * 0.1
      setFormData(prev => ({ ...prev, commission: commission.toFixed(0) }))
    }
  }, [formData.dealValue, formData.commissionType])

  const handleDealValueChange = (value: string) => {
    setFormData({ ...formData, dealValue: value })
    if (formData.commissionType === 'percentage' && value) {
      const numValue = parseFloat(value) || 0
      const commission = numValue * 0.1
      setFormData(prev => ({ ...prev, commission: commission.toFixed(0) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const dealValueNum = parseFloat(formData.dealValue);
      const commissionNum = parseFloat(formData.commission);

      if (isNaN(dealValueNum) || dealValueNum <= 0) {
        throw new Error('Invalid deal value');
      }

      // Update lead status
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          deal_value: dealValueNum,
          converted_by: user.id,
          converted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id)
        .eq('status', 'interested');

      if (leadError) throw leadError;

      // Insert into conversions table
      const conversionData = {
        lead_id: lead.id,
        deal_value: dealValueNum,
        close_date: formData.closeDate,
        assigned_to: formData.assignedTo,
        payment_terms: formData.paymentTerms,
        notes: formData.notes || null,
        commission: commissionNum,
        commission_type: formData.commissionType,
        converted_by: user.id,
        converted_at: new Date().toISOString()
      };

      const { error: conversionError } = await supabase
        .from('conversions')
        .insert([conversionData])
        .select();

      if (conversionError) throw conversionError;

      // Create activity record
      const { error: activityError } = await supabase
        .from('lead_activities')
        .insert([{
          lead_id: lead.id,
          user_id: user.id,
          activity_type: 'conversion',
          notes: `Lead converted with deal value PKR ${dealValueNum.toLocaleString()}`,
          created_at: new Date().toISOString()
        }]);

      if (activityError) {
        console.warn('⚠️ Activity creation failed:', activityError);
      }

      router.push('/sales/reports?converted=success');
      
    } catch (error: any) {
      console.error('❌ Conversion error:', error);
      setError(error.message || 'Failed to convert lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !lead) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-3 sm:px-4"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center">
          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">⚠️</div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Cannot Convert Lead</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{error}</p>
          <button
            onClick={() => router.push('/sales/leads')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#C41E3A] text-white text-xs sm:text-sm rounded-md hover:bg-[#8B1528]"
          >
            Back to Leads
          </button>
        </div>
      </motion.div>
    )
  }

  if (!lead) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-3 sm:px-4"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center">
          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📭</div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Lead Not Found</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">The lead you're trying to convert doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/sales/leads')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#C41E3A] text-white text-xs sm:text-sm rounded-md hover:bg-[#8B1528]"
          >
            View All Leads
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto px-3 sm:px-4"
    >
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Convert Lead to Sale</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Converting: <span className="font-medium text-gray-900">{lead?.name}</span> from {lead?.company}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[10px] sm:text-sm">
            {error}
          </div>
        )}

        {/* Lead Summary Card */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Lead Type</p>
              <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                lead?.type === 'hot' ? 'bg-red-100 text-red-700' :
                lead?.type === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {lead?.type?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Current Status</p>
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-700">
                {lead?.status}
              </span>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Email</p>
              <p className="text-[10px] sm:text-xs text-gray-900 break-all">{lead?.email}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Phone</p>
              <p className="text-[10px] sm:text-xs text-gray-900">{lead?.phone}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Deal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
                Deal Value (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.dealValue}
                onChange={(e) => handleDealValueChange(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                placeholder="e.g., 50000"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
                Close Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.closeDate}
                onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Sales Team Assignment */}
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
              Assign to Sales Representative <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
            >
              <option value="">Select Sales Rep</option>
              {salesTeam.map(rep => (
                <option key={rep.id} value={rep.id}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>

          {/* Commission Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
                Commission Type
              </label>
              <select
                value={formData.commissionType}
                onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
              >
                <option value="percentage">Percentage (10%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
                Commission Amount (PKR)
              </label>
              <input
                type="number"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                placeholder={formData.commissionType === 'percentage' ? 'Auto-calculated' : 'Enter amount'}
                readOnly={formData.commissionType === 'percentage'}
                min="0"
                step="1000"
              />
              {formData.commissionType === 'percentage' && formData.dealValue && (
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                  10% of PKR {parseInt(formData.dealValue).toLocaleString()} = PKR {parseInt(formData.commission).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
              Payment Terms
            </label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
            >
              <option value="full">Full Payment</option>
              <option value="partial">Partial Payment (50%)</option>
              <option value="installment">Installments</option>
              <option value="credit">30 Days Credit</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
              placeholder="Add any notes about the deal..."
            />
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-yellow-600 text-base sm:text-lg">⚠️</span>
              <div>
                <p className="text-xs sm:text-sm font-medium text-yellow-800 mb-1">Important</p>
                <p className="text-[10px] sm:text-xs text-yellow-700">
                  Converting this lead will mark it as "Converted" and move it to closed deals. 
                  This action cannot be undone. Make sure all deal details are correct.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.dealValue || !formData.closeDate || !formData.assignedTo}
              className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Converting...' : '✓ Confirm Conversion'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/sales/leads')}
              className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}