from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
import logging
from django.utils import timezone
from datetime import datetime
from core.mixins import RoleBasedQuerysetMixin
from reports.exporters import CSVExporter, PDFExporter, ExcelExporter
from .models import Booking, Availability
from .serializer import BookingSerializer, AvailabilitySerializer, NotificationSerializer
from .utils import PaymentReportGenerator
from .constants import (
    BOOKING_STATUS_CONFIRMED,
    BOOKING_STATUS_REJECTED,
    BOOKING_STATUS_CANCELLED,
    BOOKING_STATUS_COMPLETED,
    BOOKING_MESSAGES
)

logger = logging.getLogger(__name__)

# --- BOOKING ---
class BookingListCreateView(RoleBasedQuerysetMixin, generics.ListCreateAPIView):
    """
    Vista para listar y crear reservas.
    
    GET:
    - Padres ven sus propias reservas
    - Niñeras ven las reservas que han recibido
    
    POST:
    - Crea una nueva reserva
    - Notifica automáticamente a la niñera
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Booking.objects.all()
    
    # Configuración del mixin
    parent_filter_field = 'parent'
    nanny_filter_field = 'nanny'
    select_related_fields = ('parent', 'nanny')

    def perform_create(self, serializer):
        """
        Crea una nueva reserva y notifica a la niñera.
        
        Args:
            serializer: BookingSerializer con datos validados
            
        Side effects:
            - Guarda booking con parent = usuario autenticado
            - Crea notificación para la niñera usando NotificationService
            - Registra evento en logs
        """
        from .services import NotificationService
        
        booking = serializer.save(parent=self.request.user)
        
        # Crear notificación para la niñera usando el servicio
        NotificationService.notify_new_booking(booking, self.request.user)
        
        # Log booking creation
        logger.info(
            f"booking_created id={booking.id} parent={booking.parent.username} "
            f"nanny={booking.nanny.username} start={booking.start_time} end={booking.end_time}"
        )


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para gestionar una reserva específica.
    
    Endpoints:
        GET: Obtiene detalles de la reserva
        PATCH/PUT: Actualiza la reserva
        DELETE: Elimina la reserva
        
    Permissions:
        - Usuario debe estar autenticado
        - Solo el creador (parent) o destinatario (nanny) pueden acceder
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


# --- AVAILABILITY ---
class AvailabilityListCreateView(generics.ListCreateAPIView):
    """
    Vista para que las niñeras gestionen su disponibilidad.
    
    GET: Lista la disponibilidad de la niñera autenticada
    POST: Crea un nuevo slot de disponibilidad
    """
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Si se pasa el parámetro 'nanny' en la querystring, devolver la disponibilidad
        # de esa niñera (uso de lectura pública por usuarios autenticados).
        nanny_id = self.request.query_params.get('nanny')
        if nanny_id:
            return Availability.objects.filter(nanny__id=nanny_id).select_related('nanny')
        return Availability.objects.filter(nanny=self.request.user).select_related('nanny')

    def perform_create(self, serializer):
        serializer.save(nanny=self.request.user)
        # Log availability created
        obj = serializer.instance
        logger.info(f"availability_created id={obj.id} nanny={obj.nanny.username} day={obj.day} start={obj.start_time} end={obj.end_time}")

class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para actualizar o eliminar un slot de disponibilidad."""
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.filter(nanny=self.request.user)


