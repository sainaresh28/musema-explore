import React from "react";
import QRCode from "react-qr-code";
import { jsPDF } from "jspdf";

interface Reservation {
  ref: string;
  name: string;
  email?: string;
  date: string;
  timeSlot: string;
  tickets: string | number;
  vpa?: string;
}

interface Props {
  reservation: Reservation;
  upiLink?: string;
}

const TicketConfirmation: React.FC<Props> = ({ reservation, upiLink }) => {
  const { ref, name, email, date, timeSlot, tickets, vpa } = reservation;

  const qrPayload = upiLink || JSON.stringify({ ref, date, timeSlot, tickets });

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Museum Reservation Confirmation", 14, 20);
    doc.setFontSize(12);
    doc.text(`Reference: ${ref}`, 14, 35);
    doc.text(`Name: ${name}`, 14, 45);
    if (email) doc.text(`Email: ${email}`, 14, 55);
    doc.text(`Visit Date: ${date}`, 14, 65);
    doc.text(`Time Slot: ${timeSlot}`, 14, 75);
    doc.text(`Tickets: ${tickets}`, 14, 85);
    if (vpa) {
      doc.text(`UPI: ${vpa}`, 14, 95);
      doc.text("You may also pay using the UPI link/QR in the app.", 14, 105);
    } else {
      doc.text("Payment method: Pay at counter", 14, 95);
    }
    doc.text("Show the QR in the app at entry.", 14, 115);
    doc.save(`${ref}.pdf`);
  };

  return (
    <div className="mt-6 rounded-lg border bg-white shadow-sm">
      {/* Card Header */}
      <div className="flex flex-col space-y-1.5 p-6 border-b">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Reservation Confirmed</h3>
      </div>
      {/* Card Content */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p><strong>Reference:</strong> {ref}</p>
            <p><strong>Name:</strong> {name}</p>
            {email && <p><strong>Email:</strong> {email}</p>}
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Time:</strong> {timeSlot}</p>
            <p><strong>Tickets:</strong> {tickets}</p>
            {vpa && <p><strong>UPI:</strong> {vpa}</p>}
            {upiLink && (
              <a
                href={upiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-orange-600"
              >
                Open UPI app to pay (optional)
              </a>
            )}
            <div>
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                Download PDF
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow">
              <QRCode value={qrPayload} size={192} />
              <p className="mt-2 text-center text-sm text-gray-500">Scan at entry</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketConfirmation;
