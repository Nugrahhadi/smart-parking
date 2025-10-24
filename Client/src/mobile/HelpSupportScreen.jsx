import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Mail,
  MessageSquare,
  Phone,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HelpSupportScreen = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const goBack = () => {
    navigate(-1);
  };

  // FAQ Categories
  const categories = [
    { id: "all", name: "All" },
    { id: "account", name: "Account" },
    { id: "reservation", name: "Reservation" },
    { id: "payment", name: "Payment" },
    { id: "app", name: "App Usage" },
  ];

  // FAQ Data
  const faqData = [
    {
      id: 1,
      category: "account",
      question: "How do I create an account?",
      answer:
        "To create an account, download our app from the App Store or Google Play Store, open it, and tap on 'Sign Up'. Follow the instructions to enter your details and create your account.",
    },
    {
      id: 2,
      category: "account",
      question: "How do I reset my password?",
      answer:
        "To reset your password, go to the login screen and tap on 'Forgot Password'. Enter your email address, and we'll send you a link to reset your password.",
    },
    {
      id: 3,
      category: "reservation",
      question: "How do I make a parking reservation?",
      answer:
        "To make a reservation, open the app and search for your desired location. Select a parking spot, choose your arrival and departure times, and confirm your booking. You'll receive a confirmation with a QR code for entry.",
    },
    {
      id: 4,
      category: "reservation",
      question: "Can I modify or cancel my reservation?",
      answer:
        "Yes, you can modify or cancel your reservation up to 30 minutes before your scheduled arrival time. Go to 'My Reservations' in the app, select the booking you want to change, and tap on 'Modify' or 'Cancel'.",
    },
    {
      id: 5,
      category: "payment",
      question: "What payment methods are accepted?",
      answer:
        "We accept credit/debit cards (Visa, Mastercard, American Express), digital wallets (Apple Pay, Google Pay), and our in-app wallet that can be topped up.",
    },
    {
      id: 6,
      category: "payment",
      question: "How do I get a receipt for my parking?",
      answer:
        "Receipts are automatically sent to your email after each payment. You can also view and download your receipts from the 'Payment History' section in the app.",
    },
    {
      id: 7,
      category: "app",
      question: "Why isn't the map showing my current location?",
      answer:
        "Make sure you've allowed location permissions for the app. Go to your phone's settings, find the Smart Parking app, and enable location access. Also check that your GPS is turned on.",
    },
    {
      id: 8,
      category: "app",
      question: "Can I use the app without internet connection?",
      answer:
        "You need an internet connection to search for parking spots and make reservations. However, your active reservation QR code will be accessible offline once it's been generated.",
    },
  ];

  // Filter FAQs based on active category and search query
  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Toggle FAQ expansion
  const toggleFAQ = (id) => {
    if (expandedFAQ === id) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(id);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          onClick={goBack}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-4">Help & Support</h1>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white shadow-sm">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search for help topics"
            className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - FAQs */}
      <div className="flex-grow overflow-auto p-4">
        {filteredFAQs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <HelpCircle size={64} className="text-blue-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Results Found</h2>
            <p className="text-gray-500 mb-4">
              We couldn't find any matches for your search. Try different keywords or browse our categories.
            </p>
            <button
              onClick={() => {setSearchQuery(""); setActiveCategory("all");}}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  className="w-full p-4 flex items-start justify-between text-left"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <div className="flex-grow pr-4">
                    <h3 className="font-bold text-gray-800">{faq.question}</h3>
                  </div>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown size={20} className="text-gray-500 mt-1 flex-shrink-0" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-500 mt-1 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4 text-gray-600 border-t border-gray-100 pt-2">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact Support Section */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Need more help?
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-gray-600 mb-4">
              If you couldn't find an answer to your question, you can contact our support team directly.
            </p>
            <div className="space-y-3">
              <button className="w-full py-3 bg-blue-600 text-white rounded-md font-medium flex items-center justify-center">
                <MessageSquare size={20} className="mr-2" />
                Start Live Chat
              </button>
              <button className="w-full py-3 border border-blue-600 text-blue-600 rounded-md font-medium flex items-center justify-center">
                <Mail size={20} className="mr-2" />
                Email Support
              </button>
              <button className="w-full py-3 border border-blue-600 text-blue-600 rounded-md font-medium flex items-center justify-center">
                <Phone size={20} className="mr-2" />
                Call Support
              </button>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Additional Resources
          </h2>
          <div className="space-y-3">
            <button className="w-full p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center">
                <HelpCircle size={20} className="text-blue-600 mr-3" />
                <span className="font-medium">User Guide</span>
              </div>
              <ExternalLink size={18} className="text-gray-400" />
            </button>
            <button className="w-full p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center">
                <HelpCircle size={20} className="text-blue-600 mr-3" />
                <span className="font-medium">Video Tutorials</span>
              </div>
              <ExternalLink size={18} className="text-gray-400" />
            </button>
            <button className="w-full p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center">
                <HelpCircle size={20} className="text-blue-600 mr-3" />
                <span className="font-medium">Privacy Policy</span>
              </div>
              <ExternalLink size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportScreen;