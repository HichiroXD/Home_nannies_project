"""
Admin report generators for different modules.
"""
from datetime import datetime
from typing import List, Dict, Any
from django.db.models import QuerySet, Count, Q, Avg, Sum
from django.contrib.auth import get_user_model
from bookings.models import Booking
from nannies.models import NannyProfile
from parents.models import ParentProfile

User = get_user_model()


class BookingReportGenerator:
    """Generate booking reports for administrators."""
    
    @staticmethod
    def prepare_booking_data(bookings: QuerySet) -> List[Dict[str, Any]]:
        """
        Prepare booking data for admin reports.
        
        Args:
            bookings: QuerySet of Booking objects
            
        Returns:
            List of dictionaries with formatted booking data
        """
        data = []
        
        for booking in bookings:
            duration = (booking.end_time - booking.start_time).total_seconds() / 3600
            
            # Get hourly rate
            hourly_rate = 0
            if hasattr(booking.nanny, 'nanny_profile'):
                hourly_rate = booking.nanny.nanny_profile.hourly_rate or 0
            
            estimated_amount = duration * hourly_rate
            
            row = {
                'ID': booking.id,
                'Padre': booking.parent.get_full_name() or booking.parent.username,
                'Email Padre': booking.parent.email,
                'Niñera': booking.nanny.get_full_name() or booking.nanny.username,
                'Email Niñera': booking.nanny.email,
                'Fecha': booking.start_time.strftime('%d/%m/%Y'),
                'Hora Inicio': booking.start_time.strftime('%H:%M'),
                'Hora Fin': booking.end_time.strftime('%H:%M'),
                'Duración (hrs)': f'{duration:.2f}',
                'Tarifa/Hora': f'${hourly_rate:,.0f}',
                'Monto Estimado': f'${estimated_amount:,.0f}',
                'Estado': booking.get_status_display(),
                'Creado': booking.created_at.strftime('%d/%m/%Y %H:%M'),
                'Actualizado': booking.updated_at.strftime('%d/%m/%Y %H:%M'),
            }
            data.append(row)
        
        return data
    
    @staticmethod
    def get_headers() -> List[str]:
        """Get headers for booking reports."""
        return [
            'ID',
            'Padre',
            'Email Padre',
            'Niñera',
            'Email Niñera',
            'Fecha',
            'Hora Inicio',
            'Hora Fin',
            'Duración (hrs)',
            'Tarifa/Hora',
            'Monto Estimado',
            'Estado',
            'Creado',
            'Actualizado',
        ]
    
    @staticmethod
    def get_summary_stats(bookings: QuerySet) -> Dict[str, Any]:
        """Get summary statistics for bookings."""
        total = bookings.count()
        by_status = bookings.values('status').annotate(count=Count('id'))
        
        return {
            'total': total,
            'by_status': list(by_status),
            'pending': bookings.filter(status='pending').count(),
            'confirmed': bookings.filter(status='confirmed').count(),
            'completed': bookings.filter(status='completed').count(),
            'cancelled': bookings.filter(status='cancelled').count(),
            'rejected': bookings.filter(status='rejected').count(),
        }


