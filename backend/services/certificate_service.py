from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime, timezone
from io import BytesIO
import qrcode
from typing import Dict, Any

class CertificateService:
    def generate_certificate(
        self, 
        user_name: str, 
        course_title: str, 
        completion_date: str,
        certificate_id: str,
        modules_completed: int
    ) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=36,
            textColor=colors.HexColor('#00F2EA'),
            alignment=TA_CENTER,
            spaceAfter=30,
            fontName='Helvetica-Bold'
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=18,
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontSize=14,
            alignment=TA_CENTER,
            spaceAfter=12
        )
        
        name_style = ParagraphStyle(
            'NameStyle',
            parent=styles['Normal'],
            fontSize=28,
            textColor=colors.HexColor('#7000FF'),
            alignment=TA_CENTER,
            spaceAfter=20,
            fontName='Helvetica-Bold'
        )
        
        # Add content
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph('CERTIFICATE OF COMPLETION', title_style))
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph('This certifies that', body_style))
        story.append(Spacer(1, 0.2*inch))
        
        story.append(Paragraph(user_name, name_style))
        story.append(Spacer(1, 0.2*inch))
        
        story.append(Paragraph(
            f'has successfully completed the course',
            body_style
        ))
        story.append(Spacer(1, 0.1*inch))
        
        story.append(Paragraph(
            f'<b>{course_title}</b>',
            subtitle_style
        ))
        story.append(Spacer(1, 0.3*inch))
        
        # Course details table
        data = [
            ['Modules Completed:', str(modules_completed)],
            ['Completion Date:', completion_date],
            ['Certificate ID:', certificate_id]
        ]
        
        table = Table(data, colWidths=[2.5*inch, 3*inch])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#00F2EA'))
        ]))
        
        story.append(table)
        story.append(Spacer(1, 0.5*inch))
        
        # Generate QR code for verification
        qr = qrcode.QRCode(version=1, box_size=10, border=2)
        qr.add_data(f'https://forensics-ai-hub.preview.emergentagent.com/verify/{certificate_id}')
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        qr_buffer = BytesIO()
        qr_img.save(qr_buffer, format='PNG')
        qr_buffer.seek(0)
        
        # Add QR code
        story.append(Paragraph('Scan to verify certificate', body_style))
        story.append(Spacer(1, 0.1*inch))
        
        # Footer
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph(
            'CyberSentinels - Digital Forensics & Cybersecurity Learning Platform',
            ParagraphStyle('Footer', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER, textColor=colors.grey)
        ))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.read()

certificate_service = CertificateService()