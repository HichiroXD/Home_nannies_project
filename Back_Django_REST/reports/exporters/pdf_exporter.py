"""
PDF Exporter for generating PDF reports using ReportLab.
"""
from io import BytesIO
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from typing import List, Dict, Any
from datetime import datetime


class PDFExporter:
    """Generate PDF reports using ReportLab."""

    @staticmethod
    def export(
        data: List[Dict[str, Any]],
        headers: List[str],
        title: str = "Reporte",
        filename: str = "report.pdf",
        page_size=letter
    ) -> HttpResponse:
        """
        Export data to PDF format.
        
        Args:
            data: List of dictionaries containing the data
            headers: List of column headers
            title: Title of the report
            filename: Name of the file to download
            page_size: Page size (letter or A4)
            
        Returns:
            HttpResponse with PDF content
        """
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Create PDF document
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=page_size, 
                              rightMargin=0.5*inch, leftMargin=0.5*inch,
                              topMargin=0.75*inch, bottomMargin=0.5*inch)
        
        # Container for elements
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        # Add title
        elements.append(Paragraph(title, title_style))
        
        # Add generation date
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.gray,
            alignment=TA_RIGHT
        )
        date_text = f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        elements.append(Paragraph(date_text, date_style))
        elements.append(Spacer(1, 20))
        
        # Prepare table data
        table_data = [headers]  # Header row
        
        for row in data:
            row_data = [str(row.get(header, '')) for header in headers]
            table_data.append(row_data)
        
        # Create table
        if table_data:
            # Calculate column widths
            available_width = doc.width
            col_width = available_width / len(headers)
            col_widths = [col_width] * len(headers)
            
            table = Table(table_data, colWidths=col_widths, repeatRows=1)
            
            # Table style
            table.setStyle(TableStyle([
                # Header style
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498DB')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                
                # Data style
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2C3E50')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#ECF0F1')]),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            
            elements.append(table)
        
        # Add footer
        elements.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'FooterStyle',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.gray,
            alignment=TA_CENTER
        )
        footer_text = "Home Nannies - Sistema de Gestión"
        elements.append(Paragraph(footer_text, footer_style))
        
        # Build PDF
        doc.build(elements)
        
        # Get PDF content
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)
        
        return response

    @staticmethod
    def export_custom(
        content_elements: List,
        filename: str = "report.pdf",
        page_size=letter
    ) -> HttpResponse:
        """
        Export custom PDF with custom elements.
        
        Args:
            content_elements: List of ReportLab elements (Paragraph, Table, etc.)
            filename: Name of the file to download
            page_size: Page size (letter or A4)
            
        Returns:
            HttpResponse with PDF content
        """
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=page_size,
                              rightMargin=0.5*inch, leftMargin=0.5*inch,
                              topMargin=0.75*inch, bottomMargin=0.5*inch)
        
        doc.build(content_elements)
        
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)
        
        return response