class UserReportGenerator:
    """Generate user reports for administrators."""
    
    @staticmethod
    def prepare_user_data(users: QuerySet) -> List[Dict[str, Any]]:
        """
        Prepare user data for admin reports.
        
        Args:
            users: QuerySet of User objects
            
        Returns:
            List of dictionaries with formatted user data
        """
        data = []
        
        for user in users:
            # Determine roles
            roles = []
            if hasattr(user, 'nanny_profile'):
                roles.append('Niñera')
            if hasattr(user, 'parentprofile'):
                roles.append('Padre/Madre')
            if user.is_staff:
                roles.append('Admin')
            
            # Verification status
            verified = 'No'
            if hasattr(user, 'nanny_profile'):
                verified = 'Sí' if user.nanny_profile.is_verified else 'No'
            
            # Activity stats
            bookings_made = 0
            bookings_received = 0
            if hasattr(user, 'parentprofile'):
                bookings_made = user.bookings_made.count()
            if hasattr(user, 'nanny_profile'):
                bookings_received = user.bookings_received.count()
            
            row = {
                'ID': user.id,
                'Usuario': user.username,
                'Nombre': user.get_full_name() or '-',
                'Email': user.email,
                'Roles': ', '.join(roles),
                'Verificado': verified,
                'Reservas Hechas': bookings_made,
                'Reservas Recibidas': bookings_received,
                'Activo': 'Sí' if user.is_active else 'No',
                'Staff': 'Sí' if user.is_staff else 'No',
                'Fecha Registro': user.date_joined.strftime('%d/%m/%Y %H:%M'),
                'Último Login': user.last_login.strftime('%d/%m/%Y %H:%M') if user.last_login else '-',
            }
            data.append(row)
        
        return data
    
    @staticmethod
    def get_headers() -> List[str]:
        """Get headers for user reports."""
        return [
            'ID',
            'Usuario',
            'Nombre',
            'Email',
            'Roles',
            'Verificado',
            'Reservas Hechas',
            'Reservas Recibidas',
            'Activo',
            'Staff',
            'Fecha Registro',
            'Último Login',
        ]
    
    @staticmethod
    def get_summary_stats(users: QuerySet) -> Dict[str, Any]:
        """Get summary statistics for users."""
        total = users.count()
        
        # Count by role
        nannies = NannyProfile.objects.filter(user__in=users).count()
        parents = ParentProfile.objects.filter(user__in=users).count()
        admins = users.filter(is_staff=True).count()
        
        # Verification stats
        verified_nannies = NannyProfile.objects.filter(
            user__in=users, is_verified=True
        ).count()
        
        return {
            'total': total,
            'active': users.filter(is_active=True).count(),
            'inactive': users.filter(is_active=False).count(),
            'nannies': nannies,
            'parents': parents,
            'admins': admins,
            'verified_nannies': verified_nannies,
        }


class PaymentReportGenerator:
    """Generate payment reports for administrators."""
    
    @staticmethod
    def prepare_payment_data(bookings: QuerySet) -> List[Dict[str, Any]]:
        """
        Prepare payment data for admin reports (based on completed bookings).
        
        Args:
            bookings: QuerySet of Booking objects
            
        Returns:
            List of dictionaries with formatted payment data
        """
        data = []
        
        for booking in bookings:
            duration = (booking.end_time - booking.start_time).total_seconds() / 3600
            
            # Get hourly rate
            hourly_rate = 0
            if hasattr(booking.nanny, 'nanny_profile'):
                hourly_rate = booking.nanny.nanny_profile.hourly_rate or 0
            
            total_amount = duration * hourly_rate
            
            # Platform commission (example: 15%)
            commission_rate = 0.15
            commission = total_amount * commission_rate
            nanny_amount = total_amount - commission
            
            row = {
                'ID Reserva': booking.id,
                'Fecha Servicio': booking.start_time.strftime('%d/%m/%Y'),
                'Padre': booking.parent.get_full_name() or booking.parent.username,
                'Niñera': booking.nanny.get_full_name() or booking.nanny.username,
                'Duración (hrs)': f'{duration:.2f}',
                'Tarifa/Hora': f'${hourly_rate:,.0f}',
                'Monto Total': f'${total_amount:,.0f}',
                'Comisión (15%)': f'${commission:,.0f}',
                'Pago a Niñera': f'${nanny_amount:,.0f}',
                'Estado': booking.get_status_display(),
                'Fecha Completado': booking.updated_at.strftime('%d/%m/%Y %H:%M') if booking.status == 'completed' else '-',
            }
            data.append(row)
        
        return data
    
    @staticmethod
    def get_headers() -> List[str]:
        """Get headers for payment reports."""
        return [
            'ID Reserva',
            'Fecha Servicio',
            'Padre',
            'Niñera',
            'Duración (hrs)',
            'Tarifa/Hora',
            'Monto Total',
            'Comisión (15%)',
            'Pago a Niñera',
            'Estado',
            'Fecha Completado',
        ]
    
    @staticmethod
    def get_summary_stats(bookings: QuerySet) -> Dict[str, Any]:
        """Get summary statistics for payments."""
        total_bookings = bookings.count()
        
        # Calculate totals
        total_revenue = 0
        total_commission = 0
        
        for booking in bookings:
            duration = (booking.end_time - booking.start_time).total_seconds() / 3600
            hourly_rate = 0
            
            if hasattr(booking.nanny, 'nanny_profile'):
                hourly_rate = booking.nanny.nanny_profile.hourly_rate or 0
            
            amount = duration * hourly_rate
            commission = amount * 0.15
            
            total_revenue += amount
            total_commission += commission
        
        return {
            'total_bookings': total_bookings,
            'total_revenue': round(total_revenue, 2),
            'total_commission': round(total_commission, 2),
            'total_to_nannies': round(total_revenue - total_commission, 2),
        }
