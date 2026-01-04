"""
Report generator utilities for bookings module.
"""
from datetime import datetime
from typing import List, Dict, Any
from django.db.models import QuerySet
from ..models import Booking


class PaymentReportGenerator:
    """Generate payment reports for parents."""
    
    @staticmethod
    def prepare_payment_data(bookings: QuerySet) -> List[Dict[str, Any]]:
        """
        Prepare booking data for payment reports.
        
        Args:
            bookings: QuerySet of Booking objects
            
        Returns:
            List of dictionaries with formatted payment data
        """
        data = []
        
        for booking in bookings:
            # Calculate duration in hours
            duration = (booking.end_time - booking.start_time).total_seconds() / 3600
            
            # Estimate payment (this should come from a payment model in production)
            # For now, we'll use a placeholder calculation
            hourly_rate = getattr(booking.nanny, 'hourly_rate', 0)
            if hasattr(booking.nanny, 'nannyprofile'):
                hourly_rate = booking.nanny.nannyprofile.hourly_rate or 0
            
            estimated_amount = duration * hourly_rate
            
            row = {
                'ID Reserva': f'#{booking.id}',
                'Fecha': booking.start_time.strftime('%d/%m/%Y'),
                'Hora Inicio': booking.start_time.strftime('%H:%M'),
                'Hora Fin': booking.end_time.strftime('%H:%M'),
                'Niñera': booking.nanny.get_full_name() or booking.nanny.username,
                'Duración (hrs)': f'{duration:.2f}',
                'Tarifa/Hora': f'${hourly_rate:,.0f}',
                'Monto Total': f'${estimated_amount:,.0f}',
                'Estado': booking.get_status_display(),
                'Creado': booking.created_at.strftime('%d/%m/%Y %H:%M'),
            }
            data.append(row)
        
        return data
    
    @staticmethod
    def get_headers() -> List[str]:
        """Get headers for payment reports."""
        return [
            'ID Reserva',
            'Fecha',
            'Hora Inicio',
            'Hora Fin',
            'Niñera',
            'Duración (hrs)',
            'Tarifa/Hora',
            'Monto Total',
            'Estado',
            'Creado'
        ]
    
    @staticmethod
    def generate_title(parent_name: str, start_date: str = None, end_date: str = None) -> str:
        """Generate report title."""
        title = f"Reporte de Pagos - {parent_name}"
        
        if start_date and end_date:
            title += f"\nPeriodo: {start_date} - {end_date}"
        elif start_date:
            title += f"\nDesde: {start_date}"
        elif end_date:
            title += f"\nHasta: {end_date}"
        
        return title
