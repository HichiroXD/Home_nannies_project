"""
CSV Exporter for generating CSV reports.
"""
import csv
from io import StringIO
from django.http import HttpResponse
from typing import List, Dict, Any


class CSVExporter:
    """Generate CSV reports from data."""

    @staticmethod
    def export(data: List[Dict[str, Any]], headers: List[str], filename: str = "report.csv") -> HttpResponse:
        """
        Export data to CSV format.
        
        Args:
            data: List of dictionaries containing the data
            headers: List of column headers
            filename: Name of the file to download
            
        Returns:
            HttpResponse with CSV content
        """
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Add BOM for Excel UTF-8 compatibility
        response.write('\ufeff')
        
        writer = csv.DictWriter(response, fieldnames=headers, extrasaction='ignore')
        writer.writeheader()
        
        for row in data:
            writer.writerow(row)
        
        return response

    @staticmethod
    def generate_string(data: List[Dict[str, Any]], headers: List[str]) -> str:
        """
        Generate CSV content as string.
        
        Args:
            data: List of dictionaries containing the data
            headers: List of column headers
            
        Returns:
            CSV content as string
        """
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=headers, extrasaction='ignore')
        writer.writeheader()
        
        for row in data:
            writer.writerow(row)
        
        return output.getvalue()
