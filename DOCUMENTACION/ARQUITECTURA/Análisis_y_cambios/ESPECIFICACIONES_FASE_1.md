# Especificaciones Técnicas Fase 1: Validación Institucional

**Fase:** 1 (Sprints 1-2)  
**Versión:** 1.0  
**Objetivo:** Implementar validación institucional completa (correo, RUT, documentos)

---

## 1. MODELOS DJANGO - DISEÑO DETALLADO

### 1.1 UniversityProgram (Nuevo)
```python
# models.py
from django.db import models

class UniversityProgram(models.Model):
    """
    Programas académicos de la universidad.
    Permite identificar qué programa es de Educación.
    """
    PROGRAM_TYPES = [
        ('pregrado', 'Pregrado'),
        ('postgrado', 'Postgrado'),
        ('doctorado', 'Doctorado'),
        ('diplomado', 'Diplomado'),
    ]
    
    name = models.CharField(
        max_length=255,
        help_text="Ej: Licenciatura en Educación Inicial"
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Código único del programa"
    )
    program_type = models.CharField(
        max_length=20,
        choices=PROGRAM_TYPES,
        default='pregrado'
    )
    faculty = models.CharField(
        max_length=200,
        help_text="Facultad o escuela"
    )
    
    # CRÍTICO: Distinguir programas de Educación
    is_education_program = models.BooleanField(
        default=False,
        help_text="¿Es un programa de Educación? Determina si puede ser niñera"
    )
    
    education_specialization = models.CharField(
        max_length=100,
        blank=True,
        choices=[
            ('inicial', 'Educación Inicial'),
            ('primaria', 'Educación Primaria'),
            ('secundaria', 'Educación Secundaria'),
            ('especial', 'Educación Especial'),
            ('general', 'General')
        ],
        help_text="Si es programa educación, especialización"
    )
    
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'university_programs'
        verbose_name = 'Programa Universitario'
        verbose_name_plural = 'Programas Universitarios'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_education_program']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def allows_nanny_role(self):
        """¿Este programa permite rol de niñera?"""
        return self.is_education_program and self.active
```

### 1.2 StudentVerification (Nuevo)
```python
class StudentVerification(models.Model):
    """
    Verificación de estudiante activo.
    Vincula usuario con programa académico y documenta validación.
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente de Verificación'),
        ('verified', 'Verificado'),
        ('rejected', 'Rechazado'),
        ('expired', 'Vencido'),
    ]
    
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='student_verification'
    )
    
    # Información de estudio
    program = models.ForeignKey(
        UniversityProgram,
        on_delete=models.PROTECT,
        related_name='enrolled_students',
        help_text="Programa académico donde está matriculado"
    )
    student_id = models.CharField(
        max_length=50,
        unique=True,
        help_text="Carnet/ID del estudiante"
    )
    
    # Documentación
    enrollment_certificate = models.FileField(
        upload_to='documents/enrollment/%Y/%m/',
        help_text="Certificado de matrícula vigente (PDF)"
    )
    enrollment_period = models.CharField(
        max_length=50,
        help_text="Ej: 2025-1 (semestre/año)"
    )
    enrollment_expiry = models.DateField(
        help_text="Fecha de vencimiento del certificado"
    )
    
    # Validación
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    verified_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_students',
        help_text="Admin que verificó"
    )
    verified_date = models.DateTimeField(
        null=True,
        blank=True
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text="Motivo del rechazo si aplica"
    )
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_verifications'
        verbose_name = 'Verificación de Estudiante'
        verbose_name_plural = 'Verificaciones de Estudiantes'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['program']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.program.name} ({self.status})"
    
    def is_active_student(self):
        """¿Es estudiante activo?"""
        from datetime import date
        return (
            self.status == 'verified' and
            self.enrollment_expiry >= date.today()
        )
    
    def is_eligible_nanny(self):
        """¿Cumple requisitos para ser niñera?"""
        return (
            self.is_active_student() and
            self.program.allows_nanny_role()
        )
    
    def needs_renewal(self):
        """¿Necesita renovar matrícula?"""
        from datetime import date, timedelta
        days_until_expiry = (self.enrollment_expiry - date.today()).days
        return 0 <= days_until_expiry <= 30
```

