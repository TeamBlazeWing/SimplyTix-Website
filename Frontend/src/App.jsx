import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './Pages/Signup'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import FogetPassword from './Pages/FogetPassword'
import About from './Pages/Aboutus'
import Contactus from './Pages/Contactus'
import Payment from './Pages/Payment' 
import MyTickets from './Pages/MyTickets'
import Myevents from './Pages/Myevents'
import TicketPayments from './Pages/ticketpayments'
import ValidateTicket from './Pages/ValidateTicket'
import TestQRGenerator from './Pages/TestQRGenerator'
import QRTestPage from './Pages/QRTestPage'
import ChatBot from './Pages/chatbot'


function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/chatbot" element={<ChatBot />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgetpassword" element={<FogetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contactus />} />
          <Route path="/mytickets" element={<MyTickets />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/myevents" element={<Myevents />} />
          <Route path="/ticketpayments" element={<TicketPayments />} />
          <Route path="/validate-ticket/:eventId" element={<ValidateTicket />} />
          <Route path="/validate-ticket" element={<ValidateTicket />} />
          <Route path="/test-qr" element={<TestQRGenerator />} />
          <Route path="/qr-test" element={<QRTestPage />} />
          {/* Add more routes as needed */}
        </Routes>
        <ChatBot />
      </div>
    </Router>
  )
}

export default App