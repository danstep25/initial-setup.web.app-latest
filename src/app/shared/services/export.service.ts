import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { MODULE, STATUS } from '../constants/module.constant';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  exportToPdf(data: any[], filename: string = 'transaction.pdf', module?: MODULE) {
    // Generate title from module
    const title = module ? `${module} Report` : 'Report';
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }

    // Create PDF in landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 15);

    // Filter out unwanted columns
    const excludedColumns = ['reservationId', 'amount', 'statusId'];
    const allColumns = Object.keys(data[0]);
    const columns = allColumns.filter(col => !excludedColumns.includes(col));
    
    // Prepare table data with filtered columns
    const rows = data.map(item => columns.map(col => {
      const value = item[col];
      // Handle null, undefined, or complex objects
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    }));

    // Calculate grand totals for totalPrice and balance
    let grandTotalPrice = 0;
    let grandTotalBalance = 0;
    const totalPriceIndex = columns.indexOf('totalPrice');
    const balanceIndex = columns.indexOf('balance');
    
    if (totalPriceIndex >= 0) {
      grandTotalPrice = data.reduce((sum, item) => {
        const value = item.totalPrice;
        const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
        return sum + numValue;
      }, 0);
    }
    
    if (balanceIndex >= 0) {
      grandTotalBalance = data.reduce((sum, item) => {
        const value = item.balance;
        const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
        return sum + numValue;
      }, 0);
    }

    // Prepare footer row with grand totals
    const footerRow: any[] = [];
    if (totalPriceIndex >= 0 || balanceIndex >= 0) {
      columns.forEach((col, index) => {
        if (index === 0) {
          footerRow.push('Grand Total');
        } else if (index === totalPriceIndex) {
          footerRow.push(`₱${grandTotalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        } else if (index === balanceIndex) {
          footerRow.push(`₱${grandTotalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        } else {
          footerRow.push('');
        }
      });
    }
    
    // Identify numeric columns for smaller font size
    const numericColumns: { [key: number]: any } = {};
    columns.forEach((col, index) => {
      // Check if column contains numeric data
      const hasNumericData = data.some(item => {
        const value = item[col];
        return value !== null && value !== undefined && !isNaN(parseFloat(value));
      });
      if (hasNumericData || col === 'totalPrice' || col === 'balance' || col === 'contactNo' || col === 'noOfGuest') {
        numericColumns[index] = { fontSize: 7 }; // Smaller font for numeric columns
      }
    });

    // Add table using autoTable with text wrapping and footer
    autoTable(doc, {
      head: [columns],
      body: rows,
      foot: (totalPriceIndex >= 0 || balanceIndex >= 0) ? [footerRow] : undefined,
      startY: 25,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'auto',
      },
      headStyles: {
        fillColor: [244, 67, 54], // Red color similar to the app theme
        textColor: 255,
        fontStyle: 'bold',
        overflow: 'linebreak',
        cellWidth: 'auto',
      },
      footStyles: {
        fillColor: [244, 67, 54], // Same red color as header
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
        overflow: 'linebreak',
        cellWidth: 'auto',
      },
      margin: { top: 25 },
      columnStyles: numericColumns, // Apply smaller font to numeric columns
      tableWidth: 'auto',
    });

    // Save the PDF
    doc.save(filename);
  }

  // Keep backward compatibility - redirect to PDF export
  exportToExcel(data: any[], filename: string = 'transaction.pdf') {
    // Replace .xlsx extension with .pdf if present
    const pdfFilename = filename.replace(/\.xlsx?$/i, '.pdf');
    this.exportToPdf(data, pdfFilename);
  }

  exportIndividualReservationToPdf(
    data: any, 
    filename: string = 'reservation-detail.pdf',
    foodPackageLookup?: Map<number, { name: string; price?: number }>,
    serviceLookup?: Map<number, { name: string; price?: number }>,
    eventLookup?: Map<number, string>,
    venueLookup?: Map<number, { name: string; price?: number }>
  ) {
    if (!data) {
      console.error('No data to export');
      return;
    }

    // Create PDF in portrait orientation for detailed report
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let yPosition = 20;

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = 'Reservation Detail Report';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
    yPosition += 15;

    // Helper function to format date
    const formatDateValue = (dateValue: any): string => {
      if (!dateValue) return 'N/A';
      try {
        const date = new Date(dateValue);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return String(dateValue);
      }
    };

    // Helper function to format currency
    const formatCurrency = (value: any): string => {
      if (value === null || value === undefined) return '₱0.00';
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return `₱${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Helper function to add a row
    const addRow = (label: string, value: any, isBold: boolean = false) => {
      doc.setFontSize(10);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(label + ':', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      const valueStr = String(value || 'N/A');
      // Split long values into multiple lines
      const splitValue = doc.splitTextToSize(valueStr, pageWidth - 80);
      doc.text(splitValue, 80, yPosition);
      yPosition += splitValue.length * 6 + 5;
    };

    // Customer Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information', 20, yPosition);
    yPosition += 10;

    addRow('Reservation ID', data.reservationId || 'N/A');
    addRow('Full Name', data.fullName || 'N/A');
    addRow('Address', data.address || 'N/A');
    addRow('Contact Number', data.contactNo || 'N/A');
    yPosition += 5;

    // Reservation Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reservation Details', 20, yPosition);
    yPosition += 10;

    // Get event type name from lookup or data
    let eventTypeName = data.eventName || null;
    if (!eventTypeName && data.eventId && eventLookup) {
      eventTypeName = eventLookup.get(data.eventId) || null;
    }
    if (!eventTypeName && data.eventId) {
      eventTypeName = `Event ID: ${data.eventId}`;
    }
    addRow('Event Type', eventTypeName || 'N/A');

    // Get venue name and price from lookup or data
    let venueName = data.venueName || null;
    let venuePrice = data.venuePrice || 0;
    if (data.venueId && venueLookup) {
      const venueInfo = venueLookup.get(data.venueId);
      if (venueInfo) {
        if (!venueName) venueName = venueInfo.name;
        if (!venuePrice && venueInfo.price) venuePrice = venueInfo.price;
      }
    }
    if (!venueName && data.venueId) {
      venueName = `Venue ID: ${data.venueId}`;
    }
    addRow('Venue', venueName || 'N/A');
    addRow('Venue Price', formatCurrency(venuePrice));
    addRow('Number of Guests', data.noOfGuest || 'N/A');
    addRow('Scheduled Date From', formatDateValue(data.dateFrom));
    addRow('Scheduled Date To', formatDateValue(data.dateTo));
    addRow('Description', data.description || 'N/A');
    yPosition += 5;

    // Packages Section
    if (data.reservationPackage && data.reservationPackage.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Food Packages', 20, yPosition);
      yPosition += 10;

      const packageData = Array.isArray(data.reservationPackage) 
        ? data.reservationPackage.map((pkg: any, index: number) => {
            // Handle different data structures
            let packageName = 'N/A';
            let packagePrice = 0;
            let packageId: number | null = null;

            if (typeof pkg === 'object' && pkg !== null) {
              // Object with properties
              packageId = pkg.packageId || pkg.id || null;
              packageName = pkg.packageName || pkg.name || pkg.value || null;
              packagePrice = pkg.price || pkg.amount || 0;
            } else if (typeof pkg === 'number') {
              // Just an ID number
              packageId = pkg;
              packagePrice = 0;
            } else {
              // Fallback for other types
              packageName = String(pkg);
              packagePrice = 0;
            }

            // Use lookup map to get name and price if available
            if (packageId !== null && foodPackageLookup) {
              const pkgInfo = foodPackageLookup.get(packageId);
              if (pkgInfo) {
                if (!packageName) packageName = pkgInfo.name;
                if (!packagePrice && pkgInfo.price) packagePrice = pkgInfo.price;
              }
            }
            if (!packageName && packageId !== null) {
              packageName = `Package ID: ${packageId}`;
            }

            return [
              index + 1,
              packageName || 'N/A',
              formatCurrency(packagePrice)
            ];
          })
        : [[1, 'N/A', 'N/A']];

      autoTable(doc, {
        head: [['#', 'Package Name', 'Price']],
        body: packageData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [244, 67, 54],
          textColor: 255,
          fontStyle: 'bold'
        },
        margin: { left: 20, right: 20 }
      });
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Services Section
    if (data.servicePackage && data.servicePackage.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Service Packages', 20, yPosition);
      yPosition += 10;

      const serviceData = Array.isArray(data.servicePackage)
        ? data.servicePackage.map((svc: any, index: number) => {
            // Handle different data structures
            let serviceName = 'N/A';
            let servicePrice = 0;
            let serviceId: number | null = null;

            if (typeof svc === 'object' && svc !== null) {
              // Object with properties
              serviceId = svc.serviceId || svc.id || null;
              serviceName = svc.serviceName || svc.name || svc.value || null;
              servicePrice = svc.price || svc.amount || 0;
            } else if (typeof svc === 'number') {
              // Just an ID number
              serviceId = svc;
              servicePrice = 0;
            } else {
              // Fallback for other types
              serviceName = String(svc);
              servicePrice = 0;
            }

            // Use lookup map to get name and price if available
            if (serviceId !== null && serviceLookup) {
              const svcInfo = serviceLookup.get(serviceId);
              if (svcInfo) {
                if (!serviceName) serviceName = svcInfo.name;
                if (!servicePrice && svcInfo.price) servicePrice = svcInfo.price;
              }
            }
            if (!serviceName && serviceId !== null) {
              serviceName = `Service ID: ${serviceId}`;
            }

            return [
              index + 1,
              serviceName || 'N/A',
              formatCurrency(servicePrice)
            ];
          })
        : [[1, 'N/A', 'N/A']];

      autoTable(doc, {
        head: [['#', 'Service Name', 'Price']],
        body: serviceData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [244, 67, 54],
          textColor: 255,
          fontStyle: 'bold'
        },
        margin: { left: 20, right: 20 }
      });
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Financial Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Information', 20, yPosition);
    yPosition += 10;

    addRow('Subtotal', formatCurrency(data.totalPrice || 0));
    addRow('Discount Applied', data.isDiscount != "0" ? 'Yes' : 'No');
    if (data.isDiscount && data.discount) {
      addRow('Discount Amount/Percentage', data.discount);
    }
    addRow('Total Price', formatCurrency(data.totalPrice || 0));
  
    // Calculate total paid and balance (matching transaction form logic)
    const totalPrice = Number(data.totalPrice) || 0;
    // If balance is 0, it means unpaid, so balance should be totalPrice
    // Otherwise, use the actual balance value
    const balance = data.balance == '0' ? totalPrice : (Number(data.balance) !== undefined ? Number(data.balance) : totalPrice);
    const totalPaid = totalPrice - balance;
    
    addRow('Total Paid', formatCurrency(isNaN(totalPaid) ? 0 : totalPaid));
    addRow('Balance', formatCurrency(isNaN(balance) ? 0 : balance));
    yPosition += 5;

    // Refund Information Section
    const refundInfo = this.getRefundInfo(data);
    if (refundInfo.hasRefund || refundInfo.refundAmount > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Refund Information', 20, yPosition);
      yPosition += 10;

      addRow('Reservation Fee', formatCurrency(refundInfo.reservationFee));
      if (refundInfo.refundAmount > 0) {
        addRow('Refund Amount', formatCurrency(refundInfo.refundAmount));
        if (refundInfo.refundPercentage > 0) {
          addRow('Refund Percentage', `${refundInfo.refundPercentage.toFixed(1)}% of Reservation Fee`);
        }
      }
      if (refundInfo.refundMessage) {
        addRow('Refund Status', refundInfo.refundMessage);
      }
      yPosition += 5;
    }

    // Status Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Status Information', 20, yPosition);
    yPosition += 10;
    console.warn('statusId', data);
    addRow('Payment Status', this.getPaymentStatus(data.statusId));
    addRow('Reservation Status', data.status || 'N/A');
    yPosition += 5;

    // Additional Information Section
    if (data.remarks) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Additional Information', 20, yPosition);
      yPosition += 10;
      addRow('Remarks', data.remarks);
      yPosition += 5;
    }

    // Timestamps Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Timestamps', 20, yPosition);
    yPosition += 10;

    addRow('Created At', formatDateValue(data.createdAt));
    addRow('Updated At', formatDateValue(data.updatedAt));

    // Add footer with page numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(filename);
  }

  private getPaymentStatus(statusId: any): string {
    const status = String(statusId);
    console.warn('status', status);
    if (status === '0') {
      return 'Unpaid';
    } else if (status === '1' || status === '2') {
      return 'Partially Paid';
    } else if (status === '3') {
      return 'Fully Paid';
    }
    return 'Unknown';
  }

  private getRefundInfo(data: any): { hasRefund: boolean; reservationFee: number; refundAmount: number; refundPercentage: number; refundMessage: string } {
    // Check if there's actual refund data
    
    const dateFrom = new Date(data.dateFrom);
    const validityDate = new Date(data.dateFrom);
    validityDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    dateFrom.setHours(0, 0, 0, 0);

    if (data?.updatedAt !== null && data?.status === STATUS.cancelled) {
      const totalPrice = Number(data?.totalPrice) || 0;
      const reservationFee = totalPrice * 0.1;
      var refundAmount = Number(data.refundAmount) || 0;
      const refundPercentage = reservationFee > 0 ? (refundAmount / reservationFee) * 100 : 0;
      const daysDifference = Math.floor((dateFrom.getTime() - validityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference < 7) {
        refundAmount = reservationFee * 0.2;
      }

      return {
        hasRefund: true,
        reservationFee,
        refundAmount,
        refundPercentage,
        refundMessage: 'Refund has been processed'
      };
    }

    // Calculate potential refund eligibility
    if (!data?.dateFrom) {
      return {
        hasRefund: false,
        reservationFee: 0,
        refundAmount: 0,
        refundPercentage: 0,
        refundMessage: ''
      };
    }

    // Calculate days difference (how many days until the event)

    const today = new Date();
    const daysDifference = Math.floor((dateFrom.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = Number(data?.totalPrice) || 0;
    const reservationFee = totalPrice * 0.1;

    if (daysDifference < 0) {
      return {
        hasRefund: false,
        reservationFee,
        refundAmount: 0,
        refundPercentage: 0,
        refundMessage: 'No refund available for past reservations'
      };
    } else if (daysDifference < 7) {
      const refundAmount = reservationFee * 0.2;
      return {
        hasRefund: true,
        reservationFee,
        refundAmount,
        refundPercentage: 20,
        refundMessage: '20% refund available (less than 1 week before event)'
      };
    } else if (daysDifference >= 7 && daysDifference <= 14) {
      return {
        hasRefund: true,
        reservationFee,
        refundAmount: reservationFee,
        refundPercentage: 100,
        refundMessage: 'Full refund available (1-2 weeks before event)'
      };
    } else {
      return {
        hasRefund: true,
        reservationFee,
        refundAmount: reservationFee,
        refundPercentage: 100,
        refundMessage: 'Full refund available (more than 2 weeks before event)'
      };
    }
  }
}