### 1.3 DocumentVerification (Nuevo)
```python
class DocumentVerification(models.Model):
    """
    Verificación de documentos de identidad y matrícula.
    Maneja validación de RUT y certificados.
    """
    DOCUMENT_TYPES = [
        ('rut', 'RUT/Cédula de Identidad'),
        ('enrollment', 'Certificado de Matrícula'),
        ('police_certificate', 'Certificado de Antecedentes'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente Revisión'),
        ('valid', 'Válido'),
        ('invalid', 'Inválido'),
        ('resubmit', 'Reenviar'),
    ]
    
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    document_type = models.CharField(
        max_length=50,
        choices=DOCUMENT_TYPES
    )
    
    # Archivo
    file = models.FileField(
        upload_to='documents/verification/%Y/%m/',
        help_text="Documento escaneado (PDF/JPG/PNG)"
    )
    file_size = models.IntegerField(help_text="Bytes")  # Validación
    
    # Datos extraídos (si aplica)
    rut_number = models.CharField(
        max_length=20,
        blank=True,
        help_text="RUT extraído del documento"
    )
    document_validity_date = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de vencimiento del documento"
    )
    
    # Verificación
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    verified_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents'
    )
    verified_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(
        blank=True,
        help_text="Notas del verificador"
    )
    
    # Auditoría
    upload_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'document_verifications'
        verbose_name = 'Verificación de Documento'
        verbose_name_plural = 'Verificaciones de Documentos'
        unique_together = [['user', 'document_type']]  # Un doc tipo por usuario
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['rut_number']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.get_document_type_display()}"
    
    def is_valid(self):
        """¿El documento es válido?"""
        from datetime import date
        if self.status != 'valid':
            return False
        if self.document_validity_date:
            return self.document_validity_date >= date.today()
        return True
```

### 1.4 Modificaciones a User Model
```python
# En users/models.py - AGREGAR estos campos

class User(AbstractUser):
    # Campos existentes...
    
    # NUEVOS CAMPOS FASE 1
    
    # Email institucional (CRÍTICO)
    institutional_email = models.EmailField(
        unique=True,
        null=True,
        blank=True,
        help_text="Email @universidad.edu.co - Uso obligatorio"
    )
    
    # Verificación
    email_verified = models.BooleanField(
        default=False,
        help_text="¿Email verificado vía link de confirmación?"
    )
    email_verification_token = models.CharField(
        max_length=255,
        blank=True,
        unique=True,
        null=True,
        help_text="Token JWT para verificación"
    )
    email_verified_date = models.DateTimeField(
        null=True,
        blank=True
    )
    
    # RUT (Nacional)
    rut = models.CharField(
        max_length=20,
        unique=True,
        help_text="RUT/Cédula única identificación"
    )
    
    # Rol específico
    user_role = models.CharField(
        max_length=20,
        choices=[
            ('parent', 'Padre/Madre'),
            ('nanny', 'Niñera'),
            ('admin', 'Administrador'),
        ],
        help_text="Rol en el sistema"
    )
    
    # Verificación administrativa
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pendiente'),
            ('approved', 'Aprobado'),
            ('rejected', 'Rechazado'),
        ],
        default='pending'
    )
    
    # Seguridad
    last_login_ip = models.GenericIPAddressField(
        null=True,
        blank=True
    )
    failed_login_attempts = models.IntegerField(
        default=0,
        help_text="Contador de intentos fallidos"
    )
    locked_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Cuenta bloqueada hasta esta fecha"
    )
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['institutional_email']),
            models.Index(fields=['rut']),
            models.Index(fields=['user_role']),
            models.Index(fields=['verification_status']),
        ]
    
    def is_verified_student(self):
        """¿Es estudiante verificado?"""
        if not hasattr(self, 'student_verification'):
            return False
        return self.student_verification.is_active_student()
    
    def is_eligible_nanny(self):
        """¿Puede ser niñera?"""
        if not hasattr(self, 'student_verification'):
            return False
        return self.student_verification.is_eligible_nanny()
    
    def is_account_locked(self):
        """¿Cuenta está bloqueada?"""
        if not self.locked_until:
            return False
        from django.utils import timezone
        return timezone.now() < self.locked_until
```

