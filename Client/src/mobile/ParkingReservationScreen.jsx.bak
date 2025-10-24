import React, { useState, useEffect } from 'react';
import { ArrowLeft, Car, Clock, Calendar, CreditCard, Info } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const ParkingReservationScreen = () => {
  const { id } = useParams(); // Mengambil parameter ID dari URL
  const navigate = useNavigate(); // Hook untuk navigasi
  
  const [duration, setDuration] = useState(2); // Default 2 hours
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('Now');
  const [selectedSlot, setSelectedSlot] = useState('B-42');
  
  // Mock parking lot data untuk berbagai ID
  const parkingLotsData = {
    1: {
      name: 'Central Mall Parking',
      address: 'Jl. Sudirman No. 123, Jakarta',
      price: 5000, // per hour
      openHours: '06:00 - 22:00',
      availableSlots: 42,
      totalSlots: 120
    },
    2: {
      name: 'City Plaza Parking',
      address: 'Jl. MH Thamrin No. 456, Jakarta',
      price: 7000, // per hour
      openHours: '06:00 - 00:00',
      availableSlots: 15,
      totalSlots: 80
    },
    3: {
      name: 'Station Parking',
      address: 'Jl. Gatot Subroto No. 789, Jakarta',
      price: 4000, // per hour
      openHours: '05:00 - 23:00',
      availableSlots: 8,
      totalSlots: 60
    }
  };
  
  // Mendapatkan data parkir berdasarkan ID
  const parkingLot = parkingLotsData[id] || parkingLotsData[1]; // Default ke ID 1 jika ID tidak valid
  
  // Mock payment methods
  const paymentMethods = [
    { id: 1, name: 'Credit Card', last4: '4567', isDefault: true },
    { id: 2, name: 'E-Wallet', account: 'johndoe@wallet.com', isDefault: false }
  ];
  
  // Handle duration change
  const handleDurationChange = (value) => {
    if (duration + value >= 1 && duration + value <= 12) {
      setDuration(duration + value);
    }
  };
  
  // Function to change selected slot
  const changeSlot = (newSlot) => {
    setSelectedSlot(newSlot);
  };
  
  // Fungsi untuk kembali ke halaman sebelumnya
  const goBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };
  
  // Fungsi untuk mengonfirmasi reservasi
  const confirmReservation = () => {
    // Di sini bisa menambahkan logika untuk menyimpan reservasi
    // Kemudian navigasi kembali ke halaman utama
    navigate('/mobile', { state: { reservationConfirmed: true } });
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-600 text-white flex items-center">
        <ArrowLeft size={24} className="mr-3 cursor-pointer" onClick={goBack} />
        <h1 className="text-xl font-bold">Reserve Parking</h1>
      </div>
      
      {/* Parking Information */}
      <div className="bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">{parkingLot.name}</h2>
        <p className="text-gray-600 mt-1">{parkingLot.address}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{parkingLot.openHours}</span>
          </div>
          <div className="text-sm">
            <span className="text-green-600 font-bold">{parkingLot.availableSlots}</span>
            <span className="text-gray-600">/{parkingLot.totalSlots} available</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow overflow-auto p-4">
        {/* Select Slot Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Selected Slot</h3>
          
          <div className="border border-blue-500 rounded-lg p-3 bg-blue-50 flex items-center justify-between">
            <div className="flex items-center">
              <Car size={20} className="text-blue-500 mr-2" />
              <span className="font-bold text-blue-600">Slot {selectedSlot}</span>
            </div>
            <button 
              className="text-blue-600 text-sm font-medium"
              onClick={() => changeSlot(selectedSlot === 'B-42' ? 'A-15' : 'B-42')}
            >
              Change
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-500 flex items-center">
            <Info size={14} className="mr-1" />
            <span>Level B, Near elevator, Standard size</span>
          </div>
        </div>
        
        {/* Date & Time Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Date & Time</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Date</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option>Today</option>
                <option>Tomorrow</option>
                <option>Select date...</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Time</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option>Now</option>
                <option>In 30 minutes</option>
                <option>In 1 hour</option>
                <option>Select time...</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 block mb-1">Duration</label>
            <div className="flex items-center">
              <button 
                className="w-10 h-10 bg-gray-200 rounded-l-md flex items-center justify-center font-bold"
                onClick={() => handleDurationChange(-1)}
              >
                -
              </button>
              <div className="flex-grow text-center border-t border-b border-gray-300 py-2">
                <span className="font-bold text-lg">{duration}</span>
                <span className="text-gray-600"> hour{duration !== 1 ? 's' : ''}</span>
              </div>
              <button 
                className="w-10 h-10 bg-gray-200 rounded-r-md flex items-center justify-center font-bold"
                onClick={() => handleDurationChange(1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        {/* Payment Method Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Payment Method</h3>
          
          {paymentMethods.map((method) => (
            <div 
              key={method.id}
              className={`border rounded-lg p-3 flex items-center justify-between mb-2 ${
                method.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CreditCard size={20} className={method.isDefault ? 'text-blue-500' : 'text-gray-500'} />
                <div className="ml-3">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-gray-600">
                    {method.last4 ? `**** **** **** ${method.last4}` : method.account}
                  </p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                {method.isDefault && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
              </div>
            </div>
          ))}
          
          <button className="text-blue-600 font-medium text-sm mt-2">+ Add payment method</button>
        </div>
      </div>
      
      {/* Reservation Summary */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between mb-3">
          <div className="text-gray-600">
            <p>Duration:</p>
            <p>Parking Fee:</p>
            <p>Service Fee:</p>
          </div>
          <div className="text-right font-medium">
            <p>{duration} hour{duration !== 1 ? 's' : ''}</p>
            <p>Rp {(parkingLot.price * duration).toLocaleString()}</p>
            <p>Rp 2.000</p>
          </div>
        </div>
        
        <div className="flex justify-between font-bold border-t border-gray-200 pt-3 text-lg">
          <p>Total</p>
          <p>Rp {(parkingLot.price * duration + 2000).toLocaleString()}</p>
        </div>
        
        <button 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-4"
          onClick={confirmReservation}
        >
          Confirm Reservation
        </button>
      </div>
    </div>
  );
};

export default ParkingReservationScreen;