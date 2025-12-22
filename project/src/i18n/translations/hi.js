export const hi = {
  // Common
  common: {
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सेव करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    search: 'खोजें',
    filter: 'फिल्टर',
    clear: 'साफ करें',
    close: 'बंद करें',
    open: 'खोलें',
    yes: 'हां',
    no: 'नहीं',
    ok: 'ठीक है',
    retry: 'पुनः प्रयास',
    refresh: 'रिफ्रेश',
    upload: 'अपलोड',
    viewAll: 'सभी देखें',
    more: 'और',
    step: 'चरण',
    of: 'का',
    submitting: 'जमा हो रहा है...',
    backToHome: 'होम पर वापस जाएं'
  },

  // App
  app: {
    name: 'स्वास्थ्यलिंक',
    tagline: 'ग्रामीण स्वास्थ्य सेवा के लिए टेलीमेडिसिन प्लेटफॉर्म',
    welcome: 'स्वास्थ्यलिंक में आपका स्वागत है',
    description: 'आपका स्वास्थ्य कनेक्शन, कम बैंडविड्थ नेटवर्क के लिए अनुकूलित।'
  },

  // Navigation
  nav: {
    home: 'होम',
    dashboard: 'डैशबोर्ड',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    register: 'पंजीकरण'
  },

  // Authentication
  auth: {
    login: 'लॉगिन',
    register: 'पंजीकरण',
    logout: 'लॉगआउट',
    phone: 'फोन नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    rememberMe: 'मुझे याद रखें',
    loginSuccess: 'लॉगिन सफल',
    loginError: 'लॉगिन असफल। कृपया पुनः प्रयास करें।',
    registerSuccess: 'पंजीकरण सफल',
    registerError: 'पंजीकरण असफल। कृपया पुनः प्रयास करें।',
    invalidCredentials: 'अमान्य क्रेडेंशियल',
    phoneRequired: 'फोन नंबर आवश्यक है',
    passwordRequired: 'पासवर्ड आवश्यक है',
    selectRole: 'अपनी भूमिका चुनें:',
    patientLogin: 'मरीज़ लॉगिन',
    providerLogin: 'स्वास्थ्य सेवा प्रदाता लॉगिन',
    newPatient: 'नए मरीज़?',
    registerHere: 'यहाँ पंजीकरण करें',
    alreadyHaveAccount: 'पहले से खाता है?',
    loginHere: 'यहाँ लॉगिन करें'
  },

  // User Roles
  roles: {
    patient: 'मरीज़',
    doctor: 'डॉक्टर',
    hospital: 'अस्पताल एडमिन',
    admin: 'सुपर एडमिन'
  },

  // Patient
  patient: {
    dashboard: 'मरीज़ डैशबोर्ड',
    register: 'मरीज़ पंजीकरण',
    findDoctors: 'डॉक्टर खोजें',
    myAppointments: 'मेरी अपॉइंटमेंट्स',
    healthRecords: 'स्वास्थ्य रिकॉर्ड',
    quickActions: 'त्वरित कार्य',
    searchDoctors: 'अपने पास के डॉक्टर खोजें',
    viewAppointments: 'आगामी परामर्श देखें',
    viewRecords: 'अपना मेडिकल इतिहास देखें',
    fullName: 'पूरा नाम',
    preferredLanguage: 'पसंदीदा भाषा',
    createAccount: 'अपना स्वास्थ्यलिंक खाता बनाएं',
    nearbyHospitals: 'नजदीकी अस्पताल',
    doctorsAvailable: 'डॉक्टर उपलब्ध',
    viewDoctors: 'डॉक्टर देखें',
    healthCommunity: 'स्वास्थ्य समुदाय',
    joinHealthGroups: 'स्वास्थ्य समूहों में शामिल हों और समान स्वास्थ्य यात्रा पर अन्य लोगों से जुड़ें',
    healthTips: "आज की स्वास्थ्य सुझाव"
  },

  // Doctor
  doctor: {
    dashboard: 'डॉक्टर डैशबोर्ड',
    register: 'डॉक्टर पंजीकरण',
    todaysAppointments: 'आज की अपॉइंटमेंट्स',
    patientRecords: 'मरीज़ रिकॉर्ड',
    prescriptions: 'नुस्खे',
    manageConsultations: 'अपने परामर्श प्रबंधित करें',
    accessEMR: 'EMR और इतिहास तक पहुंच',
    managePrescriptions: 'नुस्खे बनाएं और प्रबंधित करें',
    doctorKey: 'डॉक्टर की',
    enterKey: 'अपनी की दर्ज करें'
  },

  // Hospital
  hospital: {
    dashboard: 'अस्पताल डैशबोर्ड',
    register: {
      title: 'अस्पताल पंजीकरण',
      selectType: 'अस्पताल का प्रकार चुनें',
      selectTypeDesc: 'आप जिस प्रकार का अस्पताल पंजीकृत करना चाहते हैं उसे चुनें',
      government: 'सरकारी अस्पताल',
      governmentDesc: 'सरकार द्वारा वित्त पोषित सार्वजनिक स्वास्थ्य संस्थान',
      private: 'निजी अस्पताल',
      privateDesc: 'निजी स्वास्थ्य संस्थान और क्लिनिक',
      basicInfo: 'बुनियादी जानकारी',
      govBasicInfoDesc: 'अपने सरकारी अस्पताल का विवरण दर्ज करें',
      privateBasicInfoDesc: 'अपने निजी अस्पताल का विवरण दर्ज करें',
      hospitalName: 'अस्पताल का नाम',
      phone: 'फोन नंबर',
      address: 'पता',
      city: 'शहर',
      state: 'राज्य',
      pincode: 'पिन कोड',
      email: 'आधिकारिक ईमेल',
      website: 'वेबसाइट',
      hospitalId: 'अस्पताल आईडी',
      registrationNumber: 'पंजीकरण संख्या',
      gstNumber: 'जीएसटी संख्या',
      panNumber: 'पैन संख्या',
      licenseNumber: 'लाइसेंस संख्या',
      documents: 'दस्तावेज़',
      documentsDesc: 'सत्यापन के लिए आवश्यक दस्तावेज़ अपलोड करें',
      registrationCertificate: 'पंजीकरण प्रमाणपत्र',
      hospitalIdDocument: 'अस्पताल आईडी दस्तावेज़',
      gstPanDocument: 'जीएसटी/पैन दस्तावेज़',
      licenseDocument: 'लाइसेंस दस्तावेज़',
      documentRequirements: 'दस्तावेज़ आवश्यकताएं',
      docReq1: 'फाइलें PDF, JPG, या PNG प्रारूप में होनी चाहिए',
      docReq2: 'अधिकतम फाइल आकार: प्रति दस्तावेज़ 5MB',
      docReq3: 'दस्तावेज़ स्पष्ट और पढ़ने योग्य होने चाहिए',
      review: 'समीक्षा और जमा करें',
      reviewDesc: 'कृपया जमा करने से पहले अपनी जानकारी की समीक्षा करें',
      hospitalType: 'अस्पताल का प्रकार',
      reviewWarning: 'कृपया सुनिश्चित करें कि सभी जानकारी सटीक है। जमा करने के बाद परिवर्तन के लिए पुन: सत्यापन की आवश्यकता होगी।',
      submitted: 'पंजीकरण जमा किया गया!',
      submittedDesc: 'आपका अस्पताल पंजीकरण समीक्षा के लिए जमा किया गया है।',
      nextSteps: 'आगे क्या होगा?',
      nextStep1: 'हमारी टीम 2-3 कार्य दिवसों में आपके दस्तावेजों की समीक्षा करेगी',
      nextStep2: 'आपको स्थिति के बारे में ईमेल सूचना मिलेगी',
      nextStep3: 'अनुमोदन के बाद, आपको प्लेटफॉर्म तक पहुंचने के लिए अपनी अस्पताल की मिलेगी',
      success: 'अस्पताल पंजीकरण सफलतापूर्वक जमा किया गया!',
      errors: {
        typeRequired: 'कृपया अस्पताल का प्रकार चुनें',
        nameRequired: 'अस्पताल का नाम आवश्यक है',
        addressRequired: 'पता आवश्यक है',
        cityRequired: 'शहर आवश्यक है',
        stateRequired: 'राज्य आवश्यक है',
        invalidPincode: 'कृपया एक वैध पिन कोड दर्ज करें',
        invalidPhone: 'कृपया एक वैध फोन नंबर दर्ज करें',
        invalidEmail: 'कृपया एक वैध ईमेल पता दर्ज करें',
        hospitalIdRequired: 'अस्पताल आईडी आवश्यक है',
        registrationNumberRequired: 'पंजीकरण संख्या आवश्यक है',
        invalidGST: 'कृपया एक वैध जीएसटी संख्या दर्ज करें',
        invalidPAN: 'कृपया एक वैध पैन संख्या दर्ज करें',
        licenseRequired: 'लाइसेंस संख्या आवश्यक है',
        registrationCertRequired: 'पंजीकरण प्रमाणपत्र आवश्यक है',
        hospitalIdDocRequired: 'अस्पताल आईडी दस्तावेज़ आवश्यक है',
        gstPanDocRequired: 'जीएसटी/पैन दस्तावेज़ आवश्यक है',
        licenseDocRequired: 'लाइसेंस दस्तावेज़ आवश्यक है',
        submitFailed: 'पंजीकरण जमा करने में विफल। कृपया पुनः प्रयास करें।'
      }
    },
    doctorRequests: 'डॉक्टर अनुरोध',
    hospitalDoctors: 'अस्पताल के डॉक्टर',
    hospitalProfile: 'अस्पताल प्रोफाइल',
    reviewRequests: 'लंबित डॉक्टर आवेदनों की समीक्षा करें',
    manageDoctors: 'अपने मेडिकल स्टाफ का प्रबंधन करें',
    editProfile: 'अस्पताल की जानकारी अपडेट करें',
    hospitalKey: 'अस्पताल की'
  },

  // Admin
  admin: {
    // Login
    loginTitle: 'सुपर एडमिनिस्ट्रेटर लॉगिन',
    loginSubtitle: 'प्लेटफॉर्म प्रशासन के लिए सुरक्षित पहुंच',
    adminKey: 'एडमिन की',
    adminKeyPlaceholder: 'अपनी एडमिन की दर्ज करें',
    loginButton: 'एडमिन के रूप में लॉगिन करें',
    loginSuccess: 'एडमिन लॉगिन सफल',
    loginError: 'अमान्य एडमिन क्रेडेंशियल',
    securityNote: 'सुरक्षा नोट',
    securityMessage: 'एडमिन पहुंच को सुरक्षा उद्देश्यों के लिए लॉग और मॉनिटर किया जाता है।',
    backToLogin: 'लॉगिन पर वापस जाएं',

    // Dashboard
    dashboardTitle: 'सुपर एडमिनिस्ट्रेटर डैशबोर्ड',
    welcomeMessage: 'स्वागत है, {name}',
    platformOverview: 'प्लेटफॉर्म अवलोकन',
    
    // Metrics
    hospitals: 'अस्पताल',
    doctors: 'डॉक्टर',
    patients: 'मरीज़',
    consultations: 'परामर्श',
    verified: 'सत्यापित',
    pending: 'लंबित',
    active: 'सक्रिय',
    thisMonth: 'इस महीने',
    completed: 'पूर्ण',

    // Verification Queue
    verificationQueue: 'सत्यापन कतार',
    hospitalVerifications: 'अस्पताल सत्यापन',
    hospitalVerificationDesc: 'अस्पताल पंजीकरण आवेदनों की समीक्षा करें',
    doctorVerifications: 'डॉक्टर सत्यापन',
    doctorVerificationDesc: 'डॉक्टर पंजीकरण आवेदनों की समीक्षा करें',
    flaggedAccounts: 'फ्लैग किए गए खाते',
    flaggedAccountsDesc: 'संदिग्ध गतिविधि के लिए फ्लैग किए गए खातों की समीक्षा करें',
    reviewHospitals: 'अस्पतालों की समीक्षा करें',
    reviewDoctors: 'डॉक्टरों की समीक्षा करें',
    reviewFlagged: 'फ्लैग किए गए की समीक्षा करें',

    // System Health
    systemHealth: 'सिस्टम स्वास्थ्य और निगरानी',
    uptime: 'अपटाइम',
    responseTime: 'प्रतिक्रिया समय',
    errorRate: 'त्रुटि दर',
    activeUsers: 'सक्रिय उपयोगकर्ता',
    last30Days: 'पिछले 30 दिन',
    average: 'औसत',
    last24Hours: 'पिछले 24 घंटे',
    currentlyOnline: 'वर्तमान में ऑनलाइन',

    // Quick Actions
    quickActions: 'त्वरित कार्य',
    platformLogs: 'प्लेटफॉर्म लॉग्स',
    platformLogsDesc: 'सिस्टम लॉग्स और गतिविधि निगरानी देखें',
    bulkOperations: 'बल्क ऑपरेशन',
    bulkOperationsDesc: 'बल्क सत्यापन और प्रबंधन कार्य करें',
    systemSettings: 'सिस्टम सेटिंग्स',
    systemSettingsDesc: 'प्लेटफॉर्म सेटिंग्स और पैरामीटर कॉन्फ़िगर करें',
    viewLogs: 'लॉग्स देखें',
    manageBulk: 'बल्क प्रबंधित करें',
    manageSettings: 'सेटिंग्स प्रबंधित करें',

    // Validation
    adminKeyRequired: 'एडमिन की आवश्यक है',
    adminKeyTooShort: 'एडमिन की कम से कम 8 अक्षर की होनी चाहिए',

    // Verify Entities
    verifyEntities: 'संस्थाओं को सत्यापित करें',
    verifyEntitiesDesc: 'अस्पताल और डॉक्टर पंजीकरण की समीक्षा और अनुमोदन करें',
    searchEntities: 'नाम, फोन, ईमेल या लाइसेंस द्वारा संस्थाओं को खोजें...',
    allStatuses: 'सभी स्थितियां',
    noEntitiesFound: 'आपके मानदंडों से मेल खाने वाली कोई संस्था नहीं मिली',
    entityDetails: 'संस्था विवरण',
    basicInfo: 'बुनियादी जानकारी',
    documents: 'दस्तावेज़',
    reviewNotes: 'समीक्षा टिप्पणियां',
    reviewNotesPlaceholder: 'अपने निर्णय के बारे में टिप्पणियां जोड़ें...',
    reviewedBy: 'द्वारा समीक्षित',
    selectEntityToReview: 'विवरण देखने के लिए एक संस्था चुनें',
    approve: 'अनुमोदित करें',
    reject: 'अस्वीकार करें',
    viewDoc: 'देखें',
    regNumber: 'पंजीकरण संख्या',
    license: 'लाइसेंस',
    submitted: 'जमा किया गया',
    type: 'प्रकार',
    specialization: 'विशेषज्ञता',
    experience: 'अनुभव',
    qualifications: 'योग्यताएं',
    practiceType: 'अभ्यास प्रकार',
    requestedHospital: 'अनुरोधित अस्पताल',
    gstNumber: 'जीएसटी संख्या',
    panNumber: 'पैन संख्या',
    independent: 'स्वतंत्र',
    clinic: 'क्लिनिक-आधारित',
    hospital: 'अस्पताल',
    doctor: 'डॉक्टर',
    approveSuccess: '{type} {name} सफलतापूर्वक अनुमोदित',
    rejectSuccess: '{type} {name} सफलतापूर्वक अस्वीकृत',
    approveError: 'संस्था को अनुमोदित करने में विफल',
    rejectError: 'संस्था को अस्वीकार करने में विफल',
    reviewNotesRequired: 'अस्वीकृति के लिए समीक्षा टिप्पणियां आवश्यक हैं',
    status: {
      pending: 'लंबित',
      approved: 'अनुमोदित',
      rejected: 'अस्वीकृत'
    },

    // Verification Queue
    verificationQueueDesc: 'बल्क सत्यापन संचालन और कतार प्रसंस्करण का प्रबंधन करें',
    totalPending: 'कुल लंबित',
    autoVerifiable: 'स्वतः सत्यापन योग्य',
    highPriority: 'उच्च प्राथमिकता',
    highRisk: 'उच्च जोखिम',
    filterByType: 'प्रकार के अनुसार फिल्टर करें',
    allTypes: 'सभी प्रकार',
    sortBy: 'इसके अनुसार क्रमबद्ध करें',
    submissionDate: 'जमा करने की तारीख',
    priority: 'प्राथमिकता',
    riskScore: 'जोखिम स्कोर',
    name: 'नाम',
    autoVerify: 'स्वतः सत्यापित करें',
    bulkApprove: 'बल्क अनुमोदन',
    bulkReject: 'बल्क अस्वीकार',
    entity: 'संस्था',
    submitted: 'जमा किया गया',
    risk: 'जोखिम',
    actions: 'कार्य',
    review: 'समीक्षा',
    docsComplete: 'दस्तावेज़ पूर्ण',
    docsIncomplete: 'दस्तावेज़ अधूरे',
    noItemsInQueue: 'सत्यापन कतार में कोई आइटम नहीं',
    noItemsSelected: 'बल्क ऑपरेशन के लिए कोई आइटम चयनित नहीं',
    bulkApproveSuccess: '{count} आइटम सफलतापूर्वक अनुमोदित',
    bulkRejectSuccess: '{count} आइटम सफलतापूर्वक अस्वीकृत',
    bulkApproveError: 'बल्क अनुमोदन करने में विफल',
    bulkRejectError: 'बल्क अस्वीकार करने में विफल',
    noAutoVerifiableItems: 'स्वतः सत्यापन के लिए कोई आइटम उपलब्ध नहीं',
    autoVerifySuccess: '{count} आइटम स्वतः सत्यापित सफलतापूर्वक',
    autoVerifyError: 'स्वतः सत्यापन करने में विफल',
    priority: {
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कम'
    },
    risk: {
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कम'
    },

    // Logs
    platformLogsDesc: 'सिस्टम गतिविधियों की निगरानी करें और प्लेटफॉर्म इवेंट्स को ट्रैक करें',
    totalLogs: 'कुल लॉग्स',
    errors: 'त्रुटियां',
    warnings: 'चेतावनियां',
    securityEvents: 'सुरक्षा घटनाएं',
    searchLogs: 'संदेश, कार्य, उपयोगकर्ता या IP द्वारा लॉग्स खोजें...',
    allLevels: 'सभी स्तर',
    allCategories: 'सभी श्रेणियां',
    allTime: 'सभी समय',
    today: 'आज',
    thisWeek: 'इस सप्ताह',
    thisMonth: 'इस महीने',
    timestamp: 'टाइमस्टैम्प',
    level: 'स्तर',
    category: 'श्रेणी',
    message: 'संदेश',
    user: 'उपयोगकर्ता',
    ipAddress: 'IP पता',
    noLogsFound: 'आपके मानदंडों से मेल खाने वाले कोई लॉग्स नहीं मिले',
    showingLogs: '{total} में से {start} से {end} तक लॉग्स दिखा रहे हैं',
    logLevel: {
      info: 'जानकारी',
      warning: 'चेतावनी',
      error: 'त्रुटि',
      critical: 'गंभीर'
    },
    logCategory: {
      authentication: 'प्रमाणीकरण',
      verification: 'सत्यापन',
      system: 'सिस्टम',
      consultation: 'परामर्श',
      security: 'सुरक्षा',
      registration: 'पंजीकरण',
      performance: 'प्रदर्शन'
    }
  },

  // Network Status
  network: {
    offline: 'आप ऑफलाइन हैं। कनेक्शन बहाल होने पर डेटा सिंक हो जाएगा।',
    slowConnection: 'धीमा कनेक्शन मिला। कम बैंडविड्थ के लिए अनुकूलित कर रहे हैं।',
    syncing: 'सिंक हो रहा है',
    items: 'आइटम',
    itemsFailed: 'आइटम सिंक नहीं हो सके',
    networkStatus: 'नेटवर्क स्थिति:',
    online: 'ऑनलाइन',
    speed: 'गति'
  },

  // Errors
  errors: {
    accessDenied: 'पहुंच अस्वीकृत',
    noPermission: 'आपको इस पेज तक पहुंचने की अनुमति नहीं है। कृपया अपनी भूमिका जांचें और पुनः प्रयास करें।',
    pageNotFound: 'पेज नहीं मिला',
    goHome: 'होम पर जाएं',
    logoutAndLogin: 'लॉगआउट करें और फिर से लॉगिन करें',
    verificationPending: 'सत्यापन लंबित',
    accountPending: 'आपका खाता सत्यापन के लिए लंबित है। कृपया अनुमोदन की प्रतीक्षा करें।',
    doctorVerificationMessage: 'आपके डॉक्टर पंजीकरण की समीक्षा की जा रही है। अस्पताल प्रशासन द्वारा आपकी साख सत्यापित होने के बाद आपको पहुंच मिल जाएगी।',
    hospitalVerificationMessage: 'आपके अस्पताल पंजीकरण की समीक्षा की जा रही है। प्लेटफॉर्म प्रशासकों द्वारा आपके दस्तावेज सत्यापित होने के बाद आपको पहुंच मिल जाएगी।',
    whatHappensNext: 'आगे क्या होता है?',
    checkStatusAgain: 'स्थिति फिर से जांचें',
    needHelp: 'सहायता चाहिए? support@swasthlink.in पर सहायता से संपर्क करें'
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
    optional: 'वैकल्पिक',
    pleaseSelect: 'कृपया चुनें',
    enterValue: 'मान दर्ज करें',
    invalidFormat: 'अमान्य प्रारूप',
    fieldRequired: 'यह फील्ड आवश्यक है'
  }
}