---

## 2. SERIALIZADORES DRF

### 2.1 UniversityProgramSerializer
```python
# serializers.py

from rest_framework import serializers
from .models import (
    UniversityProgram,
    StudentVerification,
    DocumentVerification
)

class UniversityProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityProgram
        fields = [
            'id',
            'name',
            'code',
            'program_type',
            'faculty',
            'is_education_program',
            'education_specialization',
            'active',
        ]
        read_only_fields = ['id']
```

### 2.2 StudentVerificationSerializer
```python
class StudentVerificationSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(
        source='program.name',
        read_only=True
    )
    is_active_student = serializers.SerializerMethodField()
    is_eligible_nanny = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentVerification
        fields = [
            'id',
            'user',
            'program',
            'program_name',
            'student_id',
            'enrollment_period',
            'enrollment_expiry',
            'status',
            'verified_date',
            'rejection_reason',
            'is_active_student',
            'is_eligible_nanny',
        ]
        read_only_fields = [
            'id',
            'status',
            'verified_by',
            'verified_date',
        ]
    
    def get_is_active_student(self, obj):
        return obj.is_active_student()
    
    def get_is_eligible_nanny(self, obj):
        return obj.is_eligible_nanny()
```

### 2.3 DocumentVerificationSerializer
```python
class DocumentVerificationSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(
        source='get_document_type_display',
        read_only=True
    )
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentVerification
        fields = [
            'id',
            'user',
            'document_type',
            'document_type_display',
            'file',
            'rut_number',
            'document_validity_date',
            'status',
            'verified_date',
            'is_valid',
        ]
        read_only_fields = [
            'id',
            'status',
            'verified_by',
            'verified_date',
            'rut_number',
        ]
```

### 2.4 RegisterParentSerializer
```python
class RegisterParentSerializer(serializers.Serializer):
    """Registro de Padre/Madre con validación institucional"""
    
    email = serializers.EmailField()
    institutional_email = serializers.EmailField(
        help_text="Correo @universidad.edu.co"
    )
    password = serializers.CharField(
        min_length=10,
        write_only=True,
        help_text="Mín 10 caracteres, mayúsculas, minúsculas, números, símbolos"
    )
    password_confirm = serializers.CharField(
        write_only=True
    )
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    rut = serializers.CharField(max_length=20)
    
    # Documentos
    enrollment_certificate = serializers.FileField(
        help_text="Certificado de matrícula (PDF)"
    )
    enrollment_expiry = serializers.DateField()
    
    # Programa
    program_id = serializers.IntegerField()
    
    def validate_institutional_email(self, value):
        """Validar que sea correo institucional"""
        if not value.endswith('@universidad.edu.co'):
            raise serializers.ValidationError(
                "Debe usar correo institucional (@universidad.edu.co)"
            )
        if User.objects.filter(institutional_email=value).exists():
            raise serializers.ValidationError(
                "Este correo institucional ya está registrado"
            )
        return value
    
    def validate_password(self, value):
        """Validar fortaleza de contraseña"""
        import re
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                "Debe contener al menos una letra mayúscula"
            )
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError(
                "Debe contener al menos una letra minúscula"
            )
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError(
                "Debe contener al menos un número"
            )
        if not re.search(r'[!@#$%^&*]', value):
            raise serializers.ValidationError(
                "Debe contener al menos un símbolo (!@#$%^&*)"
            )
        return value
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError(
                {"password_confirm": "Las contraseñas no coinciden"}
            )
        
        # Validar programa existe
        try:
            program = UniversityProgram.objects.get(
                id=data['program_id'],
                active=True
            )
        except UniversityProgram.DoesNotExist:
            raise serializers.ValidationError(
                {"program_id": "Programa no válido"}
            )
        
        data['program'] = program
        return data
    
    def create(self, validated_data):
        """Crear usuario con verificación"""
        user = User.objects.create_user(
            username=validated_data['institutional_email'],
            email=validated_data['email'],
            institutional_email=validated_data['institutional_email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            rut=validated_data['rut'],
            user_role='parent',
            verification_status='pending'
        )
        
        # Crear verificación de estudiante
        StudentVerification.objects.create(
            user=user,
            program=validated_data['program'],
            enrollment_certificate=validated_data['enrollment_certificate'],
            enrollment_expiry=validated_data['enrollment_expiry'],
            status='pending'
        )
        
        # Crear documento de RUT
        DocumentVerification.objects.create(
            user=user,
            document_type='rut',
            rut_number=validated_data['rut'],
            status='pending'
        )
        
        return user
```

