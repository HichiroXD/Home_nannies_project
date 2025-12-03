import re
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()


class RUTValidator:
    """
    Valida RUT chileno (formato y dígito verificador).
    
    Formatos aceptados:
    - 12.345.678-9
    - 12345678-9
    - 12345678k
    """
    
    def __call__(self, value):
        """Validar RUT"""
        if not value:
            raise ValidationError('El RUT es obligatorio')
        
        # Limpiar valor
        rut_clean = self._clean_rut(value)
        
        if not rut_clean:
            raise ValidationError('El RUT tiene un formato inválido')
        
        # Validar dígito verificador
        if not self._validate_verification_digit(rut_clean):
            raise ValidationError('El RUT tiene dígito verificador inválido')
    
    @staticmethod
    def _clean_rut(rut):
        """Limpiar y normalizar RUT"""
        # Remover puntos y guiones, convertir a mayúsculas
        rut = rut.replace('.', '').replace('-', '').upper().strip()
        
        # Validar formato: números seguidos de dígito verificador
        if not re.match(r'^\d{7,8}[0-9K]$', rut):
            return None
        
        return rut
    
    @staticmethod
    def _validate_verification_digit(rut):
        """
        Valida el dígito verificador del RUT.
        
        Algoritmo:
        1. Multiplicar cada dígito por 2,3,4,5,6,7 (repetir si es necesario)
        2. Sumar todos los productos
        3. Restar 11 del módulo 11 de la suma
        4. Si es 11, DV es 0; si es 10, DV es K
        """
        if len(rut) < 2:
            return False
        
        rut_num = rut[:-1]
        dv_given = rut[-1]
        
        # Validar que rut_num sean dígitos
        if not rut_num.isdigit():
            return False
        
        # Calcular dígito verificador
        multipliers = [2, 3, 4, 5, 6, 7]
        total = 0
        
        for i, digit in enumerate(reversed(rut_num)):
            multiplier = multipliers[i % len(multipliers)]
            total += int(digit) * multiplier
        
        remainder = 11 - (total % 11)
        
        if remainder == 11:
            dv_calculated = '0'
        elif remainder == 10:
            dv_calculated = 'K'
        else:
            dv_calculated = str(remainder)
        
        return dv_given == dv_calculated


def validate_chilean_phone(value):
    """
    Valida números telefónicos chilenos.
    
    Formatos aceptados:
    - +56912345678
    - +56 9 1234 5678
    - 912345678
    - 9 1234 5678
    - +562XXXXXXXX (teléfono fijo)
    - 2XXXXXXXX (teléfono fijo)
    """
    if not value:
        return  # Campo puede ser opcional en algunos casos
    
    # Limpiar espacios y guiones
    cleaned = re.sub(r'[\s\-]', '', value)
    
    # Patrones válidos para números chilenos
    patterns = [
        r'^\+569\d{8}$',      # +56912345678 (móvil)
        r'^9\d{8}$',          # 912345678 (móvil)
        r'^\+56[2-9]\d{8}$',  # +562XXXXXXXX (fijo)
        r'^[2-9]\d{8}$',      # 2XXXXXXXX (fijo)
    ]
    
    if not any(re.match(pattern, cleaned) for pattern in patterns):
        raise ValidationError(
            'Ingrese un número telefónico chileno válido. '
            'Ejemplos: +56912345678, 912345678, +56223456789'
        )


def validate_positive_nonzero(value):
    """
    Valida que el valor sea positivo y mayor a 0.
    Útil para campos como número de hijos, cantidad de items, etc.
    """
    if value is not None and value < 1:
        raise ValidationError(
            'Este valor debe ser al menos 1.'
        )


class InstitutionalEmailValidator:
    """
    Valida email institucional.
    - Debe terminar en @universidad.edu.co
    - No debe estar duplicado
    - Formato válido de email
    """
    
    def __call__(self, value):
        """Validar email institucional"""
        if not value:
            raise ValidationError('El email es obligatorio')
        
        # Validar dominio
        if not value.lower().endswith('@universidad.edu.co'):
            raise ValidationError(
                'Email debe ser institucional (@universidad.edu.co)'
            )
        
        # Validar formato
        email_regex = r'^[a-zA-Z0-9._%+-]+@universidad\.edu\.co$'
        if not re.match(email_regex, value.lower()):
            raise ValidationError('Formato de email inválido')
        
        # Validar que no exista
        if User.objects.filter(institutional_email=value).exists():
            raise ValidationError('Este email ya está registrado')


