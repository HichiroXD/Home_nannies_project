"""
Metrics service for system-wide analytics and statistics.
Provides aggregated data for admin dashboards.
"""
from django.db.models import Count, Q, Avg, Sum, F
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from typing import Dict, Any, List
from bookings.models import Booking
from nannies.models import NannyProfile
from parents.models import ParentProfile
from reviews.models import Review
from notifications.models import Notification

User = get_user_model()


class MetricsService:
    """Service for calculating system metrics and KPIs."""
    
    @staticmethod
    def get_overview_metrics() -> Dict[str, Any]:
        """
        Get high-level overview metrics for the dashboard.
        
        Returns:
            dict: Overview statistics
        """
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_7_days = now - timedelta(days=7)
        
        # User metrics
        total_users = User.objects.filter(is_active=True).count()
        total_nannies = NannyProfile.objects.count()
        total_parents = ParentProfile.objects.count()
        verified_nannies = NannyProfile.objects.filter(verified=True).count()
        
        # New users in last 30 days
        new_users_30d = User.objects.filter(date_joined__gte=last_30_days).count()
        new_users_7d = User.objects.filter(date_joined__gte=last_7_days).count()
        
        # Booking metrics
        total_bookings = Booking.objects.count()
        completed_bookings = Booking.objects.filter(status='completed').count()
        pending_bookings = Booking.objects.filter(status='pending').count()
        
        # Bookings in last 30 days
        bookings_30d = Booking.objects.filter(created_at__gte=last_30_days).count()
        bookings_7d = Booking.objects.filter(created_at__gte=last_7_days).count()
        
        # Reviews metrics
        total_reviews = Review.objects.count()
        avg_rating = Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Calculate growth rates
        users_growth_rate = MetricsService._calculate_growth_rate(
            new_users_30d, total_users - new_users_30d
        )
        bookings_growth_rate = MetricsService._calculate_growth_rate(
            bookings_30d, total_bookings - bookings_30d
        )
        
        return {
            'users': {
                'total': total_users,
                'nannies': total_nannies,
                'parents': total_parents,
                'verified_nannies': verified_nannies,
                'new_last_30_days': new_users_30d,
                'new_last_7_days': new_users_7d,
                'growth_rate': round(users_growth_rate, 2)
            },
            'bookings': {
                'total': total_bookings,
                'completed': completed_bookings,
                'pending': pending_bookings,
                'last_30_days': bookings_30d,
                'last_7_days': bookings_7d,
                'growth_rate': round(bookings_growth_rate, 2),
                'completion_rate': round((completed_bookings / total_bookings * 100) if total_bookings > 0 else 0, 2)
            },
            'reviews': {
                'total': total_reviews,
                'average_rating': round(float(avg_rating), 2)
            },
            'generated_at': now.isoformat()
        }
    
    @staticmethod
    def get_bookings_by_status() -> List[Dict[str, Any]]:
        """Get booking counts grouped by status."""
        return list(
            Booking.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
    
    @staticmethod
    def get_bookings_by_period(days: int = 30) -> List[Dict[str, Any]]:
        """
        Get booking counts by day for the last N days.
        
        Args:
            days: Number of days to look back
            
        Returns:
            List of daily booking counts
        """
        start_date = timezone.now() - timedelta(days=days)
        
        bookings = Booking.objects.filter(
            created_at__gte=start_date
        ).extra(
            select={'date': 'DATE(created_at)'}
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        return list(bookings)
    
    @staticmethod
    def get_revenue_metrics(days: int = 30) -> Dict[str, Any]:
        """
        Calculate revenue metrics based on completed bookings.
        
        Args:
            days: Number of days to look back
            
        Returns:
            Revenue statistics
        """
        start_date = timezone.now() - timedelta(days=days)
        
        completed_bookings = Booking.objects.filter(
            status='completed',
            start_time__gte=start_date
        ).select_related('nanny__nanny_profile')
        
        total_revenue = 0
        total_commission = 0
        commission_rate = 0.15  # 15%
        
        for booking in completed_bookings:
            duration = (booking.end_time - booking.start_time).total_seconds() / 3600
            hourly_rate = 0
            
            if hasattr(booking.nanny, 'nanny_profile'):
                hourly_rate = booking.nanny.nanny_profile.hourly_rate or 0
            
            amount = duration * hourly_rate
            commission = amount * commission_rate
            
            total_revenue += amount
            total_commission += commission
        
        return {
            'period_days': days,
            'total_revenue': round(total_revenue, 2),
            'total_commission': round(total_commission, 2),
            'revenue_to_nannies': round(total_revenue - total_commission, 2),
            'completed_bookings': completed_bookings.count(),
            'average_booking_value': round(total_revenue / completed_bookings.count(), 2) if completed_bookings.count() > 0 else 0
        }
    
    @staticmethod
    def get_top_nannies(limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get top performing nannies by booking count and ratings.
        
        Args:
            limit: Number of results to return
            
        Returns:
            List of top nannies with stats
        """
        nannies = NannyProfile.objects.annotate(
            total_bookings=Count('user__bookings_received'),
            completed_bookings=Count(
                'user__bookings_received',
                filter=Q(user__bookings_received__status='completed')
            ),
            total_reviews=Count('user__reviews_made')
        ).select_related('user').order_by('-completed_bookings')[:limit]
        
        result = []
        for nanny in nannies:
            result.append({
                'id': nanny.user.id,
                'name': nanny.user.get_full_name() or nanny.user.username,
                'email': nanny.user.email,
                'total_bookings': nanny.total_bookings,
                'completed_bookings': nanny.completed_bookings,
                'rating_avg': float(nanny.rating_avg or 0),
                'total_reviews': nanny.total_reviews,
                'hourly_rate': float(nanny.hourly_rate or 0),
                'is_verified': nanny.verified
            })
        
        return result
    
    @staticmethod
    def get_user_activity_metrics(days: int = 30) -> Dict[str, Any]:
        """
        Get user activity metrics for the period.
        
        Args:
            days: Number of days to look back
            
        Returns:
            User activity statistics
        """
        start_date = timezone.now() - timedelta(days=days)
        
        # Active users (users with activity)
        active_users = User.objects.filter(
            Q(last_login__gte=start_date) |
            Q(bookings_made__created_at__gte=start_date) |
            Q(bookings_received__created_at__gte=start_date)
        ).distinct().count()
        
        # Users who made bookings
        parents_with_bookings = Booking.objects.filter(
            created_at__gte=start_date
        ).values('parent').distinct().count()
        
        # Nannies with bookings
        nannies_with_bookings = Booking.objects.filter(
            created_at__gte=start_date
        ).values('nanny').distinct().count()
        
        # Login activity
        users_logged_in = User.objects.filter(
            last_login__gte=start_date
        ).count()
        
        return {
            'period_days': days,
            'active_users': active_users,
            'parents_with_bookings': parents_with_bookings,
            'nannies_with_bookings': nannies_with_bookings,
            'users_logged_in': users_logged_in
        }
    
    @staticmethod
    def get_verification_metrics() -> Dict[str, Any]:
        """Get verification status metrics for nannies."""
        total_nannies = NannyProfile.objects.count()
        verified = NannyProfile.objects.filter(verified=True).count()
        pending = total_nannies - verified
        
        # Verification rate
        verification_rate = (verified / total_nannies * 100) if total_nannies > 0 else 0
        
        return {
            'total_nannies': total_nannies,
            'verified': verified,
            'pending': pending,
            'verification_rate': round(verification_rate, 2)
        }
    
    @staticmethod
    def get_notification_metrics(days: int = 30) -> Dict[str, Any]:
        """
        Get notification metrics for the period.
        
        Args:
            days: Number of days to look back
            
        Returns:
            Notification statistics
        """
        start_date = timezone.now() - timedelta(days=days)
        
        total_notifications = Notification.objects.filter(
            created_at__gte=start_date
        ).count()
        
        sent = Notification.objects.filter(
            created_at__gte=start_date,
            status='sent'
        ).count()
        
        read = Notification.objects.filter(
            created_at__gte=start_date,
            is_read=True
        ).count()
        
        # Read rate
        read_rate = (read / total_notifications * 100) if total_notifications > 0 else 0
        
        return {
            'period_days': days,
            'total_sent': total_notifications,
            'sent': sent,
            'read': read,
            'unread': total_notifications - read,
            'read_rate': round(read_rate, 2)
        }
    
    @staticmethod
    def _calculate_growth_rate(new_count: int, old_count: int) -> float:
        """
        Calculate growth rate percentage.
        
        Args:
            new_count: New period count
            old_count: Previous period count
            
        Returns:
            Growth rate as percentage
        """
        if old_count == 0:
            return 100.0 if new_count > 0 else 0.0
        
        return ((new_count - old_count) / old_count) * 100
