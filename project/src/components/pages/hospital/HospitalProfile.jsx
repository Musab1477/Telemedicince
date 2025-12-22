import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { route } from 'preact-router'

const STORAGE_KEY = 'hospital_profile'

const sampleProfile = {
  hospitalName: 'City General Hospital',
  registrationNumber: 'REG-0001',
  hospitalType: 'government',
  phone: '+91 98xxxxxxx00',
  email: 'info@citygeneral.example',
  address: '123 Main Road, Central',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  beds: 200,
  departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency'],
  services: ['24x7 Emergency', 'Pharmacy', 'Laboratory', 'Radiology'],
  accreditation: 'NABH',
  hours: '24x7',
  emergencyContact: '+91 108',
  logoDataUrl: null
}

export function HospitalProfile() {
  const [profile, setProfile] = useState(sampleProfile)
  const [editing, setEditing] = useState(true)
  const [newDept, setNewDept] = useState('')
  const [newService, setNewService] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setProfile(JSON.parse(raw))
      } catch (e) {
        console.error('Failed to parse profile', e)
      }
    }
  }, [])

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    setEditing(false)
  }

  const resetToSample = () => {
    setProfile(sampleProfile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProfile))
  }

  const addDepartment = () => {
    if (!newDept.trim()) return
    setProfile(p => ({ ...p, departments: [ ...p.departments, newDept.trim() ] }))
    setNewDept('')
  }

  const removeDepartment = (idx) => {
    setProfile(p => ({ ...p, departments: p.departments.filter((_,i) => i !== idx) }))
  }

  const addService = () => {
    if (!newService.trim()) return
    setProfile(p => ({ ...p, services: [ ...p.services, newService.trim() ] }))
    setNewService('')
  }

  const removeService = (idx) => {
    setProfile(p => ({ ...p, services: p.services.filter((_,i) => i !== idx) }))
  }

  const onLogoChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setProfile(p => ({ ...p, logoDataUrl: reader.result }))
    }
    reader.readAsDataURL(f)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button 
              onClick={() => route('/hospital/dashboard')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hospital Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start space-x-6">
            <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {profile.logoDataUrl ? (
                <img src={profile.logoDataUrl} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-3xl">🏥</div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{profile.hospitalName}</h2>
                  <div className="text-sm text-gray-600">{profile.hospitalType} • Reg: {profile.registrationNumber}</div>
                </div>
                <div>
                  <button onClick={() => setEditing(true)} className="px-3 py-1 bg-blue-600 text-white rounded-md mr-2">Edit</button>
                  <button onClick={resetToSample} className="px-3 py-1 bg-gray-200 rounded-md">Reset</button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-gray-700">Phone</div>
                  <div className="font-medium">{profile.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-700">Email</div>
                  <div className="font-medium">{profile.email}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-sm text-gray-700">Address</div>
                  <div className="font-medium">{profile.address}, {profile.city}, {profile.state} - {profile.pincode}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700">Beds</label>
                <div className="font-medium">{profile.beds}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Accreditation</label>
                <div className="font-medium">{profile.accreditation}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Working Hours</label>
                <div className="font-medium">{profile.hours}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Emergency Contact</label>
                <div className="font-medium">{profile.emergencyContact}</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Departments</h3>
            <div className="flex flex-wrap gap-2">
              {profile.departments.map((d, i) => (
                <div key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center">
                  {d}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Services</h3>
            <div className="flex flex-wrap gap-2">
              {profile.services.map((s, i) => (
                <div key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{s}</div>
              ))}
            </div>
          </div>

          {editing && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Edit Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">Hospital Name</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.hospitalName} onInput={(e) => setProfile(p => ({ ...p, hospitalName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Registration Number</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.registrationNumber} onInput={(e) => setProfile(p => ({ ...p, registrationNumber: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Type</label>
                  <select className="w-full px-3 py-2 border rounded" value={profile.hospitalType} onChange={(e) => setProfile(p => ({ ...p, hospitalType: e.target.value }))}>
                    <option value="private">Private hospitals</option>
                    <option value="government">Government hospitals</option>
                    <option value="semi">Semi hospitals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Phone</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.phone} onInput={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Email</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.email} onInput={(e) => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700">Address</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.address} onInput={(e) => setProfile(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">City</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.city} onInput={(e) => setProfile(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">State</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.state} onInput={(e) => setProfile(p => ({ ...p, state: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Pincode</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.pincode} onInput={(e) => setProfile(p => ({ ...p, pincode: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Beds</label>
                  <input type="number" className="w-full px-3 py-2 border rounded" value={profile.beds} onInput={(e) => setProfile(p => ({ ...p, beds: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Accreditation</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.accreditation} onInput={(e) => setProfile(p => ({ ...p, accreditation: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Working Hours</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.hours} onInput={(e) => setProfile(p => ({ ...p, hours: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Emergency Contact</label>
                  <input className="w-full px-3 py-2 border rounded" value={profile.emergencyContact} onInput={(e) => setProfile(p => ({ ...p, emergencyContact: e.target.value }))} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700">Logo</label>
                  <input type="file" accept="image/*" onChange={onLogoChange} className="mt-1" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700">Add Department</label>
                  <div className="flex gap-2 mt-1">
                    <input value={newDept} onInput={(e) => setNewDept(e.target.value)} className="flex-1 px-3 py-2 border rounded" />
                    <button onClick={addDepartment} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Add Service</label>
                  <div className="flex gap-2 mt-1">
                    <input value={newService} onInput={(e) => setNewService(e.target.value)} className="flex-1 px-3 py-2 border rounded" />
                    <button onClick={addService} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">Save Profile</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}