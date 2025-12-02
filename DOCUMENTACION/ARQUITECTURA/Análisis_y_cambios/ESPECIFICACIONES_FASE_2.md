# ESPECIFICACIONES FASE 2 - Validación por Documentos y OCR

## 📋 Objetivo General

Implementar validación automática de documentos mediante **OCR (Optical Character Recognition)**, procesamiento de certificados de matrícula y **validación con sistema académico**, asegurando que los datos del usuario coincidan con los registros institucionales.

**Estimación**: 40-48 horas

---

## 🎯 Funcionalidades Phase 2

### 1. OCR (Reconocimiento Óptico de Caracteres)

#### 1.1 Extracción de RUT
```python
INPUT: Archivo PDF/JPG con carné de identidad
↓
PROCESAMIENTO OCR:
├─ Localizar zona RUT
├─ Extraer texto
├─ Validar formato
└─ Calcular confianza

OUTPUT:
{
  "rut": "12.345.678-9",
  "confidence": 0.95,
  "extracted_text": "...",
  "status": "success"
}
```

#### 1.2 Extracción de Certificado
```python
INPUT: Archivo PDF/JPG con certificado de matrícula
↓
PROCESAMIENTO OCR:
├─ Localizar zona de datos
├─ Extraer: nombre, RUT, programa, año
├─ Validar fechas vigencia
└─ Calcular confianza

OUTPUT:
{
  "name": "Juan Flores",
  "rut": "12.345.678-9",
  "program": "EDUC001",
  "enrollment_year": 2024,
  "valid_from": "2024-01-15",
  "valid_until": "2024-12-31",
  "confidence": 0.92,
  "status": "success"
}
```

### 2. Validación de Documentos

#### 2.1 Validación Visual
```
Criterios:
✓ Legibilidad: >= 80% confianza
✓ Completitud: Todos datos presentes
✓ Vigencia: Dentro del período válido
✓ Consistencia: RUT matches certificado
✓ Formato: Sigue estándar institucional
```

#### 2.2 Estados de Documento
```
pending      → Subido, esperando OCR
processing   → OCR en progreso
extracted    → Datos extraídos, validando
verified     → Validado manualmente
approved     → Aprobado, listo para usar
rejected     → Rechazado (inconsistencias)
```

### 3. Integración Académica Simulada

#### 3.1 Verificación en Sistema Académico
```python
{
  "student_id": "12345678",
  "name": "Juan Flores",
  "program": "EDUC001",
  "enrollment_status": "active",  # active, inactive, suspended
  "academic_year": 2024,
  "enrollment_date": "2024-01-15",
  "graduation_year": null,
  "is_regular_student": true
}
```

#### 3.2 Validaciones
```
✓ Matrícula activa (no suspendida)
✓ Programa correcto (matches certificate)
✓ Año académico actual (2024)
✓ Estudiante regular (no egresado)
✓ Sin deudas académicas
```

---

## 🗄️ Modelos de Base de Datos

### 1. OCRExtraction (NUEVO)

```python
class OCRExtraction(models.Model):
    CONFIDENCE_CHOICES = (
        ('high', 'Alta (90-100%)'),
        ('medium', 'Media (70-89%)'),
        ('low', 'Baja (<70%)'),
    )
    
    document = models.OneToOneField(
        DocumentVerification,
        on_delete=models.CASCADE,
        related_name='ocr_extraction'
    )
    
    # Datos extraídos
    extracted_rut = models.CharField(max_length=20)
    extracted_name = models.CharField(max_length=200)
    extracted_program = models.CharField(max_length=100)
    extracted_enrollment_year = models.IntegerField()
    
    # Certificado (si aplica)
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    
    # OCR Status
    confidence_score = models.FloatField(default=0.0)  # 0-1
    confidence_level = models.CharField(
        max_length=10,
        choices=CONFIDENCE_CHOICES,
        default='low'
    )
    
    # Datos crudos
    raw_text = models.TextField(blank=True)
    extraction_metadata = models.JSONField(default=dict)
    
    # Estado
    status = models.CharField(
        max_length=20,
        choices=[
            ('extracting', 'En extracción'),
            ('extracted', 'Datos extraídos'),
            ('validating', 'Validando'),
            ('validated', 'Validado'),
            ('failed', 'Falló extracción'),
        ],
        default='extracting'
    )
    
    # Auditoría
    extracted_at = models.DateTimeField(auto_now_add=True)
    validated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Extracción OCR"
        verbose_name_plural = "Extracciones OCR"
    
    def get_confidence_level(self):
        """Retorna nivel de confianza"""
        if self.confidence_score >= 0.9:
            return 'high'
        elif self.confidence_score >= 0.7:
            return 'medium'
        else:
            return 'low'
    
    def is_high_confidence(self):
        """¿Confianza suficiente?"""
        return self.confidence_score >= 0.85
```

