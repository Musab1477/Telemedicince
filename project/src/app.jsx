import { Router, Route } from 'preact-router'

// Import pages
import { HomePage } from './components/pages/HomePage'

// Patient pages
import { PatientLogin } from './components/pages/patient/PatientLogin'
import { PatientRegister } from './components/pages/patient/PatientRegister'
import { PatientDashboard } from './components/pages/patient/PatientDashboard'
import { SearchDoctor } from './components/pages/patient/SearchDoctor'
import { DoctorProfile } from './components/pages/patient/DoctorProfile'
import { Booking } from './components/pages/patient/Booking'
import { Reports } from './components/pages/patient/Reports'
import { Community } from './components/pages/patient/Community'
import GroupPage from './components/pages/patient/GroupPage'
import { ConsultationLive } from './components/pages/patient/ConsultationLive'
import Hospitals from './components/pages/patient/Hospitals'
import NGOs from './components/pages/patient/NGOs'
import MyAppointments from './components/pages/patient/MyAppointments'
import Payment from './components/pages/patient/Payment'


// Doctor pages
import { DoctorLogin } from './components/pages/doctor/DoctorLogin'
import { DoctorRegister } from './components/pages/doctor/DoctorRegister'
import { DoctorDashboard } from './components/pages/doctor/DoctorDashboard'
import { Schedule } from './components/pages/doctor/Schedule'
import { OfflineEMR } from './components/pages/doctor/OfflineEMR'
import { Prescriptions } from './components/pages/doctor/Prescriptions'
import { JoinClinicRequest } from './components/pages/doctor/JoinClinicRequest'
import { IndependentPractice } from './components/pages/doctor/IndependentPractice'
import { ConsultationRoom } from './components/pages/doctor/ConsultationRoom'
import ConsultationList from './components/pages/doctor/ConsultationList'
import ConsultationSummary from './components/pages/doctor/ConsultationSummary'
import VideoConsultation from './components/pages/doctor/VideoConsultation'

// Hospital pages
import { HospitalLogin } from './components/pages/hospital/HospitalLogin'
import { HospitalRegister } from './components/pages/hospital/HospitalRegister'
import { HospitalDashboard } from './components/pages/hospital/HospitalDashboard'
import { VerifyDoctorRequests } from './components/pages/hospital/VerifyDoctorRequests'
import { HospitalProfile } from './components/pages/hospital/HospitalProfile'
import { AddDoctorManually } from './components/pages/hospital/AddDoctorManually'
import { VerificationPendingPage } from './components/pages/VerificationPendingPage'
import ManageDoctors from './components/pages/hospital/ManageDoctors'
import PatientsRecord from './components/pages/hospital/PatientsRecord'

// NGO pages
import { NGOLogin } from './components/pages/ngo/NGOLogin'
import { NGORegister } from './components/pages/ngo/NGORegister'
import { NGODashboard } from './components/pages/ngo/NGODashboard'

// Admin pages
import { AdminLogin } from './components/pages/admin/AdminLogin'
import { AdminDashboard } from './components/pages/admin/AdminDashboard'
import { VerifyEntities } from './components/pages/admin/VerifyEntities'
import { VerificationQueue } from './components/pages/admin/VerificationQueue'
import { Logs } from './components/pages/admin/Logs'
import { NavBar } from './components/ui/NavBar'
import PatientProfileClean from './components/pages/patient/PatientProfileClean'
import DoctorProfileSelf from './components/pages/doctor/DoctorProfile'
import HospitalDetails from './components/pages/patient/HospitalDetails'
import NGODetails from './components/pages/patient/NGODetails'
import { SideBar } from './components/ui/SideBar'
import FormBuilder from './components/pages/hospital/FormBuilder'
import HealthAgent from './components/pages/patient/HealthAgent'
import N8nChatLoader from './components/pages/patient/N8nChatLoader'


export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <N8nChatLoader />
      <Router>
        <Route path="/" component={HomePage} />
        <Route path="/navbar" component={NavBar} />
        <Route path="/sidebar" component={SideBar} />


        {/* Patient Routes */}
        <Route path="/patient/login" component={PatientLogin} />
        <Route path="/patient/register" component={PatientRegister} />
        <Route path="/patient/dashboard" component={PatientDashboard} />
        <Route path="/patient/profile" component={PatientProfileClean} />
        <Route path="/patient/search-doctors" component={SearchDoctor} />
        <Route path="/patient/appointments" component={MyAppointments} />
        <Route path="/patient/payment" component={Payment} />
        <Route path="/patient/hospitals" component={Hospitals} />
        <Route path="/patient/ngos" component={NGOs} />
        <Route path="/patient/consultation/:id" component={ConsultationLive} />
        <Route path="/patient/doctor/:id" component={DoctorProfile} />
        <Route path="/patient/hospital/:id" component={HospitalDetails} />
        <Route path="/patient/ngo/:id" component={NGODetails} />
        <Route path="/patient/booking/:doctorId" component={Booking} />
        <Route path="/patient/reports" component={Reports} />
        <Route path="/patient/community/:id" component={GroupPage} />
        <Route path="/patient/community" component={Community} />
        <Route path="/patient/health-agent" component={HealthAgent} />
        
        {/* Doctor Routes */}
        <Route path="/doctor/login" component={DoctorLogin} />
        <Route path="/doctor/register" component={DoctorRegister} />
        <Route path="/doctor/dashboard" component={DoctorDashboard} />
        <Route path="/doctor/schedule" component={Schedule} />
        <Route path="/doctor/emr" component={OfflineEMR} />
        <Route path="/doctor/prescriptions" component={Prescriptions} />
        <Route path="/doctor/consultations" component={ConsultationList} />
        <Route path="/doctor/video-consultation/:appointmentId" component={VideoConsultation} />
        <Route path="/doctor/consultationRoom" component={ConsultationRoom} />
        <Route path="/doctor/consultation-summary/:id" component={ConsultationSummary} />
        <Route path="/verification-pending" component={VerificationPendingPage} />
        <Route path="/doctor/join-clinic" component={JoinClinicRequest} />
        <Route path="/doctor/independent" component={IndependentPractice} />
        <Route path="/doctor/profile" component={DoctorProfileSelf} />

        
        {/* Hospital Routes */}
        <Route path="/hospital/login" component={HospitalLogin} />
        <Route path="/hospital/register" component={HospitalRegister} />
        <Route path="/hospital/dashboard" component={HospitalDashboard} />
        <Route path="/hospital/doctor-requests" component={VerifyDoctorRequests} />
        <Route path="/hospital/patients-record" component={PatientsRecord} />

        <Route path="/hospital/profile" component={HospitalProfile} />
        <Route path="/hospital/manage-doctors" component={ManageDoctors} />
        <Route path="/hospital/form-builder" component={FormBuilder} />

        <Route path="/hospital/add-doctor" component={AddDoctorManually} />
        
        {/* NGO Routes */}
        <Route path="/ngo/login" component={NGOLogin} />
        <Route path="/ngo/register" component={NGORegister} />
        <Route path="/ngo/dashboard" component={NGODashboard} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/verify-entities" component={VerifyEntities} />
        <Route path="/admin/verification-queue" component={VerificationQueue} />
        <Route path="/admin/logs" component={Logs} />
      </Router>
    </div>
  )
}