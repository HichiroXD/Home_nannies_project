web: gunicorn --chdir Back_Django_REST --pythonpath . django_crud_api.wsgi:application
release: python Back_Django_REST/manage.py migrate --noinput && python Back_Django_REST/manage.py collectstatic --noinput
