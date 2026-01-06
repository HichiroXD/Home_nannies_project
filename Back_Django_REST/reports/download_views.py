"""
Download Views - Sistema de descarga de reportes refactorizado
Vista simple y directa para descarga de archivos
"""
import logging
from datetime import datetime
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from bookings.models import Booking
from django.contrib.auth import get_user_model
from .exporters import CSVExporter, PDFExporter, ExcelExporter
from .admin_reports import BookingReportGenerator, UserReportGenerator, PaymentReportGenerator

User = get_user_model()
logger = logging.getLogger(__name__)


class SimpleBookingsDownloadView(APIView):
    """
    Vista ultra-simple para descargar reportes de bookings
    GET /api/reports/download/bookings/?format=csv
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Genera y descarga reporte de reservas"""
        logger.info(f"🎯 SimpleBookingsDownloadView - Usuario: {request.user.username}")
        
        try:
            # Parámetros
            format_type = request.GET.get('format', 'csv').lower()
            logger.info(f"   Formato solicitado: {format_type}")
            
            # Validar formato
            if format_type not in ['csv', 'pdf', 'excel']:
                return Response(
                    {"error": "Formato inválido. Use: csv, pdf o excel"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener bookings
            bookings = Booking.objects.all().select_related(
                'parent', 'nanny', 'nanny__nanny_profile'
            ).order_by('-start_time')[:100]  # Límite inicial
            
            logger.info(f"   Total bookings: {bookings.count()}")
            
            # Preparar datos
            data = BookingReportGenerator.prepare_booking_data(bookings)
            headers = BookingReportGenerator.get_headers()
            title = f"Reporte de Reservas - {datetime.now().strftime('%Y-%m-%d')}"
            filename_base = f"reservas_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Generar archivo
            if format_type == 'csv':
                response = CSVExporter.export(data, headers, f"{filename_base}.csv")
            elif format_type == 'pdf':
                response = PDFExporter.export(data, headers, title, f"{filename_base}.pdf")
            elif format_type == 'excel':
                response = ExcelExporter.export(
                    data, headers, title, f"{filename_base}.xlsx", "Reservas"
                )
            
            logger.info(f"✅ Reporte generado exitosamente: {format_type}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Error generando reporte: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Error al generar reporte: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SimpleUsersDownloadView(APIView):
    """
    Vista ultra-simple para descargar reportes de usuarios
    GET /api/reports/download/users/?format=csv
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Genera y descarga reporte de usuarios"""
        logger.info(f"🎯 SimpleUsersDownloadView - Usuario: {request.user.username}")
        
        try:
            format_type = request.GET.get('format', 'csv').lower()
            
            if format_type not in ['csv', 'pdf', 'excel']:
                return Response(
                    {"error": "Formato inválido"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener usuarios
            users = User.objects.all().select_related('nanny_profile', 'parent_profile')
            data = UserReportGenerator.prepare_user_data(users)
            headers = UserReportGenerator.get_headers()
            title = f"Reporte de Usuarios - {datetime.now().strftime('%Y-%m-%d')}"
            filename_base = f"usuarios_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Generar
            if format_type == 'csv':
                response = CSVExporter.export(data, headers, f"{filename_base}.csv")
            elif format_type == 'pdf':
                response = PDFExporter.export(data, headers, title, f"{filename_base}.pdf")
            else:
                response = ExcelExporter.export(
                    data, headers, title, f"{filename_base}.xlsx", "Usuarios"
                )
            
            logger.info(f"✅ Reporte usuarios generado: {format_type}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Error: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SimplePaymentsDownloadView(APIView):
    """
    Vista ultra-simple para descargar reportes de pagos
    GET /api/reports/download/payments/?format=csv
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Genera y descarga reporte de pagos"""
        logger.info(f"🎯 SimplePaymentsDownloadView - Usuario: {request.user.username}")
        
        try:
            format_type = request.GET.get('format', 'csv').lower()
            
            if format_type not in ['csv', 'pdf', 'excel']:
                return Response(
                    {"error": "Formato inválido"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener bookings completados (con pagos)
            bookings = Booking.objects.filter(
                status='completed'
            ).select_related('parent', 'nanny')
            
            data = PaymentReportGenerator.prepare_payment_data(bookings)
            headers = PaymentReportGenerator.get_headers()
            title = f"Reporte de Pagos - {datetime.now().strftime('%Y-%m-%d')}"
            filename_base = f"pagos_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Generar
            if format_type == 'csv':
                response = CSVExporter.export(data, headers, f"{filename_base}.csv")
            elif format_type == 'pdf':
                response = PDFExporter.export(data, headers, title, f"{filename_base}.pdf")
            else:
                response = ExcelExporter.export(
                    data, headers, title, f"{filename_base}.xlsx", "Pagos"
                )
            
            logger.info(f"✅ Reporte pagos generado: {format_type}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Error: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
