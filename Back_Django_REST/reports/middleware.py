"""
Middleware temporal para debugging de peticiones HTTP
"""
import logging

logger = logging.getLogger(__name__)


class DebugRequestMiddleware:
    """Middleware para loguear todas las peticiones que llegan"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log antes de procesar
        if request.path.startswith('/api/reports/'):
            logger.info(f"🌐 INCOMING REQUEST: {request.method} {request.path}")
            logger.info(f"   User: {request.user if hasattr(request, 'user') else 'NO USER YET'}")
            logger.info(f"   Query: {request.GET.dict()}")
            logger.info(f"   Headers: {dict(request.headers)}")
        
        # Procesar petición
        response = self.get_response(request)
        
        # Log después de procesar
        if request.path.startswith('/api/reports/'):
            logger.info(f"📤 RESPONSE: {response.status_code} for {request.method} {request.path}")
            if response.status_code >= 400:
                logger.warning(f"   ⚠️  Error response: {response.status_code}")
        
        return response