### 2.5 RegisterNannySerializer
```python
class RegisterNannySerializer(RegisterParentSerializer):
    """Registro de Niñera - Hereda validaciones padre, agrega validación de programa"""
    
    specialization = serializers.ChoiceField(
        choices=['inicial', 'primaria', 'secundaria', 'especial'],
        help_text="Especialización en Educación"
    )
    age_min_care = serializers.IntegerField(
        min_value=0,
        max_value=18,
        help_text="Edad mínima a cuidar (meses)"
    )
    age_max_care = serializers.IntegerField(
        min_value=0,
        max_value=18,
        help_text="Edad máxima a cuidar (años)"
    )
    hourly_rate = serializers.DecimalField(
        max_digits=8,
        decimal_places=2,
        min_value=0
    )
    
    def validate(self, data):
        data = super().validate(data)
        
        # CRÍTICO: Validar que programa sea de Educación
        program = data['program']
        if not program.is_education_program:
            raise serializers.ValidationError(
                "Solo estudiantes de Educación pueden ser niñeras. "
                f"Tu programa '{program.name}' no está permitido."
            )
        
        # Validar especialización
        if data['specialization'] not in dict(program.education_specialization):
            raise serializers.ValidationError(
                f"Especialización '{data['specialization']}' no disponible en tu programa"
            )
        
        # Validar rango de edad
        if data['age_min_care'] >= data['age_max_care']:
            raise serializers.ValidationError(
                "Edad mínima debe ser menor que edad máxima"
            )
        
        return data
    
    def create(self, validated_data):
        """Crear usuario niñera"""
        user = User.objects.create_user(
            username=validated_data['institutional_email'],
            email=validated_data['email'],
            institutional_email=validated_data['institutional_email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            rut=validated_data['rut'],
            user_role='nanny',  # DIFERENCIA
            verification_status='pending'
        )
        
        # Crear verificación de estudiante
        StudentVerification.objects.create(
            user=user,
            program=validated_data['program'],
            enrollment_certificate=validated_data['enrollment_certificate'],
            enrollment_expiry=validated_data['enrollment_expiry'],
            status='pending'
        )
        
        # Crear documento
        DocumentVerification.objects.create(
            user=user,
            document_type='rut',
            rut_number=validated_data['rut'],
            status='pending'
        )
        
        return user
```

---

## 3. VALIDADORES PERSONALIZADOS

