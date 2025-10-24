import React, { useState } from 'react';
import { CreditCard, Plus, Wallet, ChevronRight, Clock, CheckCircle, Calendar } from 'lucide-react';

const PaymentsTab = () => {
  const [activeSection, setActiveSection] = useState('methods');
  
  // Mock payment methods
  const paymentMethods = [
    { id: 1, type: 'Credit Card', name: 'Visa', last4: '4567', expiryDate: '12/27', isDefault: true },
    { id: 2, type: 'E-Wallet', name: 'E-Wallet', account: 'user@email.com', isDefault: false }
  ];
  
  // Mock transaction history
  const transactions = [
    { 
      id: 1, 
      location: 'Central Mall Parking', 
      date: 'Apr 19, 2025',
      time: '13:00 - 15:30', 
      amount: '10.000', 
      status: 'completed' 
    },
    { 
      id: 2, 
      location: 'City Plaza Parking', 
      date: 'Apr 16, 2025',
      time: '10:00 - 12:00', 
      amount: '14.000', 
      status: 'completed' 
    },
    { 
      id: 3, 
      location: 'Station Parking', 
      date: 'Apr 12, 2025',
      time: '09:00 - 11:00', 
      amount: '8.000', 
      status: 'completed' 
    }
  ];
  
  return (
    <div className="flex flex-col h-full p-8">
      <h1 className="text-xl font-bold mb-4">Payments</h1>
      
      {/* Section Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button 
          className={`flex-1 py-2 rounded-md text-center text-sm font-medium ${
            activeSection === 'methods' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
          }`}
          onClick={() => setActiveSection('methods')}
        >
          Payment Methods
        </button>
        <button 
          className={`flex-1 py-2 rounded-md text-center text-sm font-medium ${
            activeSection === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
          }`}
          onClick={() => setActiveSection('history')}
        >
          Transaction History
        </button>
      </div>
      
      {/* Payment Methods Section */}
      {activeSection === 'methods' && (
        <div>
          {/* Payment methods list */}
          <div className="space-y-3 mb-4">
            {paymentMethods.map(method => (
              <div 
                key={method.id} 
                className={`bg-white rounded-lg p-4 flex items-center justify-between ${
                  method.isDefault ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center">
                  {method.type === 'Credit Card' ? (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <CreditCard size={20} className="text-blue-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Wallet size={20} className="text-green-600" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-bold text-gray-800">{method.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {method.last4 ? `**** **** **** ${method.last4}` : method.account}
                    </p>
                    {method.expiryDate && (
                      <p className="text-gray-500 text-xs">Expires: {method.expiryDate}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  {method.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full mr-2">
                      Default
                    </span>
                  )}
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Add payment method button */}
          <button className="w-full bg-white border border-gray-300 text-blue-600 rounded-lg py-3 font-medium flex items-center justify-center">
            <Plus size={20} className="mr-2" />
            Add Payment Method
          </button>
        </div>
      )}
      
      {/* Transaction History Section */}
      {activeSection === 'history' && (
        <div className="space-y-3">
          {transactions.map(transaction => (
            <div key={transaction.id} className="bg-white rounded-lg p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{transaction.location}</h3>
                  <div className="flex items-center mt-1 text-gray-600 text-sm">
                    <Calendar size={14} className="mr-1" />
                    <span>{transaction.date}</span>
                  </div>
                  <div className="flex items-center mt-1 text-gray-600 text-sm">
                    <Clock size={14} className="mr-1" />
                    <span>{transaction.time}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-gray-800">Rp {transaction.amount}</p>
                  <div className="flex items-center justify-end mt-1 text-green-600 text-sm">
                    <CheckCircle size={14} className="mr-1" />
                    <span>Paid</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-3">
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-l-md text-sm">
                  Receipt
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-r-md text-sm">
                  Details
                </button>
              </div>
            </div>
          ))}
          
          <button className="w-full bg-white border border-gray-300 text-blue-600 rounded-lg py-3 font-medium">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;