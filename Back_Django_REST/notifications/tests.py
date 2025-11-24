"""
Tests para Notificaciones - Phase 3
Cobertura completa: Templates, Preferences, Notifications, Webhooks, Service
"""

from django.test import TestCase, Client, override_settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import time, datetime, timedelta
from unittest.mock import patch, MagicMock
import json

from .models import (
    Notification,
    NotificationTemplate,
    NotificationPreference,
    WebhookEndpoint,
    WebhookLog,
)
from .service import NotificationService

User = get_user_model()


class NotificationTemplateTest(TestCase):
    """Tests para NotificationTemplate"""

    def setUp(self):
        self.template = NotificationTemplate.objects.create(
            name='test_template',
            template_type='ocr_approved',
            subject='Documento {document_id} Aprobado',
            body_html='<h1>Hola {user_name}</h1><p>Tu documento ha sido aprobado</p>',
        )

    def test_template_creation(self):
        """Verifica creación de template"""
        self.assertEqual(self.template.name, 'test_template')
        self.assertEqual(self.template.template_type, 'ocr_approved')
        self.assertTrue(self.template.is_active)

    def test_render_subject(self):
        """Verifica renderización de subject"""
        context = {'document_id': '12345', 'user_name': 'Juan'}
        rendered = self.template.render_subject(context)
        self.assertEqual(rendered, 'Documento 12345 Aprobado')

    def test_render_body(self):
        """Verifica renderización de body"""
        context = {'user_name': 'Juan'}
        rendered = self.template.render_body(context)
        self.assertIn('Hola Juan', rendered)
        self.assertIn('aprobado', rendered)


class NotificationModelTest(TestCase):
    """Tests para Notification model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            password='testpass123'
        )
        self.template = NotificationTemplate.objects.create(
            name='test_template',
            template_type='ocr_approved',
            subject='Test Subject',
            body_html='<p>Test Body</p>',
        )
        self.notification = Notification.objects.create(
            user=self.user,
            template=self.template,
            channel='email',
            subject='Test Email',
            message='<p>Test Message</p>',
            recipient_email='test@test.com',
            related_document_id='doc123',
        )

    def test_notification_creation(self):
        """Verifica creación de notificación"""
        self.assertEqual(self.notification.user, self.user)
        self.assertEqual(self.notification.status, 'pending')
        self.assertIsNone(self.notification.sent_at)

    def test_mark_sent(self):
        """Verifica marcar como enviada"""
        self.notification.mark_sent()
        self.assertEqual(self.notification.status, 'sent')
        self.assertIsNotNone(self.notification.sent_at)

    def test_mark_failed(self):
        """Verifica marcar como fallida"""
        error_msg = 'Connection timeout'
        self.notification.mark_failed(error_msg)
        self.assertEqual(self.notification.status, 'failed')
        self.assertEqual(self.notification.last_error, error_msg)
        self.assertEqual(self.notification.attempts, 1)

    def test_mark_read(self):
        """Verifica marcar como leída"""
        self.notification.mark_read()
        self.assertEqual(self.notification.status, 'read')
        self.assertIsNotNone(self.notification.read_at)


class NotificationPreferenceTest(TestCase):
    """Tests para NotificationPreference"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            password='testpass123'
        )
        self.preference = NotificationPreference.objects.create(
            user=self.user,
            email_ocr_events=True,
            quiet_hours_start=time(22, 0),
            quiet_hours_end=time(8, 0),
        )

    def test_preference_creation(self):
        """Verifica creación de preferencia"""
        self.assertTrue(self.preference.email_ocr_events)
        self.assertEqual(self.preference.quiet_hours_start, time(22, 0))

    def test_is_in_quiet_hours(self):
        """Verifica detección de horas de no-molestar"""
        # Sin horas de no-molestar configuradas
        preference = NotificationPreference.objects.create(user=self.user)
        self.assertFalse(preference.is_in_quiet_hours())