### 3.1 validators.py
```python
# validators.py

import re
from datetime import date
from django.core.exceptions import ValidationError

def validate_institutional_email(email, institution_domain='@universidad.edu.co'):
    """Validar correo institucional"""
    if not email.endswith(institution_domain):
        raise ValidationError(
            f"El correo debe ser institucional {institution_domain}"
        )

def validate_rut(rut_string):
    """
    Validar RUT chileno (formato: 12.345.678-9 o 123456789)
    """
    # Limpiar formato
    rut = rut_string.replace('.', '').replace('-', '')
    
    if not rut.isdigit() or len(rut) < 7:
        raise ValidationError("RUT inválido")
    
    # Calcular dígito verificador
    s = 0
    multiplier = 2
    for digit in reversed(rut[:-1]):
        s += int(digit) * multiplier
        multiplier += 1
        if multiplier == 8:
            multiplier = 2
    
    verification = 11 - (s % 11)
    if verification == 11:
        verification = 0
    elif verification == 10:
        verification = 'K'
    
    if str(verification) != rut[-1].upper():
        raise ValidationError("RUT no válido")

def validate_enrollment_certificate_expiry(expiry_date):
    """Certificado debe ser vigente"""
    if expiry_date < date.today():
        raise ValidationError("Certificado de matrícula vencido")

def validate_document_file(file):
    """
    Validar archivo de documento
    - Tamaño: máximo 5MB
    - Tipo: PDF, JPG, PNG
    - Sin malware
    """
    max_size = 5 * 1024 * 1024  # 5MB
    allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png']
    
    # Verificar tamaño
    if file.size > max_size:
        raise ValidationError("Archivo debe ser menor a 5MB")
    
    # Verificar extensión
    filename = file.name.lower()
    if not any(filename.endswith(ext) for ext in allowed_extensions):
        raise ValidationError("Solo se permiten: PDF, JPG, PNG")
    
    # Verificar contenido (simple check de magic bytes)
    file.seek(0)
    file_header = file.read(4)
    file.seek(0)
    
    # PDF: %PDF
    if file_header[:4] == b'%PDF':
        return
    # JPG: FF D8 FF
    if file_header[:3] == b'\xff\xd8\xff':
        return
    # PNG: 89 50 4E 47
    if file_header[:4] == b'\x89PNG':
        return
    
    raise ValidationError("Archivo corrupto o no es documento válido")

def validate_password_strength(password):
    """
    Validar contraseña fuerte
    - Mín 10 caracteres
    - Al menos 1 mayúscula
    - Al menos 1 minúscula
    - Al menos 1 número
    - Al menos 1 símbolo
    """
    if len(password) < 10:
        raise ValidationError("Contraseña debe tener mínimo 10 caracteres")
    
    if not re.search(r'[A-Z]', password):
        raise ValidationError("Debe contener al menos una mayúscula")
    
    if not re.search(r'[a-z]', password):
        raise ValidationError("Debe contener al menos una minúscula")
    
    if not re.search(r'[0-9]', password):
        raise ValidationError("Debe contener al menos un número")
    
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?]', password):
        raise ValidationError("Debe contener al menos un símbolo especial")
```

---

## 4. ENDPOINTS REST - FASE 1

### 4.1 Autenticación y Registro
```
POST /api/auth/register/parent/
  Body: {
    email, institutional_email, password, password_confirm,
    first_name, last_name, rut, enrollment_certificate, 
    enrollment_expiry, program_id
  }
  Response: {
    user: {...}, token, verification_token
  }
  Status: 201

POST /api/auth/register/nanny/
  Body: {
    ...parent fields + specialization, age_min_care,
    age_max_care, hourly_rate
  }
  Response: {...}
  Status: 201

POST /api/auth/verify-email/
  Body: { token: "verification_token" }
  Response: { email_verified: true }
  Status: 200

GET /api/auth/verify-status/
  Response: {
    email_verified: boolean,
    student_verified: boolean,
    documents_verified: boolean,
    account_status: "pending|approved|rejected",
    messages: [...]
  }
  Status: 200

GET /api/programs/education/
  Description: Listar programas de Educación
  Response: [ProgramSerializer]
  Status: 200

GET /api/programs/{id}/
  Response: ProgramSerializer
  Status: 200
```

### 4.2 Documentos
```
POST /api/documents/upload/
  Multipart: { document_type, file }
  Response: DocumentVerificationSerializer
  Status: 201

GET /api/documents/
  Response: [DocumentVerificationSerializer]
  Status: 200

GET /api/documents/{id}/
  Response: DocumentVerificationSerializer
  Status: 200
```

