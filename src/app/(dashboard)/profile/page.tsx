'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Calendar, MapPin, Briefcase, Building2, Hash, Award, Shield } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'

export default function ProfilePage() {
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const u = JSON.parse(userStr)
    fetch(`/api/employees?email=${encodeURIComponent(u.email)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setEmployee(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-12 text-slate-500">
        Employee profile not found.
      </div>
    )
  }

  const details = [
    { icon: User, label: 'Name', value: employee.name },
    { icon: Hash, label: 'Employee ID', value: employee.employeeId },
    { icon: User, label: 'Gender', value: employee.gender || 'N/A' },
    { icon: Mail, label: 'Email', value: employee.companyEmail || employee.email },
    { icon: Phone, label: 'Mobile', value: employee.phone || 'N/A' },
    { icon: Building2, label: 'Department', value: employee.department },
    { icon: Briefcase, label: 'Position', value: employee.position },
    { icon: Calendar, label: 'Date of Birth', value: employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A' },
    { icon: MapPin, label: 'Address', value: employee.address || 'N/A' },
    { icon: Shield, label: 'Status', value: employee.status },
    { icon: Award, label: 'Manager', value: employee.manager?.name || 'N/A' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500">Your personal and employment details</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <Avatar name={employee.name} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{employee.name}</h2>
            <p className="text-sm text-slate-500">{employee.position} &middot; {employee.department}</p>
          </div>
        </div>

        <div className="space-y-4">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
