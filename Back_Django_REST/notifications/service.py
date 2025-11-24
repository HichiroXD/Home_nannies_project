"""
Notification Service - Maneja envío de notificaciones
"""

import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.conf import settings
from .models import Notification, NotificationTemplate, NotificationPreference

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Servicio centralizado para enviar notificaciones
    """

    @staticmethod
    def send_ocr_notification(user, document_id, status, context=None):
        """
        Envía notificación sobre estado OCR
        
        Args:
            user: User instance
            document_id: ID del documento OCR
            status: 'approved', 'rejected', 'needs_review'
            context: Dict con datos adicionales (confidence_score, rut, etc)
        
        Returns:
            Notification instance or None if not sent
        """
        if context is None:
            context = {}

        # Mapear estado a template
        template_map = {
            'approved': 'ocr_approved',
            'rejected': 'ocr_rejected',
            'needs_review': 'ocr_needs_review',
        }

        template_name = template_map.get(status, 'ocr_approved')

        try:
            template = NotificationTemplate.objects.get(
                template_type=template_name,
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            logger.warning(f'Template {template_name} not found')
            return None

        # Preparar contexto
        notification_context = {
            'user_name': user.first_name or user.email,
            'document_id': document_id,
            'status': status,
            'timestamp': timezone.now().isoformat(),
        }
        notification_context.update(context)

        # Verificar preferencias
        try:
            preferences = user.notification_preference
            if not preferences.email_ocr_events:
                logger.info(f'User {user.email} has disabled OCR notifications')
                return None
            
            if preferences.is_in_quiet_hours():
                logger.info(f'User {user.email} is in quiet hours')
                # Aún crear la notificación, pero para luego
        except NotificationPreference.DoesNotExist:
            preferences = NotificationPreference.objects.create(user=user)

        # Crear notificación
        notification = Notification.objects.create(
            user=user,
            template=template,
            channel='email',
            subject=template.render_subject(notification_context),
            message=template.render_body(notification_context),
            recipient_email=user.email,
            related_document_id=document_id,
            context_data=notification_context,
            status='pending'
        )

        # Enviar email
        try:
            NotificationService.send_email(notification, notification_context)
            notification.mark_sent()
            logger.info(f'OCR notification sent to {user.email} for document {document_id}')
        except Exception as e:
            notification.mark_failed(str(e))
            logger.error(f'Failed to send OCR notification: {e}')

        return notification

    @staticmethod
    def send_booking_notification(user, booking_id, event_type, context=None):
        """
        Envía notificación sobre cambios en reservas
        
        Args:
            user: User instance
            booking_id: ID de la reserva
            event_type: 'confirmed', 'cancelled'
            context: Dict con datos adicionales
        
        Returns:
            Notification instance or None if not sent
        """
        if context is None:
            context = {}

        template_map = {
            'confirmed': 'booking_confirmed',
            'cancelled': 'booking_cancelled',
        }

        template_name = template_map.get(event_type, 'booking_confirmed')

        try:
            template = NotificationTemplate.objects.get(
                template_type=template_name,
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            logger.warning(f'Template {template_name} not found')
            return None

        notification_context = {
            'user_name': user.first_name or user.email,
            'booking_id': booking_id,
            'event_type': event_type,
            'timestamp': timezone.now().isoformat(),
        }
        notification_context.update(context)

        # Verificar preferencias
        try:
            preferences = user.notification_preference
            if not preferences.email_booking_events:
                return None
        except NotificationPreference.DoesNotExist:
            NotificationPreference.objects.create(user=user)

        notification = Notification.objects.create(
            user=user,
            template=template,
            channel='email',
            subject=template.render_subject(notification_context),
            message=template.render_body(notification_context),
            recipient_email=user.email,
            related_booking_id=booking_id,
            context_data=notification_context,
            status='pending'
        )

        try:
            NotificationService.send_email(notification, notification_context)
            notification.mark_sent()
            logger.info(f'Booking notification sent to {user.email} for booking {booking_id}')
        except Exception as e:
            notification.mark_failed(str(e))
            logger.error(f'Failed to send booking notification: {e}')

        return notification

    @staticmethod
    def send_verification_notification(user, status, context=None):
        """
        Envía notificación sobre verificación de usuario
        
        Args:
            user: User instance
            status: 'complete', 'failed'
            context: Dict con datos adicionales
        
        Returns:
            Notification instance or None if not sent
        """
        if context is None:
            context = {}

        template_map = {
            'complete': 'verification_complete',
            'failed': 'verification_failed',
        }

        template_name = template_map.get(status, 'verification_complete')

        try:
            template = NotificationTemplate.objects.get(
                template_type=template_name,
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            logger.warning(f'Template {template_name} not found')
            return None

        notification_context = {
            'user_name': user.first_name or user.email,
            'status': status,
            'timestamp': timezone.now().isoformat(),
        }
        notification_context.update(context)

        # Verificar preferencias
        try:
            preferences = user.notification_preference
            if not preferences.email_verification_events:
                return None
        except NotificationPreference.DoesNotExist:
            NotificationPreference.objects.create(user=user)

        notification = Notification.objects.create(
            user=user,
            template=template,
            channel='email',
            subject=template.render_subject(notification_context),
            message=template.render_body(notification_context),
            recipient_email=user.email,
            context_data=notification_context,
            status='pending'
        )

        try:
            NotificationService.send_email(notification, notification_context)
            notification.mark_sent()
            logger.info(f'Verification notification sent to {user.email}')
        except Exception as e:
            notification.mark_failed(str(e))
            logger.error(f'Failed to send verification notification: {e}')

        return notification

    @staticmethod
    def send_email(notification, context=None):
        """
        Envía email usando Django's mail backend
        
        Args:
            notification: Notification instance
            context: Dict con contexto adicional
        
        Raises:
            Exception: Si hay error al enviar
        """
        if context is None:
            context = {}

        subject = notification.subject
        message_html = notification.message
        recipient = notification.recipient_email

        try:
            # Crear email con versión HTML y text
            msg = EmailMultiAlternatives(
                subject=subject,
                body=NotificationService._html_to_text(message_html),
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient]
            )
            msg.attach_alternative(message_html, 'text/html')
            msg.send()
            logger.info(f'Email sent to {recipient}')
        except Exception as e:
            logger.error(f'Error sending email to {recipient}: {e}')
            raise

    @staticmethod
    def _html_to_text(html):
        """
        Convierte HTML a texto plano (versión simple)
        """
        import re
        # Remover tags HTML
        text = re.sub(r'<[^>]+>', '', html)
        # Remover múltiples espacios en blanco
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    @staticmethod
    def retry_failed_notifications(max_attempts=3):
        """
        Reintenta enviar notificaciones fallidas
        
        Args:
            max_attempts: Número máximo de intentos
        
        Returns:
            Dict con stats de reintento
        """
        failed_notifications = Notification.objects.filter(
            status='failed',
            attempts__lt=max_attempts
        )

        stats = {
            'total': failed_notifications.count(),
            'sent': 0,
            'failed': 0,
        }

        for notification in failed_notifications:
            try:
                NotificationService.send_email(notification)
                notification.mark_sent()
                stats['sent'] += 1
                logger.info(f'Retried notification {notification.id} successfully')
            except Exception as e:
                notification.mark_failed(str(e))
                stats['failed'] += 1
                logger.error(f'Retry failed for notification {notification.id}: {e}')

        logger.info(f'Retry notification stats: {stats}')
        return stats

    @staticmethod
    def get_user_notifications(user, status=None, limit=20):
        """
        Obtiene notificaciones de un usuario
        
        Args:
            user: User instance
            status: Filtrar por estado (opcional)
            limit: Número máximo de notificaciones
        
        Returns:
            QuerySet de notificaciones
        """
        query = Notification.objects.filter(user=user).order_by('-created_at')
        
        if status:
            query = query.filter(status=status)
        
        return query[:limit]

    @staticmethod
    def mark_notifications_as_read(user, notification_ids=None):
        """
        Marca notificaciones como leídas
        
        Args:
            user: User instance
            notification_ids: Lista de IDs (None = todas)
        
        Returns:
            Número de notificaciones marcadas
        """
        query = Notification.objects.filter(user=user)
        
        if notification_ids:
            query = query.filter(id__in=notification_ids)
        
        count = query.update(status='read', read_at=timezone.now())
        logger.info(f'Marked {count} notifications as read for {user.email}')
        return count
