# تعليمات تشغيل Backend

## الخطوة 0: متطلبات النظام
- Python 3.11+
- Maven (للـ Java Backend)
- MySQL Server

## الخطوة 1: تشغيل Python AI Service (الخدمة الرئيسية)

من مجلد المشروع الرئيسي (`d:\Stage_IA`):

### تشغيل بدون Hot Reload (الإنتاج)
```powershell
cd d:\Stage_IA
python start_backend.py --host 127.0.0.1 --port 8000
```

### تشغيل مع Hot Reload (التطوير)
```powershell
cd d:\Stage_IA
python start_backend.py --host 127.0.0.1 --port 8000 --reload
```

الخدمة ستكون متاحة على: `http://127.0.0.1:8000`
- OpenAPI Docs: `http://127.0.0.1:8000/docs`
- API endpoints: `/api/v1/analyze`, `/api/v1/chat`

### التحقق من تشغيل الخدمة
```powershell
$health = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/health'
Write-Host "Status: $($health.status)"
```

---

## الخطوة 2: تأكد من تثبيت Maven (اختياري - للـ Java Backend)
تحقق من تثبيت Maven على جهازك عن طريق تشغيل الأمر التالي في PowerShell:
```powershell
mvn --version
```

إذا لم يكن Maven مثبتاً، قم بتثبيته من: https://maven.apache.org/download.cgi

## الخطوة 3: تشغيل Java Backend (اختياري)

### الطريقة 1: باستخدام Maven (الموصى بها)
افتح PowerShell وانتقل إلى مجلد Backend:
```powershell
cd d:\Stage_IA\Backend_IA
mvn spring-boot:run
```

### الطريقة 2: باستخدام IDE (IntelliJ IDEA أو Eclipse)
1. افتح المشروع في IntelliJ IDEA أو Eclipse
2. ابحث عن الملف الرئيسي: `src/main/java/com/copilot/rssi/RssiApplication.java`
3. انقر بزر الماوس الأيمن على الملف واختر "Run 'RssiApplication'"

## الخطوة 4: التحقق من تشغيل Backend
بعد التشغيل، سترى رسالة مثل:
```
Started RssiApplication in X.XXX seconds
```

يمكنك أيضاً التحقق من تشغيل Backend عن طريق فتح المتصفح على:
http://localhost:8080/api/health

## الخطوة 5: تشغيل Frontend
افتح PowerShell جديد وانتقل إلى مجلد Frontend:
```powershell
cd d:\Stage_IA\Frontend_IA
npm run dev
```

## الخطوة 6: الوصول إلى التطبيق
افتح المتصفح على:
http://localhost:5173

## بيانات تسجيل الدخول الافتراضية

### حساب Admin
- المستخدم: `admin`
- كلمة المرور: `admin123`

### حساب RSSI
- المستخدم: `rssi`
- كلمة المرور: `rssi123`

## حل المشاكل الشائعة

### مشكلة IA Service: `ModuleNotFoundError: No module named 'app'`
**الحل:** تأكد من تشغيل الخدمة باستخدام `start_backend.py` من مجلد المشروع الرئيسي:
```powershell
cd d:\Stage_IA
python start_backend.py
```

### المشكلة: صفحة بيضاء بعد تسجيل الدخول
**الحل:** تأكد من أن Backend يعمل على http://localhost:8080

### المشكلة: خطأ اتصال
**الحل:** تحقق من أن Backend يعمل وأن المنفذ 8080 غير مستخدم من قبل تطبيق آخر

### المشكلة: خطأ في قاعدة البيانات
**الحل:** تأكد من أن MySQL يعمل وأن قاعدة البيانات `copilot_rssi` موجودة
