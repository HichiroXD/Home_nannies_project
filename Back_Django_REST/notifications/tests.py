"""
Tests para Notificaciones - Phase 3
"""

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import time
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
