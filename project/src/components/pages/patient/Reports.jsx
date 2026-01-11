import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { PatientLayout } from '../../ui/PatientLayout'
import { jsPDF } from 'jspdf'

export function Reports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('accessToken')
        if (!token) {
          setError('Please login to view reports')
          setLoading(false)
          return
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
        const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'

        console.log('📡 Fetching reports from:', `${apiUrl}patient/appointments-with-prescriptions/`)

        const response = await fetch(`${apiUrl}patient/appointments-with-prescriptions/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('📥 Response Status:', response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Failed to fetch reports:', errorData)
          throw new Error(errorData.detail || 'Failed to fetch reports')
        }

        const data = await response.json()
        console.log('✅ Reports received:', data)

        // Map API response to component format
        const reportsArray = Array.isArray(data) ? data : []
        const mappedReports = reportsArray.map(item => {
          const { appointment, prescription } = item
          
          // Format medicines as prescription text
          const prescriptionText = prescription?.medicines?.length > 0
            ? prescription.medicines.map(med => 
                `${med.medicine_name} ${med.dose} - ${med.frequency} (${med.timing}) for ${med.duration}`
              ).join(', ')
            : 'No prescription'

          // Build signature URL
          const baseUrlClean = apiUrl.replace(/\/$/, '')
          const signatureUrl = prescription?.digital_signature 
            ? `${baseUrlClean}${prescription.digital_signature}`
            : null

          return {
            id: appointment.id,
            date: appointment.appointment_date,
            doctor: appointment.doctor_name,
            doctorId: `DOC-${appointment.doctor}`,
            type: 'Consultation',
            status: appointment.status === 'completed' ? 'completed' : 'upcoming',
            symptoms: prescription?.additional_notes || 'Not recorded',
            diagnosis: prescription?.diagnosis || 'Pending',
            prescription: prescriptionText,
            signature: signatureUrl,
            // Additional fields from API
            startTime: appointment.start_time,
            endTime: appointment.end_time,
            paymentStatus: appointment.payment_status,
            amount: appointment.amount,
            transcriptionFile: appointment.transcription_file,
            medicines: prescription?.medicines || []
          }
        })

        setReports(mappedReports)
      } catch (err) {
        console.error('Error fetching reports:', err)
        setError(err.message || 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Helper function to load image from URL and convert to base64
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous' // Enable CORS
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          const dataURL = canvas.toDataURL('image/png')
          resolve(dataURL)
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = (err) => reject(err)
      img.src = url
    })
  }

  const handleDownload = async (reportId) => {
    try {
      const report = reports.find(r => r.id === reportId)
      if (!report) throw new Error('Report not found')

      // Load signature image if available
      let signatureBase64 = null
      if (report.signature) {
        try {
          console.log('Loading signature from:', report.signature)
          signatureBase64 = await loadImageAsBase64(report.signature)
          console.log('Signature loaded successfully')
        } catch (err) {
          console.warn('Could not load signature image:', err)
          // Continue without signature image
        }
      }

      // Generate PDF prescription
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPos = margin

      // Helper function to add text with word wrap
      const addWrappedText = (text, x, y, maxWidth, lineHeight = 6) => {
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y)
        return y + (lines.length * lineHeight)
      }

      // ===== HEADER SECTION =====
      // Green header bar
      doc.setFillColor(5, 150, 105) // Green color
      doc.rect(0, 0, pageWidth, 45, 'F')

      // Clinic/Hospital Name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('SwasthLink Healthcare', margin, 18)

      // Tagline
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Your Health, Our Priority', margin, 26)

      // Contact Info on right
      doc.setFontSize(9)
      doc.text('📞 1800-XXX-XXXX', pageWidth - margin - 40, 18)
      doc.text('🌐 www.swasthlink.in', pageWidth - margin - 40, 26)
      doc.text('✉ care@swasthlink.in', pageWidth - margin - 40, 34)

      // ===== PRESCRIPTION TITLE =====
      yPos = 55
      doc.setTextColor(5, 150, 105)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('MEDICAL PRESCRIPTION', pageWidth / 2, yPos, { align: 'center' })

      // Divider line
      yPos += 8
      doc.setDrawColor(5, 150, 105)
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, pageWidth - margin, yPos)

      // ===== DOCTOR INFO SECTION =====
      yPos += 12
      doc.setFillColor(240, 253, 244) // Light green background
      doc.rect(margin, yPos - 5, pageWidth - (2 * margin), 28, 'F')

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(report.doctor, margin + 5, yPos + 3)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`Reg. No: ${report.doctorId}`, margin + 5, yPos + 11)
      doc.text(`Consultation Type: ${report.type}`, margin + 5, yPos + 18)

      // Date on right side
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Date: ${new Date(report.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin - 50, yPos + 3)
      if (report.startTime) {
        doc.text(`Time: ${report.startTime}`, pageWidth - margin - 50, yPos + 11)
      }

      // ===== PATIENT INFO =====
      yPos += 35
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      
      yPos += 8
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(9)
      doc.text('PATIENT DETAILS', margin, yPos)
      
      yPos += 6
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Patient ID: ', margin, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`#${report.id}`, margin + 25, yPos)

      // ===== SYMPTOMS / CHIEF COMPLAINTS =====
      yPos += 15
      doc.setFillColor(254, 243, 199) // Light yellow
      doc.rect(margin, yPos - 4, pageWidth - (2 * margin), 8, 'F')
      doc.setTextColor(146, 64, 14)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('CHIEF COMPLAINTS / SYMPTOMS', margin + 3, yPos + 1)

      yPos += 10
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      yPos = addWrappedText(report.symptoms || 'Not recorded', margin, yPos, pageWidth - (2 * margin))

      // ===== DIAGNOSIS =====
      yPos += 8
      doc.setFillColor(219, 234, 254) // Light blue
      doc.rect(margin, yPos - 4, pageWidth - (2 * margin), 8, 'F')
      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('DIAGNOSIS', margin + 3, yPos + 1)

      yPos += 10
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      yPos = addWrappedText(report.diagnosis || 'Pending', margin, yPos, pageWidth - (2 * margin))

      // ===== PRESCRIPTION / MEDICINES =====
      yPos += 8
      doc.setFillColor(220, 252, 231) // Light green
      doc.rect(margin, yPos - 4, pageWidth - (2 * margin), 8, 'F')
      doc.setTextColor(22, 101, 52)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('℞ PRESCRIPTION', margin + 3, yPos + 1)

      yPos += 12

      // Check if we have detailed medicines array
      if (report.medicines && report.medicines.length > 0) {
        // Table header
        doc.setFillColor(243, 244, 246)
        doc.rect(margin, yPos - 4, pageWidth - (2 * margin), 8, 'F')
        doc.setTextColor(75, 85, 99)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        
        const col1 = margin + 3
        const col2 = margin + 60
        const col3 = margin + 90
        const col4 = margin + 120
        const col5 = margin + 150
        
        doc.text('Medicine', col1, yPos)
        doc.text('Dose', col2, yPos)
        doc.text('Frequency', col3, yPos)
        doc.text('Timing', col4, yPos)
        doc.text('Duration', col5, yPos)

        yPos += 8
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)

        report.medicines.forEach((med, index) => {
          // Alternate row background
          if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251)
            doc.rect(margin, yPos - 4, pageWidth - (2 * margin), 8, 'F')
          }

          doc.text(`${index + 1}. ${med.medicine_name}`, col1, yPos)
          doc.text(med.dose || '-', col2, yPos)
          doc.text(med.frequency || '-', col3, yPos)
          doc.text((med.timing || '-').replace('_', ' '), col4, yPos)
          doc.text(med.duration || '-', col5, yPos)
          yPos += 8
        })
      } else {
        // Simple prescription text
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        yPos = addWrappedText(report.prescription || 'No prescription', margin, yPos, pageWidth - (2 * margin))
      }

      // ===== ADDITIONAL NOTES =====
      if (report.symptoms && report.symptoms !== 'Not recorded') {
        yPos += 10
        doc.setTextColor(100, 100, 100)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.text('Additional Notes: Drink plenty of fluids, take adequate rest.', margin, yPos)
      }

      // ===== SIGNATURE SECTION =====
      yPos = pageHeight - 55
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, yPos, pageWidth - margin, yPos)

      yPos += 10
      // Signature on right
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      if (signatureBase64) {
        // Add actual signature image
        try {
          doc.addImage(signatureBase64, 'PNG', pageWidth - margin - 65, yPos - 2, 60, 25)
          doc.setFontSize(8)
          doc.setTextColor(22, 101, 52)
          doc.text('✓ Digitally Signed', pageWidth - margin - 55, yPos + 26)
        } catch (imgErr) {
          console.warn('Failed to add signature to PDF:', imgErr)
          // Fallback: Draw placeholder box
          doc.setDrawColor(5, 150, 105)
          doc.setLineWidth(0.5)
          doc.rect(pageWidth - margin - 60, yPos, 60, 20)
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          doc.text('Digital Signature', pageWidth - margin - 55, yPos + 12)
        }
      } else if (report.signature) {
        // Signature URL exists but couldn't load - show placeholder
        doc.setDrawColor(5, 150, 105)
        doc.setLineWidth(0.5)
        doc.rect(pageWidth - margin - 60, yPos, 60, 20)
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('Digital Signature', pageWidth - margin - 55, yPos + 12)
      }

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.text(report.doctor, pageWidth - margin - 60, yPos + 32)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(`Reg: ${report.doctorId}`, pageWidth - margin - 60, yPos + 38)

      // ===== FOOTER =====
      yPos = pageHeight - 15
      doc.setFillColor(243, 244, 246)
      doc.rect(0, yPos - 5, pageWidth, 20, 'F')
      
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('This is a computer-generated prescription and is valid without physical signature.', pageWidth / 2, yPos, { align: 'center' })
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | Prescription ID: RX-${report.id}`, pageWidth / 2, yPos + 5, { align: 'center' })

      // Save PDF
      doc.save(`prescription-${report.id}.pdf`)
    } catch (err) {
      console.error('Download failed', err)
      alert('Failed to download prescription')
    }
  }

  const handleShare = (reportId) => {
    ;(async () => {
      try {
        const report = reports.find(r => r.id === reportId)
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
    <PatientLayout title="Health Records" subtitle={loading ? 'Loading...' : `${filteredReports.length} records found`}>
      <div className="max-w-6xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your health records...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <div className="text-red-600 dark:text-red-400 text-2xl">⚠️</div>
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-semibold">Error loading records</h3>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content - Only show when not loading */}
        {!loading && !error && (
          <>
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
          </>
        )}
      </div>
    </PatientLayout>
  )
}