### 2. AcademicIntegration (NUEVO)

```python
class AcademicIntegration(models.Model):
    ENROLLMENT_STATUS = (
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('suspended', 'Suspendido'),
        ('graduated', 'Egresado'),
    )
    
    student_verification = models.OneToOneField(
        StudentVerification,
        on_delete=models.CASCADE,
        related_name='academic_integration'
    )
    
    # Datos académicos
    academic_student_id = models.CharField(
        max_length=50,
        help_text="ID en sistema académico"
    )
    enrollment_status = models.CharField(
        max_length=20,
        choices=ENROLLMENT_STATUS,
        default='active'
    )
    academic_year = models.IntegerField(default=2024)
    enrollment_date = models.DateField()
    graduation_year = models.IntegerField(null=True, blank=True)
    
    # Validaciones
    is_regular_student = models.BooleanField(default=True)
    has_academic_debt = models.BooleanField(default=False)
    
    # Estado de verificación
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pendiente'),
            ('verified', 'Verificado'),
            ('mismatch', 'Inconsistencia'),
            ('error', 'Error de consulta'),
        ],
        default='pending'
    )
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Integración Académica"
        verbose_name_plural = "Integraciones Académicas"
    
    def is_valid(self):
        """¿Datos académicos válidos?"""
        return (
            self.enrollment_status == 'active' and
            not self.has_academic_debt and
            self.is_regular_student
        )
    
    def sync_with_academic_system(self):
        """Sincronizar con sistema académico (simulado)"""
        # En producción, aquí iría integración real
        self.last_sync = timezone.now()
        self.save()
```

### 3. DocumentVerification (EXPANDIDO)

```python
# Agregar campos:

# OCR y Extracción
ocr_status = models.CharField(
    max_length=20,
    choices=[
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('extracted', 'Extraído'),
        ('verified', 'Verificado'),
        ('failed', 'Falló'),
    ],
    default='pending'
)

# Confianza
confidence_score = models.FloatField(
    default=0.0,
    help_text="0.0 a 1.0"
)

# Fechas de validez
valid_from = models.DateField(null=True, blank=True)
valid_until = models.DateField(null=True, blank=True)

# Datos extraídos
extracted_rut = models.CharField(
    max_length=20,
    blank=True,
    help_text="RUT extraído por OCR"
)

extracted_name = models.CharField(
    max_length=200,
    blank=True,
    help_text="Nombre extraído por OCR"
)

# Índices
Index(fields=['ocr_status']),
Index(fields=['confidence_score']),
```

---

## 🔧 Validadores (Nuevos)

### 1. OCRValidator

```python
class OCRValidator:
    """Valida que OCR extrajo datos con suficiente confianza"""
    
    def __call__(self, extraction):
        if extraction.confidence_score < 0.7:
            raise ValidationError(
                'Confianza muy baja (<70%). '
                'Por favor, sube una imagen más clara.'
            )
        
        if not extraction.extracted_rut:
            raise ValidationError(
                'No se pudo extraer RUT del documento.'
            )
        
        if not extraction.extracted_program:
            raise ValidationError(
                'No se pudo extraer programa del documento.'
            )
```

### 2. CertificateValidityValidator

```python
class CertificateValidityValidator:
    """Valida que certificado está vigente"""
    
    def __call__(self, document):
        today = timezone.now().date()
        
        if document.valid_until and document.valid_until < today:
            raise ValidationError(
                'Certificado expirado.'
            )
        
        if document.valid_from and document.valid_from > today:
            raise ValidationError(
                'Certificado aún no válido.'
            )
```

### 3. AcademicConsistencyValidator

