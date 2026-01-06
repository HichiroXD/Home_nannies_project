# ============================================
# Procfile - Para Heroku/Railway/Render (PaaS)
# ============================================
# NOTA: Este archivo NO se usa en el Droplet actual
# Para Droplet se usa systemd (ver Back_Django_REST/DEPLOYMENT_DROPLET.md)
# Se mantiene por si se migra a una plataforma PaaS en el futuro

web: gunicorn --chdir Back_Django_REST --pythonpath . django_crud_api.wsgi:application
release: python Back_Django_REST/manage.py migrate --noinput && python Back_Django_REST/manage.py collectstatic --noinput