### 4.3 Admin - Verificación
```
GET /api/admin/pending-verifications/
  Query: ?type=students|documents|users
  Response: [...]
  Status: 200

PATCH /api/admin/verify-student/{id}/
  Body: { status: "verified|rejected", reason: "..." }
  Response: StudentVerificationSerializer
  Status: 200

PATCH /api/admin/verify-document/{id}/
  Body: { status: "valid|invalid|resubmit", notes: "..." }
  Response: DocumentVerificationSerializer
  Status: 200

PATCH /api/admin/approve-user/{id}/
  Body: { approved: true, notes: "..." }
  Response: UserSerializer
  Status: 200
```

---

## 5. FLUJOS DE NEGOCIO

### 5.1 Flujo de Registro - Padre
```
1. Usuario accede a /register/parent
2. Completa formulario:
   - Email y email institucional
   - Contraseña fuerte
   - Datos personales
   - RUT
   - Selecciona programa
   - Carga certificado matrícula
3. Sistema valida:
   ✓ Email institucional tiene formato correcto
   ✓ RUT tiene dígito verificador válido
   ✓ Certificado es PDF/JPG/PNG y < 5MB
   ✓ Fecha de vencimiento >= hoy
   ✓ Contraseña cumple requisitos
4. Sistema crea:
   - Usuario (verification_status='pending')
   - StudentVerification (status='pending')
   - DocumentVerification para RUT
5. Sistema envía:
   - Email de bienvenida
   - Link de verificación de email
   - Notificación a admin para revisar documentos
6. Usuario verifica email y espera aprobación

Estado del Usuario:
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│   PENDING   │────▶│  APPROVED    │────▶│ ACTIVE   │
│ (Inicial)   │     │ (Admin OK)   │     │ (Operando)
└─────────────┘     └──────────────┘     └──────────┘
       │                    │
       │                    └──▶ REJECTED
       └───────────────────────▶ REJECTED
```

### 5.2 Flujo de Registro - Niñera
```
1-3. IGUAL A PADRE
4. Sistema valida ADICIONAL:
   ✓ Programa = "Educación"
   ✓ especialization válida para programa
   ✓ age_min_care < age_max_care
5. Sistema crea:
   - Usuario (user_role='nanny', verification_status='pending')
   - StudentVerification (status='pending')
   - DocumentVerification RUT
   - DocumentVerification Certificado Antecedentes (pendiente)
6. Sistema notifica a admin:
   ✓ Nueva niñera para validar
   ✓ Requiere certificado de antecedentes

Validaciones Críticas:
┌─────────────────────────────────────┐
│ PROGRAMA DEBE SER "EDUCACIÓN"        │
│ ✗ Ingeniería → RECHAZA               │
│ ✗ Medicina → RECHAZA                 │
│ ✓ Educación Inicial → ACEPTA         │
│ ✓ Educación Primaria → ACEPTA        │
└─────────────────────────────────────┘
```

### 5.3 Flujo de Verificación - Admin
```
1. Admin accede a /admin/pending-verifications
2. Admin ve lista de:
   - Usuarios pendientes
   - Documentos a revisar
3. Para cada usuario:
   a) Descarga certificado matrícula
   b) Valida que:
      ✓ Estudiante activo en programa
      ✓ Matrícula vigente
      ✓ RUT coincide
   c) Marca: VERIFIED o REJECTED
   d) Si es niñera, pide antecedentes
4. Sistema actualiza:
   - student_verification.status
   - user.verification_status
   - Envía email a usuario
```

---

## 6. TABLA DE TRANSICIONES DE ESTADO

### Usuario (User.verification_status)
```
pending ──approval──▶ approved ──ban──▶ suspended
          │
          └─rejection─▶ rejected
```

### Estudiante (StudentVerification.status)
```
pending ──verify──▶ verified ──expiry──▶ expired
        │
        └─reject─▶ rejected
```