```python
class AcademicConsistencyValidator:
    """Valida consistencia entre documentos y sistema académico"""
    
    def __call__(self, ocr_extraction, academic_integration):
        # RUT debe coincidir
        if ocr_extraction.extracted_rut != academic_integration.student_verification.user.rut:
            raise ValidationError(
                'RUT del documento no coincide con registro.'
            )
        
        # Programa debe coincidir
        if ocr_extraction.extracted_program != academic_integration.student_verification.program.code:
            raise ValidationError(
                'Programa del documento no coincide con registro.'
            )
        
        # Año debe ser actual
        if ocr_extraction.extracted_enrollment_year != timezone.now().year:
            raise ValidationError(
                'Año de matrícula debe ser actual.'
            )
```

---

## 📡 Endpoints REST (Phase 2)

### 1. Subir Documento

**Endpoint**: `POST /api/core/documents/upload/`

**Request**:
```json
{
  "document_type": "certificate",
  "file": <multipart file>,
  "user_id": 1
}
```

**Response (202 Accepted)**:
```json
{
  "id": 5,
  "document_type": "certificate",
  "status": "processing",
  "message": "Documento recibido. OCR en progreso...",
  "ocr_status": "processing"
}
```

### 2. Extraer RUT (OCR)

**Endpoint**: `POST /api/core/documents/extract-rut/`

**Request**:
```json
{
  "document_id": 5,
  "force_reprocess": false
}
```

**Response (200 OK)**:
```json
{
  "id": 5,
  "extracted_rut": "12.345.678-9",
  "confidence_score": 0.95,
  "confidence_level": "high",
  "raw_text": "...",
  "status": "extracted"
}
```

### 3. Estado de Documento

**Endpoint**: `GET /api/core/documents/{id}/status/`

**Response (200 OK)**:
```json
{
  "id": 5,
  "document_type": "certificate",
  "status": "extracted",
  "ocr_extraction": {
    "extracted_rut": "12.345.678-9",
    "extracted_name": "Juan Flores",
    "extracted_program": "EDUC001",
    "confidence_score": 0.95,
    "valid_until": "2024-12-31"
  },
  "verification_status": "pending",
  "notes": ""
}
```

### 4. Verificar Datos Académicos

**Endpoint**: `POST /api/core/academic/verify/`

**Request**:
```json
{
  "student_verification_id": 3,
  "force_sync": true
}
```

**Response (200 OK)**:
```json
{
  "academic_student_id": "20001234",
  "enrollment_status": "active",
  "academic_year": 2024,
  "is_regular_student": true,
  "has_academic_debt": false,
  "verification_status": "verified",
  "is_valid": true
}
```

### 5. Sincronizar Sistema Académico

**Endpoint**: `POST /api/core/academic/sync/`

**Request**:
```json
{
  "rut": "12.345.678-9"
}
```

**Response (200 OK)**:
```json
{
  "student_id": "20001234",
  "name": "Juan Flores",
  "program": "EDUC001",
  "enrollment_status": "active",
  "academic_year": 2024,
  "is_regular_student": true,
  "sync_timestamp": "2024-01-15T10:30:00Z"
}
```

### 6. Obtener Estados de OCR

**Endpoint**: `GET /api/core/ocr/statistics/`

**Response (200 OK)**:
```json
{
  "total_documents": 150,
  "processed": 145,
  "high_confidence": 140,
  "medium_confidence": 5,
  "failed": 5,
  "average_confidence": 0.94,
  "success_rate": 0.97
}
```

---

## 🔄 Flujos de Procesamiento

### Flujo 1: Verificación Completa (Nueva Niñera)

```
1. Usuario sube certificado
                ↓
2. Sistema procesa OCR
   ├─ Extrae RUT
   ├─ Extrae nombre
   ├─ Extrae programa
   ├─ Extrae fechas
   └─ Calcula confianza
                ↓
3. Validaciones OCR
   ├─ Confianza >= 0.85? ✓
   ├─ Todos datos presentes? ✓
   └─ Formato válido? ✓
                ↓
4. Consulta sistema académico
   ├─ ¿RUT existe?
   ├─ ¿Programa coincide?
   ├─ ¿Matriculado activo?
   └─ ¿Sin deudas?
                ↓
5. Validaciones cruzadas
   ├─ RUT certificado = registro? ✓
   ├─ Programa certificado = registro? ✓
   └─ Año matrícula = actual? ✓
                ↓
6. Documento APROBADO ✅
   → Admin puede revisar
   → Niñera verificada
```

