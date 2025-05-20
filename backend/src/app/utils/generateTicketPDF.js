const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateTicketPDF = (booking, outputPath) => {
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(outputPath));

  doc.fontSize(20).text("Event Ticket", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Order Number: ${booking.orderNumber}`);
  doc.text(`User: ${booking.userId}`);
  doc.text(`Event: ${booking.eventId}`);
  doc.moveDown();

  booking.ticketDetails.forEach((ticket, index) => {
    doc.text(`Ticket ${index + 1}`);
    doc.text(`Ticket ID: ${ticket.ticketId}`);
    doc.image(ticket.qrCodeUrl, {
      fit: [100, 100],
      align: "left",
    });
    doc.moveDown();
  });

  doc.end();
};

module.exports = generateTicketPDF;
