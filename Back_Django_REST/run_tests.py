#!/usr/bin/env python
"""
Script para ejecutar tests de Task 8 - Expandir Tests Fase 3
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

if __name__ == "__main__":
    os.environ['DJANGO_SETTINGS_MODULE'] = 'django_crud_api.settings'
    django.setup()
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=False, keep_db=False)
    
    # Ejecutar tests específicos
    failures = test_runner.run_tests([
        'notifications.tests.NotificationTemplateTest',
        'notifications.tests.NotificationTemplateExtendedTest',
        'notifications.tests.NotificationModelExtendedTest',
        'academic.tests.AcademicProviderExtendedTests',
        'academic.tests.AcademicStudentExtendedTests',
        'reports.tests.VerificationReportExtendedTests',
        'reports.tests.OcrStatisticsExtendedTests',
    ])
    
    sys.exit(bool(failures))