### Flujo 2: Reprocesamiento OCR

```
Documento rechazado (baja confianza)
                ↓
Usuario sube nueva imagen
                ↓
Sistema ejecuta OCR nuevamente
                ↓
Compara con anterior
├─ Mismos datos? → Usar mejor confianza
└─ Datos diferentes? → Marcar inconsistencia
                ↓
Si >= 0.85: Enviar a verificación
Si < 0.85: Pedir nueva imagen
```

---

## 📊 Estimación de Esfuerzo

| Tarea | Horas | Complejidad |
|-------|-------|-------------|
| Especificaciones | 2 | Baja |
| Modelos | 4 | Media |
| Validadores | 5 | Media |
| Serializadores | 4 | Baja |
| Endpoints | 8 | Media |
| OCR Processing | 10 | Alta |
| Academic Integration | 6 | Media |
| Tests | 8 | Media |
| Migraciones | 2 | Baja |
| Documentación | 5 | Baja |
| **TOTAL** | **54** | - |

---

## 🛠️ Tecnologías

### OCR
- **pytesseract** (interfaz a Tesseract OCR)
- **Pillow** (procesamiento de imágenes)
- Fallback: Simulación de OCR para MVP

### Integración Académica
- **Simulación** para MVP (datos hardcodeados)
- **SOAP/REST** para integración real futura

### Procesamiento de Archivos
- **Django FileField** (almacenamiento)
- **python-magic** (validación de tipos MIME)
- **pdf2image** (conversión PDF a imagen)

---

## ✅ Criterios de Aceptación

### Extracción OCR
- [ ] OCR extrae RUT con >= 85% confianza
- [ ] OCR extrae certificado con >= 85% confianza
- [ ] Datos extraídos se guardan en BD
- [ ] Historial de extracciones disponible

### Validación de Documentos
- [ ] Documentos se validan contra sistema académico
- [ ] Inconsistencias se detectan automáticamente
- [ ] Estado de documento se actualiza correctamente
- [ ] Admin recibe alertas de inconsistencias

### Integración Académica
- [ ] Sistema académico simulado funciona
- [ ] Datos coinciden con certificado
- [ ] Validación de matrícula activa
- [ ] Sincronización periódica (simulada)

### Endpoints
- [ ] Todos los endpoints responden 200/202/400 correctamente
- [ ] Validaciones funcionan
- [ ] Errores se reportan correctamente
- [ ] Documentación de API completa

### Testing
- [ ] >= 8 nuevos tests
- [ ] Cobertura >= 85%
- [ ] Todos tests pasando
- [ ] Test cases para OCR, académica, validaciones

---

## 📝 Dependencias

```
# Ya instaladas:
Django==5.2.6
djangorestframework==3.16.1

# Nuevas:
pytesseract>=0.3.10  # OCR
Pillow>=10.0.0       # Procesamiento de imágenes
pdf2image>=1.16.3    # Conversión PDF
python-magic>=0.4.27 # Validación MIME types
```

---

## 🔐 Consideraciones de Seguridad

- Archivos subidos escaneados por malware
- Almacenamiento de archivos fuera de web root
- Eliminación de archivos después de validación (opcional)
- Permisos de acceso a archivos
- Logs de auditoría de procesamiento OCR

---

## 🚀 Próximas Fases (After Phase 2)

### Phase 3: Horarios y Ubicación
- Restricción geográfica (campus)
- Horarios de operación (8-20 hrs)
- Zonas de disponibilidad

### Phase 4: Matching y Bookings Avanzados
- Algoritmo de matching automático
- Historial y ratings
- Sistema de calificación mejorado

---

## 📞 Notas

- MVP: OCR simulado (sin Tesseract en Windows)
- Integración académica: Simulada con datos hardcodeados
- Producción: Reemplazar con APIs reales
- Confidencialidad: Cumplir GDPR/LGPD para datos académicos

---

**Versión**: 2.0.0 Phase 2  
**Estado**: PLANIFICADO  
**Inicio estimado**: Inmediatamente  
**Fin estimado**: +2 semanas
