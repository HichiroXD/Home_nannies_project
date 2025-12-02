# Phase 3: Integraciones Reales y OCR Productivo

**Estado**: 🔄 En Desarrollo  
**Versión**: 3.0.0-alpha  
**Última Actualización**: 2024  

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura Phase 3](#arquitectura-phase-3)
3. [Dependencias Nuevas](#dependencias-nuevas)
4. [Componentes a Desarrollar](#componentes-a-desarrollar)
5. [Endpoints Nuevos](#endpoints-nuevos)
6. [Frontend Changes](#frontend-changes)
7. [Flujo de Datos](#flujo-de-datos)
8. [Cronograma](#cronograma)

---

## Visión General

Phase 3 transforma las simulaciones Phase 2 en integraciones productivas reales:

| Componente | Phase 2 | Phase 3 |
|---|---|---|
| **OCR** | Simulado (fake RUT extraction) | ✅ Real (pytesseract) |
| **Academic** | Simulado (fake query) | ✅ Real (API institution) |
| **Notifications** | ❌ None | ✅ Email + Webhooks |
| **Frontend** | ❌ API only | ✅ React upload component |
| **Reports** | ❌ None | ✅ Admin dashboard |

---

## Arquitectura Phase 3

### Backend Stack

```
Django 5.2.6 (Core)
├── core/
│   ├── models.py (updated) → Notification preferences
│   ├── views.py (updated) → Real implementations
│   ├── urls.py (updated) → /reports/, /notifications/
│   ├── ocr_processor.py (NEW) → pytesseract integration
│   ├── notifications.py (NEW) → Email/Webhook system
│   ├── academic_api.py (NEW) → Real institution API
│   ├── reports.py (NEW) → Analytics engine
│   └── tests.py (updated) → Phase 3 test suite
├── celery/ (OPTIONAL)
│   └── tasks.py → Async OCR processing
└── logs/
    └── phase3.log → OCR, notification events
```

### Frontend Stack

```
React/Vite
├── src/
│   ├── api/
│   │   ├── ocrApi.js (NEW) → Upload, status polling
│   │   └── reportApi.js (NEW) → Fetch reports
│   ├── components/
│   │   ├── OCRUpload.jsx (NEW) → Document upload UI
│   │   ├── OCRStatus.jsx (NEW) → Processing status
│   │   ├── AdminReports.jsx (NEW) → Reports dashboard
│   │   └── NotificationPreferences.jsx (NEW) → Notification settings
│   └── views/
│       ├── OCRUploadPage.jsx (NEW)
│       └── AdminReportsPage.jsx (NEW)
```

---

## Dependencias Nuevas

### Backend Python

```
# Instalación:
pip install pytesseract pillow pdf2image python-magic

# requirements.txt additions:
pytesseract==0.3.12          # OCR wrapper for Tesseract
pillow==11.0.0               # Image processing
pdf2image==1.17.0            # PDF to image conversion
python-magic==0.4.27         # File type detection
django-celery-beat==2.5.0    # Async task scheduling (OPTIONAL)
python-dotenv==1.0.0         # Environment variables for API keys
```

### System Dependencies (Linux/Mac/Windows)

```bash
# Ubuntu/Debian:
sudo apt-get install tesseract-ocr libmagic1

# macOS:
brew install tesseract libmagic

# Windows (via Chocolatey):
choco install tesseract libmagic

# Or manually download from:
# https://github.com/UB-Mannheim/tesseract/wiki
```

### Frontend

```
# No new dependencies (uses existing axios, React)
```

---

## Componentes a Desarrollar

### 1. `core/ocr_processor.py` (NEW)

**Responsabilidad**: Procesar documentos reales con pytesseract

```python
# Core Functions:
- extract_text_from_image(image_file) → Dict[rut, text]
- extract_text_from_pdf(pdf_file) → Dict[pages, texts]
- validate_ocr_confidence(text, confidence_threshold=0.8) → Bool
- clean_ocr_text(raw_text) → str
- extract_rut_from_text(text) → Optional[str]
```

**Cambios vs Phase 2**:
```python
# Phase 2:
def _process_ocr_simulated(self):
    return {"rut": "12345678-9", "status": "completed"}

# Phase 3:
def _process_ocr_real(self):
    # 1. Validate file format (PDF or image)
    # 2. Convert PDF to images if needed (pdf2image)
    # 3. Run pytesseract.image_to_string()
    # 4. Extract RUT using regex
    # 5. Validate confidence score
    # 6. Save raw OCR text to OCRExtraction model
    # 7. Return structured result
```

**Error Handling**:
- File corruption → OCRValidationError
- Low confidence → OCRConfidenceError
- RUT not found → OCRRUTExtractionError

---

### 2. `core/notifications.py` (NEW)

**Responsabilidad**: Email + Webhook notifications

```python
# Core Classes:
class EmailNotification:
    - send_document_approved(user_email, document_type)
    - send_document_rejected(user_email, rejection_reason)
    - send_ocr_processing_started(user_email, document_id)
    - send_ocr_processing_failed(user_email, error_message)

class WebhookNotification:
    - trigger_webhook(event_type, payload)
    - validate_webhook_url(url) → Bool
    - retry_failed_webhook(webhook_id, max_retries=3)

# Helper Functions:
class NotificationService:
    - get_notification_preferences(user_id) → Dict
    - update_notification_preferences(user_id, settings)
    - log_notification_event(event_type, user_id, status)
```

**Models Extension** (in models.py):
```python
class NotificationPreferences(models.Model):
    user = OneToOneField(User)
    email_on_document_approved = BooleanField(default=True)
    email_on_document_rejected = BooleanField(default=True)
    email_on_ocr_processing = BooleanField(default=False)
    webhook_url = URLField(null=True, blank=True)
    webhook_active = BooleanField(default=False)

class NotificationLog(models.Model):
    user = ForeignKey(User)
    event_type = CharField(choices=EVENT_TYPES)
    status = CharField(choices=['sent', 'failed', 'pending'])
    created_at = DateTimeField(auto_now_add=True)
```

**Email Template** (templates/):
```
notifications/
├── document_approved.html
├── document_rejected.html
├── ocr_processing_started.html
└── ocr_processing_failed.html
```

---

### 3. `core/academic_api.py` (NEW)

**Responsabilidad**: Integración con sistema académico real

```python
# Real Integration Options:
class AcademicAPIAdapter:
    """
    Abstract class for different institutional APIs:
    - Universidad de Chile (SIES)
    - Pontificia Universidad Católica (PUC)
    - Universidad de Concepción
    - etc.
    """
    
    def verify_student(rut: str) -> Dict:
        """
        Returns:
        {
            "is_student": bool,
            "program": str,
            "year": int,
            "institution": str,
            "last_updated": datetime,
            "verified_at": datetime
        }
        """
        pass
    
    def get_programs() -> List[Program]:
        pass

# Concrete Implementation Example:
class SIESAPIAdapter(AcademicAPIAdapter):
    """Adapter para sistema SIES (Ministry of Education)"""
    
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url  # https://api.sies.cl/
    
    def verify_student(rut: str) -> Dict:
        # Llamar a SIES API con RUT
        # Validar token JWT
        # Parsear respuesta
        pass

# Phase 2 vs Phase 3:
# Phase 2:
def _simulate_academic_system_query(rut):
    return {"is_student": True, "program": "Engineering"}

# Phase 3:
def _query_academic_system_real(rut):
    adapter = SIESAPIAdapter(api_key=settings.SIES_API_KEY)
    return adapter.verify_student(rut)
```

**Environment Variables** (settings.py):
```python
# .env
SIES_API_KEY=xxx
SIES_BASE_URL=https://api.sies.cl/
SIES_TIMEOUT=10
ACADEMIC_API_PROVIDER=sies  # Options: sies, puc, custom
```

---

### 4. `core/reports.py` (NEW)

**Responsabilidad**: Analytics y reportes para administradores

```python
class ReportingEngine:
    # Metrics
    def get_ocr_success_rate(date_range) → float
    def get_documents_processed(date_range) → int
    def get_verification_by_status() → Dict
    def get_avg_ocr_processing_time() → float
    
    # Detailed Reports
    def generate_daily_report(date) → PDF
    def generate_verification_report(date_range) → Excel
    def export_verified_students(date_range) → CSV

# API Endpoints:
GET /api/reports/metrics/ → {success_rate, processed_count, avg_time}
GET /api/reports/daily/?date=2024-01-15 → {processed, succeeded, failed}
POST /api/reports/export/?format=csv → Download CSV
GET /api/reports/verification-status/ → {pending, approved, rejected}
```

---

### 5. React Component: `OCRUpload.jsx` (NEW)

**Responsabilidad**: Upload de documentos + estado en tiempo real

```jsx
// Path: frontend_nannies/src/components/OCRUpload.jsx

<OCRUpload>
  - File input (PDF, JPG, PNG)
  - Drag & drop zone
  - Progress bar (upload + processing)
  - Real-time status updates (polling /ocr/document-status/)
  - Extracted RUT display
  - Error messages with retry option
</OCRUpload>

// API Calls:
POST /api/ocr/upload-document/
  - Request: FormData(file, document_type)
  - Response: {document_id, status, estimated_time}

GET /api/ocr/document-status/{document_id}/
  - Response: {status, progress, extracted_rut, error}

// Polling Strategy:
- Initial upload: 3 second intervals
- Processing: 5 second intervals (WebSocket optional for Phase 3.1)
- Completion: Stop polling, show result
```

---

## Endpoints Nuevos

### OCR Endpoints (Updated)

```
POST /api/ocr/upload-document/
├── PHASE 2: Retorna fake RUT
└── PHASE 3: Procesa real con pytesseract ✅

POST /api/ocr/extract-rut/
├── PHASE 2: Retorna fake RUT
└── PHASE 3: OCR real en documento ✅

GET /api/ocr/document-status/{id}/
├── PHASE 2: Retorna status simulado
└── PHASE 3: Status real + confidence ✅
```

### Notification Endpoints (NEW)

```
GET /api/notifications/preferences/
├── Retorna preferencias del usuario

PUT /api/notifications/preferences/
├── Actualiza email, webhook settings

GET /api/notifications/history/
├── Últimas notificaciones del usuario

POST /api/notifications/test/
├── Envía email de prueba
```

### Reporting Endpoints (NEW)

```
GET /api/reports/metrics/
├── {success_rate, total_processed, avg_time}

GET /api/reports/daily/?date=YYYY-MM-DD
├── Detalles de operaciones del día

GET /api/reports/documents/?status=pending
├── Lista documentos por estado

POST /api/reports/export/?format=csv|excel|pdf
├── Descarga reporte completo
```

### Academic API Endpoints (Updated)

```
POST /api/academic/verify/ (UPDATED)
├── PHASE 2: Retorna respuesta simulada
└── PHASE 3: Consulta SIES real ✅

GET /api/academic/programs/
├── Lista programas académicos válidos
```

---

## Frontend Changes

### New Pages

```
/ocr-upload
├── Upload UI + progress + results
├── Component: OCRUpload.jsx + OCRStatus.jsx

/admin/reports
├── Dashboard con métricas
├── Filtros por fecha, tipo
├── Export CSV/Excel
├── Component: AdminReports.jsx

/settings/notifications
├── Preferencias de notificación
├── URL webhook
├── Component: NotificationPreferences.jsx
```

### Updated Pages

```
/dashboard
├── Agregar widget "OCR Processing" (recent uploads)

/verify-identity
├── Integrar OCRUpload component
├── Mostrar resultado OCR
```

---

## Flujo de Datos

### 1. OCR Document Upload Flow

```
USER FRONTEND                       BACKEND
    │                                  │
    ├─ Upload file (PDF/JPG)  ─────→ POST /ocr/upload/
    │                                  │
    │                          ┌─ Validate file type
    │                          ├─ Store in temporary location
    │                          ├─ Send notification "processing_started"
    │                          └─ Return {document_id, status: processing}
    │
    ├─ Show progress bar
    ├─ Poll status every 3s ─────→ GET /ocr/document-status/{id}
    │                                  │
    │                          ┌─ Load document
    │                          ├─ Convert PDF→images (pdf2image)
    │                          ├─ Extract text (pytesseract)
    │                          ├─ Extract RUT (regex)
    │                          ├─ Validate confidence
    │                          ├─ Save OCRExtraction model
    │                          ├─ Send notification "completed/failed"
    │                          └─ Return {status: completed, rut: XXX}
    │
    ├─ Display extracted RUT
    └─ Enable "Confirm" button → POST /verify/student/
```

### 2. Notification Flow

```
BACKEND EVENT               NOTIFICATION SYSTEM
    │                            │
    ├─ Document uploaded  ─────→ Check NotificationPreferences
    │                            │
    │                        ┌─ Email enabled?
    │                        ├─ Send email via Django mail
    │                        │
    │                        ├─ Webhook enabled?
    │                        └─ POST to webhook URL (async)
    │
    └─ Log event in NotificationLog
```

### 3. Academic Verification Flow

```
BACKEND VERIFICATION            SIES/ACADEMIC API
    │                                  │
    ├─ Receive RUT  ─────────────────→ GET /students/{rut}/
    │                                  │
    │                          ┌─ Validate RUT format
    │                          ├─ Check student record
    │                          ├─ Return {is_student, program, year}
    │                          └─ Response JSON
    │
    ├─ Parse response
    ├─ Save to AcademicIntegration
    ├─ Update StudentVerification.verified_academic
    └─ Return result to frontend
```

---

## Cronograma

### Task Breakdown (9 Tasks × 5h avg = 45 horas total)

| Task | Descripción | Horas | Dependencies |
|---|---|---|---|
| **1** | 📋 Especificaciones Phase 3 | 3 | ✓ Complete |
| **2** | 📦 Install OCR dependencies | 1 | Task 1 |
| **3** | 🔍 Pytesseract integration | 8 | Task 2 |
| **4** | 🎨 Frontend OCR upload component | 6 | Tasks 1, 3 |
| **5** | 📧 Notifications system | 5 | Tasks 1, 3 |
| **6** | 🎓 Academic API integration | 6 | Tasks 1, 3 |
| **7** | 📊 Reports & analytics | 5 | Tasks 1, 3 |
| **8** | ✅ Phase 3 tests (coverage 80%) | 7 | Tasks 3-7 |
| **9** | 🚀 Deployment & docs | 3 | Tasks 1-8 |
| | **TOTAL** | **44 horas** | |

### Estimated Timeline

```
Week 1:
├─ Tasks 1-2 (Specs + Dependencies)
├─ Task 3 (OCR Implementation) - 40% done
└─ Setup testing environment

Week 2:
├─ Task 3 (OCR) - Complete
├─ Task 4 (Frontend) - 50% done
├─ Task 5 (Notifications) - Start
└─ First integration tests

Week 3:
├─ Task 4-5: Complete
├─ Task 6 (Academic API) - In progress
├─ Task 7 (Reports) - Start
└─ MVP ready for testing

Week 4-5:
├─ Task 6-7: Complete
├─ Task 8 (Tests) - Full coverage
├─ Task 9 (Deployment docs)
└─ Phase 3 Release Candidate
```

---

## QA / Testing Strategy

### Unit Tests (pytesseract, validators)
```python
test_extract_text_from_image()
test_extract_text_from_pdf()
test_extract_rut_from_text()
test_notification_email_sent()
test_webhook_retry_logic()
test_academic_api_adapter()
```

### Integration Tests
```python
test_ocr_upload_to_db()
test_notification_chain()
test_academic_verification_full_flow()
test_report_generation()
```

### Frontend Tests (Jest/React Testing Library)
```javascript
test('OCRUpload handles file drop', ...)
test('Status polling updates correctly', ...)
test('Error messages display', ...)
test('Admin report filters work', ...)
```

### Load Testing
```
# Simulate concurrent OCR uploads
- 10 concurrent uploads → measure processing time
- 100 emails/min notification throughput
```

---

## Error Handling & Logging

### Logging Strategy

```python
# logs/phase3.log structure:
[2024-01-15 10:30:45] OCR UPLOAD: document_id=123, user_id=456
[2024-01-15 10:30:50] OCR PROCESSING: document_id=123, status=started
[2024-01-15 10:31:05] OCR SUCCESS: document_id=123, confidence=0.92, rut=12345678-9
[2024-01-15 10:31:06] NOTIFICATION SENT: event_type=document_completed, email=user@example.com
```

### Error Scenarios

| Error | Cause | Handling |
|---|---|---|
| File corruption | Invalid PDF/image | Return HTTP 400, log error |
| OCR timeout | Large document | Async task + email notification |
| Low confidence | Blurry/poor quality | Flag for manual review |
| RUT not found | No ID visible | Reject + guide user |
| SIES API timeout | Network issue | Retry 3x with exponential backoff |
| Webhook failure | Invalid URL | Log + retry hourly for 24h |

---

## Notas de Implementación

### ⚠️ Important Considerations

1. **Tesseract Installation**: Required system package, not just Python pip
2. **PDF Handling**: Use pdf2image + pytesseract (better than pdfplumber for OCR)
3. **File Security**: Validate file types, scan for malware (ClamAV optional)
4. **Privacy**: Encrypt stored images, logs contain only RUT hash
5. **Performance**: Consider Celery for async OCR (large files > 5MB)
6. **API Keys**: Use environment variables, never commit to git
7. **Rate Limiting**: Add rate limits on /ocr/upload/ endpoint

### Opcional para Phase 3.1

```
- WebSocket para real-time status (vs polling)
- Tesseract language packs optimization
- Multiple language support
- Document angle detection/rotation
- Cloud OCR providers (AWS Textract, Google Vision)
```

---

**Siguientes Pasos**: Proceder con Task 2 - Install OCR Dependencies

