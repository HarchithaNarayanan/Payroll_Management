import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId, fileName) => {
    const input = document.getElementById(elementId);
    if (!input) {
        console.error(`Element with id ${elementId} not found`);
        alert(`Error: Could not find element to generate PDF`);
        return;
    }

    try {
        // Generate canvas from HTML element
        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc) => {
                const style = clonedDoc.createElement('style');
                style.innerHTML = `
                    * {
                        -webkit-print-color-adjust: exact;
                    }
                    /* Force standard color space for all elements */
                    #${elementId} {
                        background-color: white !important;
                        color: black !important;
                    }
                `;
                clonedDoc.head.appendChild(style);
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Calculate the ratio to fit the image to the page
        const ratio = pdfWidth / imgWidth;
        const scaledHeight = imgHeight * ratio;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
        pdf.save(fileName);

        console.log('PDF generated successfully:', fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again or contact support.');
    }
};