# --- NOTIFICATION ---
class NotificationListView(generics.ListAPIView):
    """
    Vista para listar las notificaciones del usuario autenticado.
    Ordenadas por fecha de creación (más recientes primero).
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all().order_by('-created_at')

class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para obtener, actualizar o eliminar una notificación específica."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()


# --- ACCIONES PERSONALIZADAS ---

def _update_booking_status(booking, new_status, request_user, recipient_role):
    """
    Actualiza el estado de una reserva y crea notificación.
    
    Args:
        booking: Objeto Booking a actualizar
        new_status: Nuevo estado ('confirmed', 'rejected', 'cancelled', 'completed')
        request_user: Usuario que realiza la acción
        recipient_role: 'parent' o 'nanny' (destinatario de la notificación)
    """
    from .services import NotificationService
    
    booking.status = new_status
    booking.save()
    
    # Determinar el destinatario de la notificación
    recipient = booking.parent if recipient_role == 'parent' else booking.nanny
    
    # Crear notificación usando el servicio
    NotificationService.notify_booking_status_change(
        booking=booking,
        new_status=new_status,
        notifier=request_user,
        recipient=recipient
    )
    
    logger.info(f"booking_status_updated id={booking.id} status={new_status} by={request_user.username}")


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_booking(request, pk):
    """Aceptar una reserva (solo la niñera)."""
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": BOOKING_MESSAGES['NOT_FOUND']},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, BOOKING_STATUS_CONFIRMED, request.user, 'parent')
    return Response({"message": BOOKING_MESSAGES['ACCEPTED']}, status=status.HTTP_200_OK)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def reject_booking(request, pk):
    """Rechazar una reserva (solo la niñera)."""
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": BOOKING_MESSAGES['NOT_FOUND']},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, BOOKING_STATUS_REJECTED, request.user, 'parent')
    return Response({"message": BOOKING_MESSAGES['REJECTED']}, status=status.HTTP_200_OK)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, pk):
    """Cancelar una reserva (solo el padre/madre)."""
    try:
        booking = Booking.objects.get(pk=pk, parent=request.user)
    except Booking.DoesNotExist:
        return Response({"error": BOOKING_MESSAGES['NOT_FOUND']},
                        status=status.HTTP_404_NOT_FOUND)

    _update_booking_status(booking, BOOKING_STATUS_CANCELLED, request.user, 'nanny')
    return Response({"message": BOOKING_MESSAGES['CANCELLED']}, status=status.HTTP_200_OK)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def complete_booking(request, pk):
    """Marcar una reserva como completada (solo la niñera)."""
    try:
        booking = Booking.objects.get(pk=pk, nanny=request.user)
    except Booking.DoesNotExist:
        return Response({"error": BOOKING_MESSAGES['NOT_FOUND']},
                        status=status.HTTP_404_NOT_FOUND)
    
    # Validar que la reserva haya terminado
    now = timezone.now()
    if booking.end_time > now:
        time_remaining = booking.end_time - now
        hours = int(time_remaining.total_seconds() // 3600)
        minutes = int((time_remaining.total_seconds() % 3600) // 60)
        return Response(
            {
                "error": f"No puedes completar esta reserva aún. Faltan {hours} horas y {minutes} minutos para que termine el servicio.",
                "end_time": booking.end_time.isoformat(),
                "can_complete_at": booking.end_time.isoformat()
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    _update_booking_status(booking, BOOKING_STATUS_COMPLETED, request.user, 'parent')
    return Response({"message": BOOKING_MESSAGES['COMPLETED']}, status=status.HTTP_200_OK)


# --- PAYMENT REPORTS ---
class PaymentReportView(APIView):
    """
    Vista para generar reportes de pagos para padres.
    
    GET /api/bookings/payment-report/?format=csv&start_date=2026-01-01&end_date=2026-12-31
    
    Query params:
    - format: csv, pdf, excel (default: csv)
    - start_date: YYYY-MM-DD (optional)
    - end_date: YYYY-MM-DD (optional)
    - nanny_id: ID de niñera específica (optional)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Generar reporte de pagos",
        description="Genera un reporte de pagos en formato CSV, PDF o Excel para el padre autenticado",
        parameters=[
            {
                'name': 'format',
                'in': 'query',
                'description': 'Formato del reporte: csv, pdf, excel',
                'required': False,
                'schema': {'type': 'string', 'enum': ['csv', 'pdf', 'excel']}
            },
            {
                'name': 'start_date',
                'in': 'query',
                'description': 'Fecha de inicio (YYYY-MM-DD)',
                'required': False,
                'schema': {'type': 'string', 'format': 'date'}
            },
            {
                'name': 'end_date',
                'in': 'query',
                'description': 'Fecha de fin (YYYY-MM-DD)',
                'required': False,
                'schema': {'type': 'string', 'format': 'date'}
            },
            {
                'name': 'nanny_id',
                'in': 'query',
                'description': 'ID de niñera específica',
                'required': False,
                'schema': {'type': 'integer'}
            }
        ]
    )
    def get(self, request):
        # Validar que el usuario es un padre
        user = request.user
        if not hasattr(user, 'parentprofile'):
            return Response(
                {"error": "Solo los padres pueden generar reportes de pagos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener parámetros
        format_type = request.query_params.get('format', 'csv').lower()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        nanny_id = request.query_params.get('nanny_id')
        
        # Validar formato
        if format_type not in ['csv', 'pdf', 'excel']:
            return Response(
                {"error": "Formato inválido. Use: csv, pdf o excel"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filtrar bookings del padre
        bookings = Booking.objects.filter(parent=user).select_related('nanny', 'nanny__nannyprofile')
        
        # Aplicar filtros opcionales
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                bookings = bookings.filter(start_time__gte=start_dt)
            except ValueError:
                return Response(
                    {"error": "Formato de fecha inválido para start_date. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                # Agregar un día para incluir el end_date completo
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
                bookings = bookings.filter(start_time__lte=end_dt)
            except ValueError:
                return Response(
                    {"error": "Formato de fecha inválido para end_date. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if nanny_id:
            bookings = bookings.filter(nanny_id=nanny_id)
        
        # Ordenar por fecha
        bookings = bookings.order_by('-start_time')
        
        if not bookings.exists():
            return Response(
                {"error": "No se encontraron registros para generar el reporte"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Preparar datos
        data = PaymentReportGenerator.prepare_payment_data(bookings)
        headers = PaymentReportGenerator.get_headers()
        
        # Generar título
        parent_name = user.get_full_name() or user.username
        title = PaymentReportGenerator.generate_title(
            parent_name,
            start_date,
            end_date
        )
        
        # Generar nombre de archivo
        date_str = datetime.now().strftime('%Y%m%d')
        filename_base = f"reporte_pagos_{date_str}"
        
        # Generar reporte según formato
        try:
            if format_type == 'csv':
                filename = f"{filename_base}.csv"
                return CSVExporter.export(data, headers, filename)
            
            elif format_type == 'pdf':
                filename = f"{filename_base}.pdf"
                return PDFExporter.export(data, headers, title, filename)
            
            elif format_type == 'excel':
                filename = f"{filename_base}.xlsx"
                return ExcelExporter.export(data, headers, title, filename, sheet_name="Pagos")
        
        except Exception as e:
            logger.error(f"Error generando reporte: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al generar el reporte. Intente nuevamente."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Favorites have been moved to the `favorites` app; use /api/favorites/ endpoints.