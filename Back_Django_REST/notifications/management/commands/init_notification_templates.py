"""
Comando para inicializar plantillas de notificación
"""

from django.core.management.base import BaseCommand
from notifications.models import NotificationTemplate


class Command(BaseCommand):
    help = 'Inicializa plantillas de notificación predeterminadas'

    def handle(self, *args, **options):
        """Crea plantillas de notificación"""
        
        templates = [
            {
                'name': 'ocr_approved',
                'template_type': 'ocr_approved',
                'subject': '✅ Tu documento ha sido aprobado - Home Nannies',
                'body_html': '''
                    <h2>¡Hola {user_name}!</h2>
                    <p>Nos complace informarte que tu documento <strong>{document_id}</strong> ha sido <strong>aprobado exitosamente</strong>.</p>
                    <div style="background: #f0f9f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Detalles de la verificación:</strong></p>
                        <ul style="list-style: none; padding: 0;">
                            <li>✓ RUT: {rut}</li>
                            <li>✓ Confianza: {confidence_score}</li>
                            <li>✓ Timestamp: {timestamp}</li>
                        </ul>
                    </div>
                    <p>Ya puedes acceder a todas las funciones de la plataforma.</p>
                    <p>Si tienes dudas, contáctanos al <a href="mailto:support@homenannies.com">support@homenannies.com</a></p>
                    <br/>
                    <p>Saludos,<br/>Equipo Home Nannies</p>
                '''
            },
            {
                'name': 'ocr_rejected',
                'template_type': 'ocr_rejected',
                'subject': '⚠️ Revisión necesaria - Documento rechazado - Home Nannies',
                'body_html': '''
                    <h2>Hola {user_name},</h2>
                    <p>Lamentamos informarte que tu documento <strong>{document_id}</strong> ha sido <strong>rechazado</strong> por problemas técnicos.</p>
                    <div style="background: #fff5f0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
                        <p><strong>Razón:</strong> {error}</p>
                    </div>
                    <p><strong>¿Qué puedo hacer?</strong></p>
                    <ol>
                        <li>Verifica que el documento esté legible y bien iluminado</li>
                        <li>Asegúrate de que sea un documento válido (Cédula de Identidad o Pasaporte)</li>
                        <li>Intenta nuevamente con una imagen de mejor calidad</li>
                    </ol>
                    <p>Si el problema persiste, contáctanos en <a href="mailto:support@homenannies.com">support@homenannies.com</a></p>
                    <br/>
                    <p>Saludos,<br/>Equipo Home Nannies</p>
                '''
            },
            {
                'name': 'ocr_needs_review',
                'template_type': 'ocr_needs_review',
                'subject': '🔍 Revisión manual necesaria - Home Nannies',
                'body_html': '''
                    <h2>Hola {user_name},</h2>
                    <p>Procesamos tu documento <strong>{document_id}</strong>, pero se requiere revisión manual.</p>
                    <div style="background: #fffbf0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f39c12;">
                        <p><strong>Estado:</strong> Pendiente de revisión manual</p>
                        <p><strong>Confianza:</strong> {confidence_score}</p>
                        <p><strong>RUT detectado:</strong> {rut}</p>
                    </div>
                    <p>Un miembro de nuestro equipo revisará tu documento pronto. Recibirás un email de confirmación cuando se complete la revisión.</p>
                    <p>Tiempo estimado: 24-48 horas</p>
                    <br/>
                    <p>Saludos,<br/>Equipo Home Nannies</p>
                '''
            },
            {
                'name': 'booking_confirmed',
                'template_type': 'booking_confirmed',
                'subject': '✅ Tu reserva ha sido confirmada - Home Nannies',
                'body_html': '''
                    <h2>¡Reserva confirmada!</h2>
                    <p>Hola {user_name},</p>
                    <p>Tu reserva <strong>#{booking_id}</strong> ha sido confirmada.</p>
                    <div style="background: #f0f9f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Detalles de la reserva:</strong></p>
                        <ul style="list-style: none;">
                            <li>📅 Fecha: {date}</li>
                            <li>⏰ Hora: {time}</li>
                            <li>👤 Cuidadora: {nanny_name}</li>
                        </ul>
                    </div>
                    <p>Por favor, confirma tu presencia 24 horas antes del evento.</p>
                    <br/>
                    <p>Saludos,<br/>Equipo Home Nannies</p>
                '''
            },
            {
                'name': 'booking_cancelled',
                'template_type': 'booking_cancelled',
                'subject': '❌ Tu reserva ha sido cancelada - Home Nannies',
                'body_html': '''
                    <h2>Reserva cancelada</h2>
                    <p>Hola {user_name},</p>
                    <p>Tu reserva <strong>#{booking_id}</strong> ha sido cancelada.</p>
                    <div style="background: #fff5f0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
                        <p><strong>Razón:</strong> {reason}</p>
                    </div>
                    <p>Si tienes preguntas sobre esta cancelación, por favor contáctanos.</p>
                    <br/>
                    <p>Saludos,<br/>Equipo Home Nannies</p>
                '''
            },
            {
                'name': 'verification_complete',
                'template_type': 'verification_complete',
                'subject': '✅ Verificación completada - Bienvenido a Home Nannies',
                'body_html': '''
                    <h2>¡Verificación completada!</h2>
                    <p>Hola {user_name},</p>
                    <p>¡Felicidades! Tu perfil ha sido completamente verificado.</p>
                    <div style="background: #f0f9f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p>✓ Email verificado</p>
                        <p>✓ Identidad verificada</p>
                        <p>✓ Perfil activo</p>
                    </div>
                    <p>Ahora tienes acceso completo a todas las funciones de Home Nannies.</p>
                    <p><a href="{frontend_url}/dashboard" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir a mi Dashboard</a></p>
                    <br/>
                    <p>Saludos,<br/>Equipo Home Nannies</p>
                '''
            },
            {
                'name': 'verification_failed',
                'template_type': 'verification_failed',
                'subject': '⚠️ Verificación no completada - Home Nannies',
                'body_html': '''
                    <h2>Problema con tu verificación</h2>
                    <p>Hola {user_name},</p>
                    <p>Lamentablemente, tu verificación no pudo completarse.</p>
                    <div style="background: #fff5f0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
                        <p><strong>Motivo:</strong> {reason}</p>
                    </div>
                    <p>Por favor intenta nuevamente o contáctanos para más información.</p>
                    <p>Correo de soporte: <a href="mailto:support@homenannies.com">support@homenannies.com</a></p>
                    <br/>
                    <p>Saludos,<br/>Equipo Home Nannies</p>
                '''
            },
        ]

        created_count = 0
        for template_data in templates:
            template, created = NotificationTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults={
                    'template_type': template_data['template_type'],
                    'subject': template_data['subject'],
                    'body_html': template_data['body_html'],
                    'is_active': True,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Plantilla creada: {template.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'~ Plantilla existente: {template.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n✓ {created_count} nuevas plantillas creadas')
        )
