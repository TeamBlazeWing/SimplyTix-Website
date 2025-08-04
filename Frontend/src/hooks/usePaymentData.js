import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCardNumber, formatExpiryDate, formatPhoneNumber, validateField, getCardType } from "../utils/paymentUtils";
import emailjs from "@emailjs/browser";
import QRCode from "qrcode"; // Import qrcode library

const usePaymentData = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketSelections, setTicketSelections] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
    cardholderName: "",
    saveCard: false,
    acceptTerms: false,
    agreeRefund: false,
  });
  const navigate = useNavigate();

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("61WLiKEA60f41-C9w");
  }, []);

  useEffect(() => {
    const eventData = localStorage.getItem("selectedEvent");
    if (eventData) {
      const event = JSON.parse(eventData);
      console.log("Loaded event from localStorage:", event);
      localStorage.setItem("selEvent", JSON.stringify(event)); // Ensure it's stored correctly
      console.log("Event ID fields:", { _id: event._id, id: event.id });

      if (event.tickets && event.tickets.length > 0) {
        event.tickets.forEach((ticket) => {
          if (!ticket.type && ticket.name) {
            ticket.type = ticket.name;
          }
        });
        console.log("Updated tickets with type field:", event.tickets);
      }

      setSelectedEvent(event);

      if (event.tickets && event.tickets.length > 0) {
        const initialSelections = {};
        event.tickets.forEach((ticket, index) => {
          initialSelections[index] = 0;
        });
        setTicketSelections(initialSelections);
      } else {
        setTicketSelections({ 0: 1 });
      }
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleTicketQuantityChange = (ticketIndex, quantity) => {
    setTicketSelections((prev) => ({
      ...prev,
      [ticketIndex]: Math.max(0, parseInt(quantity) || 0),
    }));
  };

  const getTotalTickets = () => {
    return Object.values(ticketSelections).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!selectedEvent) return 0;

    let total = 0;
    Object.entries(ticketSelections).forEach(([index, quantity]) => {
      if (selectedEvent.tickets && selectedEvent.tickets[index]) {
        total += selectedEvent.tickets[index].price * quantity;
      } else {
        total += selectedEvent.price * quantity;
      }
    });
    return total;
  };

  const getTicketSummary = () => {
    const summary = [];
    Object.entries(ticketSelections).forEach(([index, quantity]) => {
      if (quantity > 0) {
        if (selectedEvent.tickets && selectedEvent.tickets[index]) {
          const ticket = selectedEvent.tickets[index];
          summary.push({
            type: ticket.type || ticket.name,
            quantity,
            price: ticket.price,
          });
        } else {
          summary.push({
            type: "General Admission",
            quantity,
            price: selectedEvent.price,
          });
        }
      }
    });
    return summary;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "cardNumber") {
      newValue = formatCardNumber(value);
    } else if (name === "expiryDate") {
      newValue = formatExpiryDate(value);
    } else if (name === "phone") {
      newValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    validateField(name, newValue, setFormErrors);
  };

  const isFormValid = () => {
    const requiredFields = ["fullName", "email", "phone"];
    if (paymentMethod === "credit") {
      requiredFields.push("cardNumber", "expiryDate", "cvv", "cardholderName", "billingAddress");
    }

    return (
      requiredFields.every((field) => formData[field] && formData[field].trim() !== "") &&
      Object.keys(formErrors).length === 0 &&
      formData.acceptTerms &&
      formData.agreeRefund
    );
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalTickets = getTotalTickets();
      const ticketSummary = getTicketSummary();

      if (totalTickets === 0) {
        alert("Please select at least one ticket before proceeding.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please log in to purchase tickets.");
        navigate("/login");
        return;
      }

      if (paymentMethod === "paypal") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert("Redirecting to PayPal...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const eventId = selectedEvent._id || selectedEvent.id;
      console.log("Selected Event Object:", selectedEvent);
      console.log("Event ID extracted:", eventId);
      console.log("Event ID type:", typeof eventId);

      if (!eventId) {
        console.error("Event ID is missing from selectedEvent:", selectedEvent);
        throw new Error("Event ID is missing. Please select an event again.");
      }

      console.log("Making payment request for event:", eventId);
      console.log("Ticket summary:", ticketSummary);

      ticketSummary.forEach((ticket, i) => {
        console.log(`Ticket ${i}: type=${ticket.type}, quantity=${ticket.quantity}, price=${ticket.price}`);
      });

      const backendPaymentMethod = paymentMethod === "credit" ? "card" : paymentMethod;

      const response = await fetch(`/api/payments/tickets/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tickets: ticketSummary,
          method: backendPaymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.log("❌ API Error Response:", result);
        throw new Error(result.message || result.error || "Payment failed");
      }

      console.log("Tickets purchased successfully:", result);

      localStorage.removeItem("selectedEvent");

      const ticketText = totalTickets === 1 ? "ticket" : "tickets";
      let ticketBreakdown = "";
      ticketSummary.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        ticketBreakdown += `\n• ${item.quantity}x ${item.type} @ $${item.price} = $${itemTotal}`;
      });

      const successMessage =
        `🎉 Purchase Successful!\n\n` +
        `${totalTickets} ${ticketText} for "${selectedEvent.title}" have been purchased successfully!\n` +
        `\nTicket Details:${ticketBreakdown}\n\n` +
        `📧 Confirmation emails with QR codes sent to: ${formData.email}\n` +
        `📱 SMS confirmation sent to: ${formData.phone}\n\n` +
        `Your tickets will be available in your account and sent via email shortly.\n\n` +
        `Total paid: $${(getTotalPrice() + 2.99).toFixed(2)}`;

      alert(successMessage);

      // Send separate emails for each ticket with QR code
      const serviceID = "default_service";
      const templateID = "template_gl1790n";
      let emailErrors = [];

      // Assume result.tickets contains the ticket data with ticketCode
      const purchasedTickets = result.data || []; // Adjust based on actual API response structure
      let ticketIndex = 0;

      for (const ticket of ticketSummary) {
        for (let i = 0; i < ticket.quantity; i++) {
          if (ticketIndex >= purchasedTickets.length) {
            emailErrors.push(`Ticket ${i + 1} (${ticket.type}): No ticket data available`);
            continue;
          }

          const ticketData = purchasedTickets[ticketIndex];
          const ticketCode = `SimplyTix-Ticket:${ticketData.ticketCode}`;
          console.log(`Processing ticket ${i + 1} of ${ticket.type} with code: ${ticketCode}`);
          ticketIndex++;

          // Generate QR code
          let qrCodeDataUrl;
          try {
            qrCodeDataUrl = await QRCode.toDataURL(ticketCode, {
              errorCorrectionLevel: "H",
              type: "image/png",
              margin: 1,
            });
          } catch (err) {
            console.error(`Error generating QR code for ticket ${ticketCode}:`, err);
            emailErrors.push(`Ticket ${i + 1} (${ticket.type}): QR code generation failed`);
            continue;
          }

          // Convert data URL to Blob for upload
          const responseBlob = await fetch(qrCodeDataUrl);
          const blob = await responseBlob.blob();
          const formDataForUpload = new FormData();
          formDataForUpload.append("image", blob, `qrcode_${ticketCode}.png`);

          // Upload QR code to server
          let imageUrl = "https://example.com/default-image.jpg"; // Fallback URL
          try {
            const uploadResponse = await fetch("http://localhost:3000/api/upload/image", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formDataForUpload,
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({}));
              throw new Error(errorData.message || "Image upload failed");
            }

            const uploadData = await uploadResponse.json();
            console.log("Image uploaded successfully:", uploadData);
            imageUrl = uploadData.data.secure_url || uploadData.data.url;
            console.log("Image URL:", imageUrl);
          } catch (err) {
            console.error(`Error uploading QR code for ticket ${ticketCode}:`, err);
            emailErrors.push(`Ticket ${i + 1} (${ticket.type}): QR code upload failed - ${err.message}`);
            continue;
          }

          const selectedEventData = localStorage.getItem("selEvent");
          const selectedEvents = JSON.parse(selectedEventData);
          // Prepare email data
          const emailData = {
            order_id: `ORDER_${eventId}_${Date.now()}_${ticket.type}_${i + 1}`,
            orders: `1x ${ticket.type}`,
            image_url: imageUrl,
            name: `${selectedEvents.title} 1x ${ticket.type}`,
            units: "1",
            price: ticket.price.toFixed(2),
            cost: ticket.price.toFixed(2),
            email: formData.email,
            ticket_code: ticketCode, // Include ticketCode in email if needed
          };

          // Send email
          try {
            await emailjs.send(serviceID, templateID, emailData);
            console.log(`Email sent successfully for ticket ${i + 1} of ${ticket.type} to: ${formData.email}`);
          } catch (err) {
            console.error(`Error sending email for ticket ${i + 1} of ${ticket.type}:`, err);
            emailErrors.push(`Ticket ${i + 1} (${ticket.type}): ${err.text || "Failed to send"}`);
          }
        }
      }

      if (emailErrors.length > 0) {
        alert(
          `⚠️ Warning: Some email confirmations could not be sent:\n${emailErrors.join(
            "\n"
          )}\n\nYour tickets are still purchased and available in your account.`
        );
      }

      navigate("/mytickets");
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      alert(
        `❌ Payment Failed\n\n${error.message}\n\nPlease check your information and try again.\n\nIf the problem persists, please contact our support team.`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedEvent,
    ticketSelections,
    handleTicketQuantityChange,
    getTotalTickets,
    getTotalPrice,
    getTicketSummary,
    currentStep,
    setCurrentStep,
    formData,
    handleInputChange,
    formErrors,
    paymentMethod,
    setPaymentMethod,
    loading,
    handlePurchase,
    isFormValid,
  };
};

export default usePaymentData;