class DocumentFileValidator:
    """
    Valida archivos de documentos.
    - Extensión válida (pdf, jpg, jpeg, png)
    - Tamaño máximo: 5MB
    """
    
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']
    
    def __call__(self, file_obj):
        """Validar archivo"""
        if not file_obj:
            raise ValidationError('El archivo es obligatorio')
        
        # Validar tamaño
        if file_obj.size > self.MAX_FILE_SIZE:
            raise ValidationError(
                f'El archivo no debe superar {self.MAX_FILE_SIZE / (1024*1024):.1f}MB'
            )
        
        # Validar extensión
        ext = file_obj.name.split('.')[-1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise ValidationError(
                f'Formato no permitido. Use: {", ".join(self.ALLOWED_EXTENSIONS)}'
            )


class PasswordStrengthValidator:
    """
    Valida contraseñas con requisitos de seguridad.
    - Mínimo 8 caracteres
    - Al menos una mayúscula
    - Al menos una minúscula
    - Al menos un número
    - Al menos un carácter especial
    """
    
    def __call__(self, value):
        """Validar contraseña"""
        if not value:
            raise ValidationError('La contraseña es obligatoria')
        
        errors = []
        
        # Validar longitud
        if len(value) < 8:
            errors.append('Mínimo 8 caracteres')
        
        # Validar mayúscula
        if not re.search(r'[A-Z]', value):
            errors.append('Al menos una mayúscula')
        
        # Validar minúscula
        if not re.search(r'[a-z]', value):
            errors.append('Al menos una minúscula')
        
        # Validar número
        if not re.search(r'\d', value):
            errors.append('Al menos un número')
        
        # Validar carácter especial
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            errors.append('Al menos un carácter especial (!@#$%^&*...)')
        
        if errors:
            raise ValidationError(
                'Requisitos de contraseña: ' + ', '.join(errors)
            )


# Instancias globales
validate_rut = RUTValidator()
validate_institutional_email = InstitutionalEmailValidator()
validate_document_file = DocumentFileValidator()
validate_password_strength = PasswordStrengthValidator()


# ========== VALIDADORES PHASE 2: OCR y Validación Académica ==========


class OCRValidator:
    """
    Phase 2: Valida resultados de OCR.
    - Confianza mínima: 0.70 (70%)
    - RUT extraído válido
    - Campos requeridos extraídos
    - Fechas coherentes
    """
    
    MIN_CONFIDENCE = 0.70
    
    def __call__(self, ocr_data):
        """
        Validar datos OCR extraídos.
        
        ocr_data debe contener:
        {
            'confidence_score': float (0-1),
            'extracted_rut': str,
            'extracted_name': str,
            'extracted_program': str,
            'valid_from': date,
            'valid_until': date
        }
        """
        if not ocr_data:
            raise ValidationError('Datos OCR requeridos')
        
        errors = []
        
        # Validar confianza
        confidence = ocr_data.get('confidence_score', 0)
        if confidence < self.MIN_CONFIDENCE:
            errors.append(
                f'Confianza insuficiente: {confidence*100:.1f}% '
                f'(mínimo {self.MIN_CONFIDENCE*100:.0f}%)'
            )
        
        # Validar RUT extraído
        rut = ocr_data.get('extracted_rut', '').strip()
        if not rut:
            errors.append('RUT no fue extraído correctamente')
        elif not self._validate_rut(rut):
            errors.append('RUT extraído tiene formato inválido')
        
        # Validar nombre
        name = ocr_data.get('extracted_name', '').strip()
        if not name:
            errors.append('Nombre no fue extraído')
        elif len(name) < 3:
            errors.append('Nombre muy corto')
        
        # Validar programa
        program = ocr_data.get('extracted_program', '').strip()
        if not program:
            errors.append('Programa no fue extraído')
        
        # Validar fechas (si es certificado)
        valid_from = ocr_data.get('valid_from')
        valid_until = ocr_data.get('valid_until')
        
        if valid_from and valid_until:
            from datetime import date
            today = date.today()
            
            if valid_from > today:
                errors.append('Fecha de inicio en el futuro')
            
            if valid_until < today:
                errors.append('Certificado vencido')
            
            if valid_from >= valid_until:
                errors.append('Fechas incoherentes')
        
        if errors:
            raise ValidationError(
                'Errores en datos OCR: ' + '; '.join(errors)
            )
    
    @staticmethod
    def _validate_rut(rut):
        """Validar formato RUT"""
        rut = rut.replace('.', '').replace('-', '').upper().strip()
        return re.match(r'^\d{7,8}[0-9K]$', rut) is not None


class CertificateValidityValidator:
    """
    Phase 2: Valida vigencia de certificados académicos.
    - Vigencia mínima: desde hoy
    - Programa válido
    - Matrícula activa
    - Año académico coherente
    """
    
    def __call__(self, certificate_data):
        """
        Validar certificado.
        
        certificate_data debe contener:
        {
            'valid_until': date,
            'extracted_program': str,
            'enrollment_year': int,
            'is_active': bool
        }
        """
        if not certificate_data:
            raise ValidationError('Datos de certificado requeridos')
        
        from datetime import date
        errors = []
        
        # Validar vigencia
        valid_until = certificate_data.get('valid_until')
        if not valid_until:
            errors.append('Fecha de vencimiento requerida')
        elif valid_until < date.today():
            errors.append('Certificado vencido')
        
        # Validar estado
        is_active = certificate_data.get('is_active', False)
        if not is_active:
            errors.append('Matrícula no activa')
        
        # Validar año académico
        enrollment_year = certificate_data.get('enrollment_year')
        current_year = date.today().year
        if enrollment_year:
            if enrollment_year > current_year:
                errors.append('Año de matrícula en el futuro')
            elif current_year - enrollment_year > 10:
                errors.append('Matrícula muy antigua')
        
        if errors:
            raise ValidationError(
                'Certificado inválido: ' + '; '.join(errors)
            )


class AcademicConsistencyValidator:
    """
    Phase 2: Valida consistencia entre datos OCR y sistema académico.
    - RUT coincide
    - Nombre coincide (aproximado)
    - Programa válido
    - Estado académico coherente
    """
    
    CONFIDENCE_THRESHOLD = 0.80  # 80%
    
    def __call__(self, ocr_data, academic_data):
        """
        Validar consistencia OCR vs Sistema Académico.
        
        ocr_data: datos extraídos por OCR
        academic_data: datos del sistema académico
        """
        if not ocr_data or not academic_data:
            raise ValidationError('Datos OCR y académicos requeridos')
        
        errors = []
        
        # Validar RUT coincide
        ocr_rut = ocr_data.get('extracted_rut', '').upper()
        academic_rut = academic_data.get('rut', '').upper()
        
        if ocr_rut != academic_rut:
            errors.append(f'RUT no coincide: OCR={ocr_rut}, Sistema={academic_rut}')
        
        # Validar nombre (aproximado, permite hasta 20% diferencia)
        ocr_name = ocr_data.get('extracted_name', '').upper()
        academic_name = academic_data.get('name', '').upper()
        
        if not self._names_match(ocr_name, academic_name):
            errors.append(f'Nombre no coincide: OCR={ocr_name}, Sistema={academic_name}')
        
        # Validar programa
        ocr_program = ocr_data.get('extracted_program', '').lower()
        academic_program = academic_data.get('program', '').lower()
        
        if ocr_program not in academic_program and academic_program not in ocr_program:
            errors.append(
                f'Programa no coincide: OCR={ocr_program}, Sistema={academic_program}'
            )
        
        # Validar estado de matrícula
        is_active = academic_data.get('is_active', False)
        if not is_active:
            errors.append('Matrícula no activa en sistema académico')
        
        if errors:
            raise ValidationError(
                'Inconsistencia académica: ' + '; '.join(errors)
            )
    
    @staticmethod
    def _names_match(name1, name2):
        """Comparar nombres con tolerancia"""
        # Remover espacios extras
        n1 = ' '.join(name1.split()).strip()
        n2 = ' '.join(name2.split()).strip()
        
        # Coincidencia exacta
        if n1 == n2:
            return True
        
        # Permitir si uno contiene el otro
        if n1 in n2 or n2 in n1:
            return True
        
        # Comparar palabras principales
        words1 = set(n1.split())
        words2 = set(n2.split())
        
        # Si al menos el 80% de palabras coinciden
        if words1 and words2:
            common = len(words1 & words2)
            total = len(words1 | words2)
            match_ratio = common / total
            return match_ratio >= 0.80
        
        return False


# Instancias globales Phase 2
validate_ocr = OCRValidator()
validate_certificate_validity = CertificateValidityValidator()
validate_academic_consistency = AcademicConsistencyValidator()
