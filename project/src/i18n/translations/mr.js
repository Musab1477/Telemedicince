export const mr = {
  // Common
  common: {
    loading: 'लोड होत आहे...',
    error: 'त्रुटी',
    success: 'यश',
    cancel: 'रद्द करा',
    confirm: 'पुष्टी करा',
    save: 'जतन करा',
    edit: 'संपादित करा',
    delete: 'हटवा',
    back: 'मागे',
    next: 'पुढे',
    previous: 'मागील',
    submit: 'सबमिट करा',
    search: 'शोधा',
    filter: 'फिल्टर',
    clear: 'साफ करा',
    close: 'बंद करा',
    open: 'उघडा',
    yes: 'होय',
    no: 'नाही',
    ok: 'ठीक आहे',
    retry: 'पुन्हा प्रयत्न करा',
    refresh: 'रिफ्रेश करा'
  },

  // App
  app: {
    name: 'स्वास्थ्यलिंक',
    tagline: 'ग्रामीण आरोग्यसेवेसाठी टेलिमेडिसिन प्लॅटफॉर्म',
    welcome: 'स्वास्थ्यलिंकमध्ये आपले स्वागत आहे',
    description: 'आपले आरोग्य कनेक्शन, कमी बँडविड्थ नेटवर्कसाठी अनुकूलित.'
  },

  // Navigation
  nav: {
    home: 'होम',
    dashboard: 'डॅशबोर्ड',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्ज',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    register: 'नोंदणी'
  },

  // Authentication
  auth: {
    login: 'लॉगिन',
    register: 'नोंदणी',
    logout: 'लॉगआउट',
    phone: 'फोन नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्डची पुष्टी करा',
    forgotPassword: 'पासवर्ड विसरलात?',
    rememberMe: 'मला लक्षात ठेवा',
    loginSuccess: 'लॉगिन यशस्वी',
    loginError: 'लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    registerSuccess: 'नोंदणी यशस्वी',
    registerError: 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    invalidCredentials: 'अवैध क्रेडेन्शियल्स',
    phoneRequired: 'फोन नंबर आवश्यक आहे',
    passwordRequired: 'पासवर्ड आवश्यक आहे',
    selectRole: 'आपली भूमिका निवडा:',
    patientLogin: 'रुग्ण लॉगिन',
    providerLogin: 'आरोग्य सेवा प्रदाता लॉगिन',
    newPatient: 'नवीन रुग्ण?',
    registerHere: 'येथे नोंदणी करा',
    alreadyHaveAccount: 'आधीच खाते आहे?',
    loginHere: 'येथे लॉगिन करा'
  },

  // User Roles
  roles: {
    patient: 'रुग्ण',
    doctor: 'डॉक्टर',
    hospital: 'हॉस्पिटल अॅडमिन',
    admin: 'सुपर अॅडमिन'
  },

  // Patient
  patient: {
    dashboard: 'रुग्ण डॅशबोर्ड',
    register: 'रुग्ण नोंदणी',
    findDoctors: 'डॉक्टर शोधा',
    myAppointments: 'माझ्या अपॉइंटमेंट्स',
    healthRecords: 'आरोग्य नोंदी',
    searchDoctors: 'आपल्या जवळचे डॉक्टर शोधा',
    viewAppointments: 'आगामी सल्लामसलत पहा',
    viewRecords: 'आपला वैद्यकीय इतिहास पहा',
    fullName: 'पूर्ण नाव',
    preferredLanguage: 'पसंतीची भाषा',
    createAccount: 'आपले स्वास्थ्यलिंक खाते तयार करा'
  },

  // Doctor
  doctor: {
    dashboard: 'डॉक्टर डॅशबोर्ड',
    register: 'डॉक्टर नोंदणी',
    todaysAppointments: 'आजच्या अपॉइंटमेंट्स',
    patientRecords: 'रुग्ण नोंदी',
    prescriptions: 'प्रिस्क्रिप्शन्स',
    manageConsultations: 'आपल्या सल्लामसलत व्यवस्थापित करा',
    accessEMR: 'EMR आणि इतिहासात प्रवेश करा',
    managePrescriptions: 'प्रिस्क्रिप्शन्स तयार करा आणि व्यवस्थापित करा',
    doctorKey: 'डॉक्टर की',
    enterKey: 'आपली की प्रविष्ट करा'
  },

  // Hospital
  hospital: {
    dashboard: 'हॉस्पिटल डॅशबोर्ड',
    register: 'हॉस्पिटल नोंदणी',
    doctorRequests: 'डॉक्टर विनंत्या',
    hospitalDoctors: 'हॉस्पिटल डॉक्टर्स',
    hospitalProfile: 'हॉस्पिटल प्रोफाइल',
    reviewRequests: 'प्रलंबित डॉक्टर अर्जांचे पुनरावलोकन करा',
    manageDoctors: 'आपल्या वैद्यकीय कर्मचाऱ्यांचे व्यवस्थापन करा',
    editProfile: 'हॉस्पिटलची माहिती अपडेट करा',
    hospitalKey: 'हॉस्पिटल की'
  },

  // Admin
  admin: {
    dashboard: 'अॅडमिन डॅशबोर्ड',
    verifyHospitals: 'हॉस्पिटल्स सत्यापित करा',
    platformLogs: 'प्लॅटफॉर्म लॉग्स',
    systemStats: 'सिस्टम आकडेवारी',
    reviewHospitals: 'हॉस्पिटल नोंदणीचे पुनरावलोकन करा',
    viewLogs: 'सिस्टम क्रियाकलापांचे निरीक्षण करा',
    viewStats: 'प्लॅटफॉर्म वापर आकडेवारी',
    platformAdmin: 'प्लॅटफॉर्म प्रशासन',
    adminKey: 'अॅडमिन की'
  },

  // Network Status
  network: {
    offline: 'आपण ऑफलाइन आहात. कनेक्शन पुनर्संचयित झाल्यावर डेटा सिंक होईल.',
    slowConnection: 'मंद कनेक्शन आढळले. कमी बँडविड्थसाठी अनुकूलित करत आहे.',
    syncing: 'सिंक करत आहे',
    items: 'आयटम',
    itemsFailed: 'आयटम सिंक करू शकले नाहीत',
    networkStatus: 'नेटवर्क स्थिती:',
    online: 'ऑनलाइन',
    speed: 'गती'
  },

  // Errors
  errors: {
    accessDenied: 'प्रवेश नाकारला',
    noPermission: 'आपल्याला या पृष्ठावर प्रवेश करण्याची परवानगी नाही. कृपया आपली भूमिका तपासा आणि पुन्हा प्रयत्न करा.',
    pageNotFound: 'पृष्ठ सापडले नाही',
    goHome: 'होमवर जा',
    logoutAndLogin: 'लॉगआउट करा आणि पुन्हा लॉगिन करा',
    verificationPending: 'सत्यापन प्रलंबित',
    accountPending: 'आपले खाते सत्यापनासाठी प्रलंबित आहे. कृपया मंजुरीची प्रतीक्षा करा.',
    doctorVerificationMessage: 'आपल्या डॉक्टर नोंदणीचे पुनरावलोकन केले जात आहे. हॉस्पिटल प्रशासनाद्वारे आपली ओळखपत्रे सत्यापित झाल्यानंतर आपल्याला प्रवेश मिळेल.',
    hospitalVerificationMessage: 'आपल्या हॉस्पिटल नोंदणीचे पुनरावलोकन केले जात आहे. प्लॅटफॉर्म प्रशासकांद्वारे आपली कागदपत्रे सत्यापित झाल्यानंतर आपल्याला प्रवेश मिळेल.',
    whatHappensNext: 'पुढे काय होते?',
    checkStatusAgain: 'स्थिती पुन्हा तपासा',
    needHelp: 'मदत हवी? support@swasthlink.in वर सपोर्टशी संपर्क साधा'
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
    required: 'आवश्यक',
    optional: 'पर्यायी',
    pleaseSelect: 'कृपया निवडा',
    enterValue: 'मूल्य प्रविष्ट करा',
    invalidFormat: 'अवैध स्वरूप',
    fieldRequired: 'हे फील्ड आवश्यक आहे'
  }
}