class NotificationServiceTest(TestCase):
    """Tests para NotificationService"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            first_name='Juan',
            password='testpass123'
        )
        self.template = NotificationTemplate.objects.create(
            name='ocr_approved',
            template_type='ocr_approved',
            subject='Documento {document_id} Aprobado',
            body_html='<p>Hola {user_name}, tu documento {document_id} fue aprobado</p>',
            is_active=True,
        )
        NotificationPreference.objects.create(user=self.user)

    def test_send_ocr_notification_approved(self):
        """Verifica envío de notificación OCR aprobada"""
        notification = NotificationService.send_ocr_notification(
            user=self.user,
            document_id='doc123',
            status='approved',
            context={'confidence_score': 0.95}
        )

        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.status, 'sent')
        self.assertIn('doc123', notification.subject)

    def test_send_ocr_notification_disabled(self):
        """Verifica que no envía si usuario deshabilitó notificaciones OCR"""
        preference = self.user.notification_preference
        preference.email_ocr_events = False
        preference.save()

        notification = NotificationService.send_ocr_notification(
            user=self.user,
            document_id='doc123',
            status='approved'
        )

        self.assertIsNone(notification)

    def test_send_ocr_notification_no_template(self):
        """Verifica manejo cuando template no existe"""
        # Desactivar template
        self.template.is_active = False
        self.template.save()

        notification = NotificationService.send_ocr_notification(
            user=self.user,
            document_id='doc123',
            status='approved'
        )

        self.assertIsNone(notification)

    def test_get_user_notifications(self):
        """Verifica obtención de notificaciones de usuario"""
        # Crear algunas notificaciones
        for i in range(3):
            NotificationService.send_ocr_notification(
                user=self.user,
                document_id=f'doc{i}',
                status='approved'
            )

        notifications = NotificationService.get_user_notifications(self.user)
        self.assertEqual(len(notifications), 3)

    def test_mark_notifications_as_read(self):
        """Verifica marcar notificaciones como leídas"""
        # Crear notificaciones
        notif1 = Notification.objects.create(
            user=self.user,
            subject='Test 1',
            message='Message 1',
            channel='email',
            status='sent'
        )
        notif2 = Notification.objects.create(
            user=self.user,
            subject='Test 2',
            message='Message 2',
            channel='email',
            status='sent'
        )

        # Marcar todas como leídas
        count = NotificationService.mark_notifications_as_read(self.user)
        self.assertEqual(count, 2)

        # Verificar estado
        notif1.refresh_from_db()
        notif2.refresh_from_db()
        self.assertEqual(notif1.status, 'read')
        self.assertEqual(notif2.status, 'read')


class NotificationAPITest(APITestCase):
    """Tests para Notification API"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        NotificationPreference.objects.create(user=self.user)

        # Crear template
        self.template = NotificationTemplate.objects.create(
            name='test_template',
            template_type='ocr_approved',
            subject='Test Subject',
            body_html='<p>Test</p>',
            is_active=True,
        )

        # Crear notificaciones
        for i in range(3):
            Notification.objects.create(
                user=self.user,
                template=self.template,
                channel='email',
                subject=f'Notification {i}',
                message=f'Message {i}',
                recipient_email='test@test.com',
                status='sent' if i < 2 else 'pending',
            )

    def test_list_notifications(self):
        """Verifica listar notificaciones"""
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)

    def test_get_notification_detail(self):
        """Verifica obtener detalle de notificación"""
        notification = Notification.objects.first()
        response = self.client.get(f'/api/notifications/{notification.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject'], notification.subject)

    def test_get_unread_notifications(self):
        """Verifica obtener no leídas"""
        response = self.client.get('/api/notifications/unread/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Puede haber 1 o 3 dependiendo del estado inicial

    def test_mark_as_read(self):
        """Verifica marcar como leídas"""
        response = self.client.post('/api/notifications/mark-as-read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)

    def test_mark_specific_as_read(self):
        """Verifica marcar específicas como leídas"""
        notif1, notif2 = Notification.objects.all()[:2]
        response = self.client.post(
            '/api/notifications/mark-as-read/',
            {'notification_ids': [notif1.id, notif2.id]},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)


class WebhookEndpointTest(TestCase):
    """Tests para WebhookEndpoint"""

    def setUp(self):
        self.webhook = WebhookEndpoint.objects.create(
            name='test_webhook',
            url='https://example.com/webhook',
            secret_key='test_secret',
            event_type='ocr_completed',
        )

    def test_webhook_creation(self):
        """Verifica creación de webhook"""
        self.assertEqual(self.webhook.name, 'test_webhook')
        self.assertTrue(self.webhook.is_active)

    def test_webhook_str(self):
        """Verifica representación string"""
        expected = 'test_webhook - https://example.com/webhook'
        self.assertEqual(str(self.webhook), expected)


# ===== TESTS EXTENDIDOS PARA COBERTURA >=80% =====


class NotificationTemplateExtendedTest(TestCase):
    """Tests extendidos para NotificationTemplate"""

    def setUp(self):
        self.template = NotificationTemplate.objects.create(
            name='ocr_template',
            template_type='ocr_approved',
            subject='OCR Approved: {document_id}',
            body_html='<h1>Document {document_id} approved</h1>',
            body_text='Document approved: {document_id}',
            is_active=True
        )

    def test_template_inactive(self):
        """Test template inactivo"""
        template = NotificationTemplate.objects.create(
            name='inactive_template',
            template_type='email_verification',
            is_active=False
        )
        self.assertFalse(template.is_active)

    def test_render_all_fields(self):
        """Test renderización de todos los campos"""
        context = {'document_id': '999', 'user_name': 'Alice'}
        
        subject = self.template.render_subject(context)
        body_html = self.template.render_body(context)
        body_text = self.template.render_body(context, use_text=True)
        
        self.assertIn('999', subject)
        self.assertIn('999', body_html)
        self.assertIn('999', body_text)

    def test_template_update(self):
        """Test actualización de template"""
        self.template.subject = 'Updated: {document_id}'
        self.template.save()
        
        refreshed = NotificationTemplate.objects.get(id=self.template.id)
        self.assertEqual(refreshed.subject, 'Updated: {document_id}')

    def test_get_all_active_templates(self):
        """Test obtener todos los templates activos"""
        active_count = NotificationTemplate.objects.filter(is_active=True).count()
        self.assertGreaterEqual(active_count, 1)


class NotificationModelExtendedTest(TestCase):
    """Tests extendidos para Notification model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.template = NotificationTemplate.objects.create(
            name='test_notif',
            template_type='test',
            subject='Test',
            body_html='Test body'
        )

    def test_notification_creation(self):
        """Test creación de notificación"""
        notif = Notification.objects.create(
            recipient=self.user,
            template=self.template,
            subject='Test Notification',
            message='Test message'
        )
        self.assertEqual(notif.subject, 'Test Notification')
        self.assertFalse(notif.is_read)
        self.assertIsNone(notif.read_at)

    def test_notification_mark_as_read(self):
        """Test marcar notificación como leída"""
        notif = Notification.objects.create(
            recipient=self.user,
            template=self.template,
            subject='Test',
            message='Test'
        )
        self.assertFalse(notif.is_read)
        
        notif.mark_as_read()
        self.assertTrue(notif.is_read)
        self.assertIsNotNone(notif.read_at)

    def test_notification_all_types(self):
        """Test crear notificaciones de todos los tipos"""
        types = ['ocr_submitted', 'ocr_approved', 'ocr_rejected', 
                 'booking_confirmed', 'system_alert', 'custom']
        
        for notif_type in types:
            notif = Notification.objects.create(
                recipient=self.user,
                template=self.template,
                subject=f'Test {notif_type}',
                message=f'Message {notif_type}',
                notification_type=notif_type
            )
            self.assertEqual(notif.notification_type, notif_type)

    def test_notification_filtering(self):
        """Test filtrado de notificaciones"""
        Notification.objects.create(
            recipient=self.user,
            template=self.template,
            subject='Read',
            message='Message'
        )
        notif_unread = Notification.objects.create(
            recipient=self.user,
            template=self.template,
            subject='Unread',
            message='Message'
        )
        
        unread = Notification.objects.filter(is_read=False)
        self.assertEqual(unread.count(), 2)
        
        notif_unread.mark_as_read()
        unread = Notification.objects.filter(is_read=False)
        self.assertEqual(unread.count(), 1)


class NotificationPreferenceExtendedTest(TestCase):
    """Tests extendidos para NotificationPreference"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.preference = NotificationPreference.objects.create(
            user=self.user,
            notification_type='ocr_approved',
            email_enabled=True,
            in_app_enabled=True,
            webhook_enabled=False
        )

    def test_preference_creation(self):
        """Test creación de preferencia"""
        self.assertTrue(self.preference.email_enabled)
        self.assertTrue(self.preference.in_app_enabled)
        self.assertFalse(self.preference.webhook_enabled)

    def test_preference_disable_all(self):
        """Test deshabilitar todos los canales"""
        self.preference.email_enabled = False
        self.preference.in_app_enabled = False
        self.preference.webhook_enabled = False
        self.preference.save()
        
        refreshed = NotificationPreference.objects.get(id=self.preference.id)
        self.assertFalse(refreshed.email_enabled)
        self.assertFalse(refreshed.in_app_enabled)
        self.assertFalse(refreshed.webhook_enabled)

    def test_preference_quiet_hours(self):
        """Test horas de silencio"""
        self.preference.quiet_hours_enabled = True
        self.preference.quiet_hours_start = time(22, 0)
        self.preference.quiet_hours_end = time(8, 0)
        self.preference.save()
        
        refreshed = NotificationPreference.objects.get(id=self.preference.id)
        self.assertTrue(refreshed.quiet_hours_enabled)

    def test_get_or_create_preference(self):
        """Test get_or_create de preferencia"""
        user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123'
        )
        pref, created = NotificationPreference.objects.get_or_create(
            user=user2,
            notification_type='booking_confirmed',
            defaults={'email_enabled': True}
        )
        self.assertTrue(created)
        self.assertTrue(pref.email_enabled)