### Documento (DocumentVerification.status)
```
pending ──valid──▶ valid ──expiry──▶ expired
       │
       ├─invalid─▶ invalid
       │
       └─resubmit─▶ pending (reintento)
```

---

## 7. ESTRUCTURA DE RESPUESTAS

### 7.1 Errores de Validación
```json
{
  "error": "Validation Error",
  "details": {
    "institutional_email": [
      "El correo debe ser institucional (@universidad.edu.co)"
    ],
    "rut": [
      "RUT inválido"
    ],
    "password": [
      "Debe contener al menos una mayúscula",
      "Debe contener al menos un símbolo"
    ]
  }
}
Status: 400
```

### 7.2 Registro Exitoso
```json
{
  "user": {
    "id": 1,
    "email": "padre@universidad.edu.co",
    "first_name": "Juan",
    "user_role": "parent",
    "verification_status": "pending"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "verification_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "message": "Registro exitoso. Por favor verifica tu email."
}
Status: 201
```

---

## 8. MIGRACIONES DJANGO

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear datos iniciales (universidades, programas)
python manage.py loaddata initial_programs.json
```

---

## 9. TESTING

### 9.1 Unit Tests - validators.py
```python
def test_validate_rut_valid():
    """RUT válido no debe lanzar excepción"""
    assert validate_rut("12345678-9") is None

def test_validate_rut_invalid():
    """RUT inválido debe lanzar ValidationError"""
    with pytest.raises(ValidationError):
        validate_rut("12345678-0")

def test_password_strength():
    """Contraseña débil debe fallar"""
    with pytest.raises(ValidationError):
        validate_password_strength("abcd1234")  # Sin mayúscula ni símbolo
```

### 9.2 Integration Tests
```python
def test_register_parent_success():
    """Registro exitoso de padre"""
    response = client.post('/api/auth/register/parent/', {
        "email": "padre@test.com",
        "institutional_email": "padre@universidad.edu.co",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        ...
    })
    assert response.status_code == 201
    assert User.objects.filter(email="padre@test.com").exists()

def test_register_nanny_wrong_program():
    """Rechazo si programa no es Educación"""
    response = client.post('/api/auth/register/nanny/', {
        ...
        "program_id": 99,  # Ingeniería
        ...
    })
    assert response.status_code == 400
    assert "Educación" in response.data['program_id'][0]
```

---

## 10. CHECKLIST DE IMPLEMENTACIÓN FASE 1

**Modelos Django:**
- [ ] UniversityProgram
- [ ] StudentVerification
- [ ] DocumentVerification
- [ ] User (campos adicionales)

**Serializadores DRF:**
- [ ] UniversityProgramSerializer
- [ ] StudentVerificationSerializer
- [ ] DocumentVerificationSerializer
- [ ] RegisterParentSerializer
- [ ] RegisterNannySerializer

**Validadores:**
- [ ] validate_institutional_email()
- [ ] validate_rut()
- [ ] validate_enrollment_certificate_expiry()
- [ ] validate_document_file()
- [ ] validate_password_strength()

**Endpoints:**
- [ ] POST /api/auth/register/parent/
- [ ] POST /api/auth/register/nanny/
- [ ] POST /api/auth/verify-email/
- [ ] GET /api/auth/verify-status/
- [ ] POST /api/documents/upload/
- [ ] GET /api/admin/pending-verifications/
- [ ] PATCH /api/admin/verify-student/{id}/

**Frontend:**
- [ ] Componente RegisterParent
- [ ] Componente RegisterNanny
- [ ] Componente DocumentUpload
- [ ] Componente EmailVerification
- [ ] Validación cliente RUT
- [ ] Validación cliente contraseña

**Testing:**
- [ ] Tests unitarios validadores
- [ ] Tests integración endpoints
- [ ] Tests flujos de registro
- [ ] Tests validaciones

**Documentación:**
- [ ] README de instalación
- [ ] Documentación API
- [ ] Diagrama de flujos
- [ ] Guía de admin

---

**Próximo:** Especificaciones técnicas Fase 2 (Restricciones Geográficas y Horarias)
