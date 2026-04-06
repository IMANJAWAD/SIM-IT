import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (elementId, filename = 'PulseFlow_Simulation_Report.pdf') => {
    setIsExporting(true);

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Export element not found');
      }

      // Create canvas from element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title page
      pdf.setFillColor(120, 0, 0);
      pdf.rect(0, 0, 210, 50, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PulseFlow', 20, 25);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('A Stochastic Optimization System for Emergency Departments', 20, 35);
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Add report title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Simulation Analysis Report', 20, 70);
      
      // Add date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`Generated: ${date}`, 20, 82);
      
      // Add summary section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, 100);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryText = [
        'This report contains the results of the stochastic simulation analysis',
        'performed using advanced Monte Carlo methods and Markov chain modeling.',
        '',
        'Key findings include optimization recommendations for Emergency Department',
        'resource allocation, sensitivity analysis results, and performance metrics.',
      ];
      
      let yPos = 112;
      summaryText.forEach(line => {
        pdf.text(line, 20, yPos);
        yPos += 6;
      });
      
      // Add methodology section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Methodology', 20, 150);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const methodologyText = [
        '• Poisson Process for patient arrival modeling',
        '• M/M/c Queueing Theory for steady-state analysis',
        '• Discrete-Event Simulation using SimPy',
        '• Monte Carlo methods for confidence intervals',
        '• Sensitivity analysis for parameter optimization',
      ];
      
      yPos = 162;
      methodologyText.forEach(line => {
        pdf.text(line, 20, yPos);
        yPos += 6;
      });
      
      // Add visualizations on new pages
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add new page for visualizations
      pdf.addPage();
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 48, 73);
      pdf.text('Analysis Results & Visualizations', 20, 20);
      pdf.setTextColor(0, 0, 0);
      
      // Add the captured content
      position = 30;
      
      while (heightLeft >= 0) {
        if (position !== 30) {
          pdf.addPage();
          position = 20;
        }
        
        const pageImgHeight = Math.min(heightLeft, pageHeight - position - 20);
        
        pdf.addImage(
          imgData,
          'PNG',
          5,
          position,
          imgWidth - 10,
          pageImgHeight
        );
        
        heightLeft -= (pageHeight - position - 20);
        position = 20;
      }
      
      // Add footer to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `PulseFlow Report - Page ${i} of ${pageCount}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      pdf.save(filename);
      
      return true;
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPDF, isExporting };
};

export default usePDFExport;
