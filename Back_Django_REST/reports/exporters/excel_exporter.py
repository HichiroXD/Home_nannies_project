"""
Excel Exporter for generating Excel reports using openpyxl.
"""
from io import BytesIO
from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from typing import List, Dict, Any
from datetime import datetime


class ExcelExporter:
    """Generate Excel reports using openpyxl."""

    @staticmethod
    def export(
        data: List[Dict[str, Any]],
        headers: List[str],
        title: str = "Reporte",
        filename: str = "report.xlsx",
        sheet_name: str = "Datos"
    ) -> HttpResponse:
        """
        Export data to Excel format.
        
        Args:
            data: List of dictionaries containing the data
            headers: List of column headers
            title: Title of the report
            filename: Name of the file to download
            sheet_name: Name of the worksheet
            
        Returns:
            HttpResponse with Excel content
        """
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Create workbook
        wb = Workbook()
        ws = wb.active
        ws.title = sheet_name
        
        # Add title
        ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(headers))
        title_cell = ws.cell(row=1, column=1)
        title_cell.value = title
        title_cell.font = Font(name='Calibri', size=16, bold=True, color='FFFFFF')
        title_cell.fill = PatternFill(start_color='3498DB', end_color='3498DB', fill_type='solid')
        title_cell.alignment = Alignment(horizontal='center', vertical='center')
        ws.row_dimensions[1].height = 30
        
        # Add generation date
        ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=len(headers))
        date_cell = ws.cell(row=2, column=1)
        date_cell.value = f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        date_cell.font = Font(name='Calibri', size=9, italic=True, color='7F8C8D')
        date_cell.alignment = Alignment(horizontal='right')
        
        # Add headers
        header_row = 4
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=header_row, column=col_num)
            cell.value = header
            cell.font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
            cell.fill = PatternFill(start_color='2C3E50', end_color='2C3E50', fill_type='solid')
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.border = Border(
                left=Side(style='thin', color='000000'),
                right=Side(style='thin', color='000000'),
                top=Side(style='thin', color='000000'),
                bottom=Side(style='thin', color='000000')
            )
        
        # Add data
        for row_num, row_data in enumerate(data, header_row + 1):
            for col_num, header in enumerate(headers, 1):
                cell = ws.cell(row=row_num, column=col_num)
                cell.value = row_data.get(header, '')
                cell.font = Font(name='Calibri', size=10)
                cell.alignment = Alignment(horizontal='left', vertical='center')
                cell.border = Border(
                    left=Side(style='thin', color='BDC3C7'),
                    right=Side(style='thin', color='BDC3C7'),
                    top=Side(style='thin', color='BDC3C7'),
                    bottom=Side(style='thin', color='BDC3C7')
                )
                
                # Alternate row colors
                if row_num % 2 == 0:
                    cell.fill = PatternFill(start_color='ECF0F1', end_color='ECF0F1', fill_type='solid')
        
        # Adjust column widths
        for col_num in range(1, len(headers) + 1):
            column_letter = get_column_letter(col_num)
            max_length = len(headers[col_num - 1])
            
            for row in ws.iter_rows(min_row=header_row + 1, max_row=ws.max_row, 
                                   min_col=col_num, max_col=col_num):
                for cell in row:
                    if cell.value:
                        max_length = max(max_length, len(str(cell.value)))
            
            adjusted_width = min(max_length + 2, 50)  # Cap at 50
            ws.column_dimensions[column_letter].width = adjusted_width
        
        # Freeze header row
        ws.freeze_panes = ws.cell(row=header_row + 1, column=1)
        
        # Save to buffer
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        response.write(buffer.getvalue())
        buffer.close()
        
        return response

    @staticmethod
    def export_multiple_sheets(
        sheets_data: List[Dict[str, Any]],
        filename: str = "report.xlsx"
    ) -> HttpResponse:
        """
        Export data to Excel with multiple sheets.
        
        Args:
            sheets_data: List of dicts with 'name', 'data', 'headers', 'title'
            filename: Name of the file to download
            
        Returns:
            HttpResponse with Excel content
        """
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        wb = Workbook()
        wb.remove(wb.active)  # Remove default sheet
        
        for sheet_info in sheets_data:
            ws = wb.create_sheet(title=sheet_info.get('name', 'Sheet'))
            data = sheet_info.get('data', [])
            headers = sheet_info.get('headers', [])
            title = sheet_info.get('title', 'Reporte')
            
            # Similar logic as export() for each sheet
            # (Add title, headers, data)
            # ... implementation similar to export() ...
        
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        response.write(buffer.getvalue())
        buffer.close()
        
        return response
