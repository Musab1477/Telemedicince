import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { PatientLayout } from '../../ui/PatientLayout'

export function Reports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const mockReports = [
    {
      id: 1,
      date: '2024-01-15',
      doctor: 'Dr. Rajesh Kumar',
      doctorId: 'MCI-12345',
      type: 'General Checkup',
      status: 'completed',
      symptoms: 'Fever, headache',
      diagnosis: 'Viral fever',
      prescription: 'Paracetamol 500mg, Rest',
      signature: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80"%3E%3Ctext x="10" y="40" font-family="cursive" font-size="24" fill="%23059669"%3EDr. R. Kumar%3C/text%3E%3Ctext x="10" y="60" font-family="monospace" font-size="10" fill="%23666"%3EMCI-12345%3C/text%3E%3C/svg%3E'
    },
    {
      id: 2,
      date: '2024-01-10',
      doctor: 'Dr. Priya Sharma',
      doctorId: 'MCI-67890',
      type: 'Follow-up',
      status: 'completed',
      symptoms: 'Cough, cold',
      diagnosis: 'Upper respiratory infection',
      prescription: 'Cough syrup, Steam inhalation',
      signature: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80"%3E%3Ctext x="10" y="40" font-family="cursive" font-size="24" fill="%23059669"%3EDr. P. Sharma%3C/text%3E%3Ctext x="10" y="60" font-family="monospace" font-size="10" fill="%23666"%3EMCI-67890%3C/text%3E%3C/svg%3E'
    },
    {
      id: 3,
      date: '2024-01-20',
      doctor: 'Dr. Amit Patel',
      doctorId: 'MCI-11223',
      type: 'Cardiology Consultation',
      status: 'upcoming',
      symptoms: 'Chest pain',
      diagnosis: 'Pending',
      prescription: 'Pending',
      signature: null
    }
  ]

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleDownload = (reportId) => {
    try {
      const report = mockReports.find(r => r.id === reportId)
      if (!report) throw new Error('Report not found')

      const html = generateReportHTML(report)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${reportId}.html`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
      alert('Failed to download report')
    }
  }

  const handleShare = (reportId) => {
    ;(async () => {
      try {
        const report = mockReports.find(r => r.id === reportId)
        if (!report) throw new Error('Report not found')

        const html = generateReportHTML(report)
        const blob = new Blob([html], { type: 'text/html' })
        const fileName = `report-${reportId}.html`

        // Try Web Share API with files (if supported)
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: blob.type })] })) {
          const file = new File([blob], fileName, { type: blob.type })
          await navigator.share({ files: [file], title: `Health report - ${report.type}`, text: `Report from ${report.doctor} on ${report.date}` })
          return
        }

        // Fallback: share text using navigator.share (mobile browsers)
        if (navigator.share) {
          await navigator.share({ title: `Health report - ${report.type}`, text: `Report from ${report.doctor} on ${report.date}\n\nDiagnosis: ${report.diagnosis}\nPrescription: ${report.prescription}` })
          return
        }

        // Last resort: copy report HTML to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(html)
          alert('Report copied to clipboard. You can paste it in messages or email.')
          return
        }

        // Very last fallback: trigger download so user can share the file manually
        handleDownload(reportId)
      } catch (err) {
        console.error('Share failed', err)
        alert('Failed to share report')
      }
    })()
  }

  const generateReportHTML = (report) => {
    const safe = (s) => (s == null ? '' : String(s))
    const signatureHTML = report.signature 
      ? `<div class="section">
        <div class="label">Digital Signature</div>
        <img src="${report.signature}" alt="Doctor's signature" style="max-width:200px;margin-top:8px;" />
        <div class="muted" style="margin-top:4px;">Digitally signed by ${safe(report.doctor)}</div>
      </div>`
      : ''

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Report - ${safe(report.id)}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:20px;color:#111}
      .card{max-width:800px;margin:0 auto;border:1px solid #e5e7eb;padding:18px;border-radius:8px}
      h1{font-size:18px;margin-bottom:4px}
      p{margin:6px 0}
      .muted{color:#6b7280;font-size:13px}
      .section{margin-top:12px}
      .label{font-weight:600}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Health Report</h1>
      <div class="muted">${safe(report.type)} • ${new Date(report.date).toLocaleDateString()}</div>
      <div class="section">
        <div class="label">Doctor</div>
        <div>${safe(report.doctor)}</div>
      </div>
      <div class="section">
        <div class="label">Symptoms</div>
        <div>${safe(report.symptoms)}</div>
      </div>
      <div class="section">
        <div class="label">Diagnosis</div>
        <div>${safe(report.diagnosis)}</div>
      </div>
      <div class="section">
        <div class="label">Prescription</div>
        <div>${safe(report.prescription)}</div>
      </div>
      ${signatureHTML}
    </div>
  </body>
</html>`
  }

  return (
    <PatientLayout title="Health Records" subtitle={`${filteredReports.length} records found`}>
      <div className="max-w-6xl mx-auto">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search by doctor, symptoms, or diagnosis..."
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'all' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Records
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'completed' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilterStatus('upcoming')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'upcoming' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Upcoming
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No records found</h3>
              <p className="text-gray-600 dark:text-gray-400">Your consultation history will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReports.map(report => (
                <div 
                  key={report.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-2xl flex-shrink-0">
                            📋
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.type}</h3>
                            <p className="text-green-600 dark:text-green-400 font-medium">{report.doctor}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{new Date(report.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {report.status === 'completed' ? '✓ Completed' : '⏳ Upcoming'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Symptoms</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{report.symptoms}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Diagnosis</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{report.diagnosis}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Prescription</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{report.prescription}</p>
                        </div>
                      </div>

                      {/* Digital Signature */}
                      {report.signature && report.status === 'completed' && (
                        <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                                ✓
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-900 dark:text-green-400 text-sm mb-2">Digital Signature</h4>
                              <img 
                                src={report.signature} 
                                alt="Doctor's digital signature" 
                                className="max-w-[200px] mb-2 bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-700"
                              />
                              <p className="text-xs text-green-700 dark:text-green-400">
                                Digitally signed by {report.doctor} (Reg: {report.doctorId})
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                                This prescription is verified and authenticated
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {report.status === 'completed' && (
                      <div className="flex flex-row lg:flex-col gap-2">
                        <button 
                          onClick={() => handleDownload(report.id)}
                          className="flex-1 lg:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </button>
                        <button 
                          onClick={() => handleShare(report.id)}
                          className="flex-1 lg:flex-none bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  )
}