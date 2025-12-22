export const ta = {
  // Common
  common: {
    loading: 'ஏற்றுகிறது...',
    error: 'பிழை',
    success: 'வெற்றி',
    cancel: 'ரத்து செய்',
    confirm: 'உறுதிப்படுத்து',
    save: 'சேமி',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    back: 'பின்',
    next: 'அடுத்து',
    previous: 'முந்தைய',
    submit: 'சமர்ப்பி',
    search: 'தேடு',
    filter: 'வடிகட்டு',
    clear: 'அழி',
    close: 'மூடு',
    open: 'திற',
    yes: 'ஆம்',
    no: 'இல்லை',
    ok: 'சரி',
    retry: 'மீண்டும் முயற்சி',
    refresh: 'புதுப்பி'
  },

  // App
  app: {
    name: 'ஸ்வாஸ்த்லிங்க்',
    tagline: 'கிராமப்புற சுகாதாரத்திற்கான டெலிமெடிசின் தளம்',
    welcome: 'ஸ்வாஸ்த்லிங்க்கிற்கு வரவேற்கிறோம்',
    description: 'உங்கள் சுகாதார இணைப்பு, குறைந்த அலைவரிசை நெட்வொர்க்குகளுக்கு உகந்தது.'
  },

  // Navigation
  nav: {
    home: 'முகப்பு',
    dashboard: 'டாஷ்போர்டு',
    profile: 'சுயவிவரம்',
    settings: 'அமைப்புகள்',
    logout: 'வெளியேறு',
    login: 'உள்நுழை',
    register: 'பதிவு'
  },

  // Authentication
  auth: {
    login: 'உள்நுழை',
    register: 'பதிவு',
    logout: 'வெளியேறு',
    phone: 'தொலைபேசி எண்',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்து',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    rememberMe: 'என்னை நினைவில் வைத்துக்கொள்',
    loginSuccess: 'உள்நுழைவு வெற்றிகரமானது',
    loginError: 'உள்நுழைவு தோல்வி. மீண்டும் முயற்சிக்கவும்.',
    registerSuccess: 'பதிவு வெற்றிகரமானது',
    registerError: 'பதிவு தோல்வி. மீண்டும் முயற்சிக்கவும்.',
    invalidCredentials: 'தவறான அறிமுக விவரங்கள்',
    phoneRequired: 'தொலைபேசி எண் தேவை',
    passwordRequired: 'கடவுச்சொல் தேவை',
    selectRole: 'உங்கள் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்:',
    patientLogin: 'நோயாளி உள்நுழைவு',
    providerLogin: 'சுகாதார வழங்குநர் உள்நுழைவு',
    newPatient: 'புதிய நோயாளியா?',
    registerHere: 'இங்கே பதிவு செய்யுங்கள்',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    loginHere: 'இங்கே உள்நுழையுங்கள்'
  },

  // User Roles
  roles: {
    patient: 'நோயாளி',
    doctor: 'மருத்துவர்',
    hospital: 'மருத்துவமனை நிர்வாகி',
    admin: 'சூப்பர் நிர்வாகி'
  },

  // Patient
  patient: {
    dashboard: 'நோயாளி டாஷ்போர்டு',
    register: 'நோயாளி பதிவு',
    findDoctors: 'மருத்துவர்களைக் கண்டறியுங்கள்',
    myAppointments: 'எனது சந்திப்புகள்',
    healthRecords: 'சுகாதார பதிவுகள்',
    searchDoctors: 'உங்களுக்கு அருகிலுள்ள மருத்துவர்களைத் தேடுங்கள்',
    viewAppointments: 'வரவிருக்கும் ஆலோசனைகளைப் பார்க்கவும்',
    viewRecords: 'உங்கள் மருத்துவ வரலாற்றை அணுகவும்',
    fullName: 'முழு பெயர்',
    preferredLanguage: 'விருப்பமான மொழி',
    createAccount: 'உங்கள் ஸ்வாஸ்த்லிங்க் கணக்கை உருவாக்குங்கள்'
  },

  // Doctor
  doctor: {
    dashboard: 'மருத்துவர் டாஷ்போர்டு',
    register: 'மருத்துவர் பதிவு',
    todaysAppointments: 'இன்றைய சந்திப்புகள்',
    patientRecords: 'நோயாளி பதிவுகள்',
    prescriptions: 'மருந்து பரிந்துரைகள்',
    manageConsultations: 'உங்கள் ஆலோசனைகளை நிர்வகிக்கவும்',
    accessEMR: 'EMR மற்றும் வரலாற்றை அணுகவும்',
    managePrescriptions: 'மருந்து பரிந்துரைகளை உருவாக்கி நிர்வகிக்கவும்',
    doctorKey: 'மருத்துவர் கீ',
    enterKey: 'உங்கள் கீயை உள்ளிடவும்'
  },

  // Hospital
  hospital: {
    dashboard: 'மருத்துவமனை டாஷ்போர்டு',
    register: 'மருத்துவமனை பதிவு',
    doctorRequests: 'மருத்துவர் கோரிக்கைகள்',
    hospitalDoctors: 'மருத்துவமனை மருத்துவர்கள்',
    hospitalProfile: 'மருத்துவமனை சுயவிவரம்',
    reviewRequests: 'நிலுவையில் உள்ள மருத்துவர் விண்ணப்பங்களை மதிப்பாய்வு செய்யுங்கள்',
    manageDoctors: 'உங்கள் மருத்துவ ஊழியர்களை நிர்வகிக்கவும்',
    editProfile: 'மருத்துவமனை தகவலை புதுப்பிக்கவும்',
    hospitalKey: 'மருத்துவமனை கீ'
  },

  // Admin
  admin: {
    dashboard: 'நிர்வாகி டாஷ்போர்டு',
    verifyHospitals: 'மருத்துவமனைகளை சரிபார்க்கவும்',
    platformLogs: 'தளம் பதிவுகள்',
    systemStats: 'கணினி புள்ளிவிவரங்கள்',
    reviewHospitals: 'மருத்துவமனை பதிவுகளை மதிப்பாய்வு செய்யுங்கள்',
    viewLogs: 'கணினி செயல்பாடுகளை கண்காணிக்கவும்',
    viewStats: 'தளம் பயன்பாட்டு புள்ளிவிவரங்கள்',
    platformAdmin: 'தளம் நிர்வாகம்',
    adminKey: 'நிர்வாகி கீ'
  },

  // Network Status
  network: {
    offline: 'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். இணைப்பு மீட்டமைக்கப்படும்போது தரவு ஒத்திசைக்கப்படும்.',
    slowConnection: 'மெதுவான இணைப்பு கண்டறியப்பட்டது. குறைந்த அலைவரிசைக்கு உகந்ததாக மாற்றுகிறது.',
    syncing: 'ஒத்திசைக்கிறது',
    items: 'உருப்படிகள்',
    itemsFailed: 'உருப்படிகள் ஒத்திசைக்க முடியவில்லை',
    networkStatus: 'நெட்வொர்க் நிலை:',
    online: 'ஆன்லைன்',
    speed: 'வேகம்'
  },

  // Errors
  errors: {
    accessDenied: 'அணுகல் மறுக்கப்பட்டது',
    noPermission: 'இந்தப் பக்கத்தை அணுக உங்களுக்கு அனுமதி இல்லை. உங்கள் பாத்திரத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    pageNotFound: 'பக்கம் கிடைக்கவில்லை',
    goHome: 'முகப்புக்குச் செல்லுங்கள்',
    logoutAndLogin: 'வெளியேறி மீண்டும் உள்நுழையுங்கள்',
    verificationPending: 'சரிபார்ப்பு நிலுவையில்',
    accountPending: 'உங்கள் கணக்கு சரிபார்ப்புக்காக நிலுவையில் உள்ளது. அனுமதிக்காக காத்திருக்கவும்.',
    doctorVerificationMessage: 'உங்கள் மருத்துவர் பதிவு மதிப்பாய்வு செய்யப்படுகிறது. மருத்துவமனை நிர்வாகத்தால் உங்கள் சான்றுகள் சரிபார்க்கப்பட்ட பிறகு உங்களுக்கு அணுகல் கிடைக்கும்.',
    hospitalVerificationMessage: 'உங்கள் மருத்துவமனை பதிவு மதிப்பாய்வு செய்யப்படுகிறது. தளம் நிர்வாகிகளால் உங்கள் ஆவணங்கள் சரிபார்க்கப்பட்ட பிறகு உங்களுக்கு அணுகல் கிடைக்கும்.',
    whatHappensNext: 'அடுத்து என்ன நடக்கும்?',
    checkStatusAgain: 'நிலையை மீண்டும் சரிபார்க்கவும்',
    needHelp: 'உதவி தேவையா? support@swasthlink.in இல் ஆதரவைத் தொடர்பு கொள்ளுங்கள்'
  },

  // Languages
  languages: {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    ta: 'தமிழ் (Tamil)',
    mr: 'मराठी (Marathi)'
  },

  // Forms
  forms: {
    required: 'தேவை',
    optional: 'விருப்பமானது',
    pleaseSelect: 'தயவுசெய்து தேர்ந்தெடுக்கவும்',
    enterValue: 'மதிப்பை உள்ளிடவும்',
    invalidFormat: 'தவறான வடிவம்',
    fieldRequired: 'இந்த புலம் தேவை'
  }
}