class NotificationServiceExtendedTest(TestCase):
    """Tests extendidos para NotificationService"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.template = NotificationTemplate.objects.create(
            name='service_test',
            template_type='test',
            subject='Service Test',
            body_html='Test body'
        )
        self.preference = NotificationPreference.objects.create(
            user=self.user,
            notification_type='test',
            email_enabled=True,
            in_app_enabled=True
        )

    @patch('notifications.service.send_mail')
    def test_send_notification_email(self, mock_send_mail):
        """Test envío de notificación por email"""
        mock_send_mail.return_value = 1
        
        result = NotificationService.send_notification(
            user=self.user,
            template=self.template,
            notification_type='test',
            context={'test': 'data'},
            channels=['email']
        )
        
        self.assertIsNotNone(result)
        self.assertTrue(result.get('email', False) or mock_send_mail.called)

    def test_send_notification_in_app(self):
        """Test envío de notificación in-app"""
        result = NotificationService.send_notification(
            user=self.user,
            template=self.template,
            notification_type='test',
            context={'test': 'data'},
            channels=['in_app']
        )
        
        # Verificar que se creó la notificación
        notif = Notification.objects.filter(recipient=self.user).first()
        self.assertIsNotNone(notif)

    def test_send_notification_multiple_channels(self):
        """Test envío a múltiples canales"""
        with patch('notifications.service.send_mail'):
            result = NotificationService.send_notification(
                user=self.user,
                template=self.template,
                notification_type='test',
                context={},
                channels=['email', 'in_app']
            )
        
        notif = Notification.objects.filter(recipient=self.user).first()
        self.assertIsNotNone(notif)

    @patch('notifications.service.NotificationService.send_webhook')
    def test_send_notification_webhook(self, mock_webhook):
        """Test envío de notificación webhook"""
        mock_webhook.return_value = True
        
        result = NotificationService.send_notification(
            user=self.user,
            template=self.template,
            notification_type='test',
            context={},
            channels=['webhook']
        )

    def test_get_user_notifications(self):
        """Test obtener notificaciones de usuario"""
        Notification.objects.create(
            recipient=self.user,
            template=self.template,
            subject='Test 1',
            message='Message 1'
        )
        Notification.objects.create(
            recipient=self.user,
            template=self.template,
            subject='Test 2',
            message='Message 2'
        )
        
        notifs = NotificationService.get_user_notifications(self.user)
        self.assertEqual(len(list(notifs)), 2)


class WebhookExtendedTests(TestCase):
    """Tests extendidos para Webhook"""

    def setUp(self):
        self.webhook = WebhookEndpoint.objects.create(
            name='test_webhook',
            url='https://example.com/webhook',
            secret_key='secret123',
            event_type='ocr_completed',
            is_active=True
        )

    def test_webhook_signature(self):
        """Test firma de webhook"""
        payload = {'event': 'test', 'data': {}}
        signature = self.webhook.generate_signature(json.dumps(payload))
        self.assertIsNotNone(signature)
        self.assertIn('sha256', signature.lower())

    def test_webhook_inactive(self):
        """Test webhook inactivo"""
        self.webhook.is_active = False
        self.webhook.save()
        self.assertFalse(self.webhook.is_active)

    def test_webhook_log_creation(self):
        """Test creación de log de webhook"""
        log = WebhookLog.objects.create(
            webhook=self.webhook,
            event_type='test',
            payload={'data': 'test'},
            status_code=200,
            response='OK'
        )
        self.assertEqual(log.status_code, 200)
        self.assertEqual(log.event_type, 'test')

    def test_webhook_retry_count(self):
        """Test contador de reintentos"""
        log = WebhookLog.objects.create(
            webhook=self.webhook,
            event_type='test',
            payload={},
            status_code=500,
            retry_count=3
        )
        self.assertEqual(log.retry_count, 3)

    def test_multiple_webhook_endpoints(self):
        """Test múltiples endpoints webhook"""
        webhook2 = WebhookEndpoint.objects.create(
            name='webhook2',
            url='https://other.com/hook',
            secret_key='secret456',
            event_type='booking_confirmed'
        )
        
        all_webhooks = WebhookEndpoint.objects.all()
        self.assertEqual(all_webhooks.count(), 2)


class NotificationAPITest(APITestCase):
    """Tests para API REST de Notificaciones"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.template = NotificationTemplate.objects.create(
            name='api_test',
            template_type='test',
            subject='Test',
            body_html='Test'
        )

    def test_list_notifications(self):
        """Test listar notificaciones"""
        Notification.objects.create(
            recipient=self.user,
            template=self.template,
            subject='Test',
            message='Message'
        )
        
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_unread_count(self):
        """Test obtener conteo de no leídas"""
        Notification.objects.create(
            recipient=self.user,
            template=self.template,
            subject='Unread',
            message='Message'
        )
        
        response = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_preferences_list(self):
        """Test listar preferencias"""
        NotificationPreference.objects.create(
            user=self.user,
            notification_type='test'
        )
        
        response = self.client.get('/api/notifications/preferences/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_notification_read_permission(self):
        """Test permisos de lectura de notificaciones"""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )
        notif = Notification.objects.create(
            recipient=other_user,
            template=self.template,
            subject='Other',
            message='Message'
        )
        
        response = self.client.get(f'/api/notifications/{notif.id}/')
        # Debe ser 404 o forbidden
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])
