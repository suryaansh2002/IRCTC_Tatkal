import React, { useState, useEffect } from 'react';

const ipcRenderer = window.electron;

const App = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    source: '',
    destination: '',
    trainNumber: '',
    coachClass: '',
    journeyDate: '',
    passengerName: '',
    passengerAge: '',
    passengerGender: 'Male',
    foodPreference: 'V'
  });

  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (window.electron) {
      window.electron.receive('fromMain', (data) => {
        console.log('Received from main:', data);
      });

      window.electron.receive('python-message', (event, message) => {
        try {
          const parsedMessage = JSON.parse(message);
          if (parsedMessage.type === 'log') {
            setLogs(prev => [...prev, parsedMessage.message]);
          } else if (parsedMessage.type === 'status') {
            setStatus(parsedMessage.message);
          }
        } catch (e) {
          setLogs(prev => [...prev, message]);
        }
      });
    }

    return () => {
      if (window.electron) {
        window.electron.receive('python-message', () => {});
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.electron.send('schedule-booking', formData);
    setStatus('Scheduling booking...');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">IRCTC Booking Scheduler</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Credentials Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Login Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full border rounded p-2"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        {/* Journey Details Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Journey Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Source Station</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Destination Station</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.destination}
                onChange={e => setFormData({...formData, destination: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Train Number</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.trainNumber}
                onChange={e => setFormData({...formData, trainNumber: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Coach Class</label>
              <select
                className="w-full border rounded p-2"
                value={formData.coachClass}
                onChange={e => setFormData({...formData, coachClass: e.target.value})}
                required
              >
                <option value="">Select Class</option>
                <option value="AC 3 Tier (3A)">AC 3 Tier (3A)</option>
                <option value="AC 2 Tier (2A)">AC 2 Tier (2A)</option>
                <option value="AC First Class (1A)">AC First Class (1A)</option>
                <option value="Sleeper (SL)">Sleeper (SL)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Journey Date</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={formData.journeyDate}
                onChange={e => setFormData({...formData, journeyDate: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        {/* Passenger Details Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Passenger Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={formData.passengerName}
                onChange={e => setFormData({...formData, passengerName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={formData.passengerAge}
                onChange={e => setFormData({...formData, passengerAge: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                className="w-full border rounded p-2"
                value={formData.passengerGender}
                onChange={e => setFormData({...formData, passengerGender: e.target.value})}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Food Preference</label>
              <select
                className="w-full border rounded p-2"
                value={formData.foodPreference}
                onChange={e => setFormData({...formData, foodPreference: e.target.value})}
                required
              >
                <option value="V">Vegetarian</option>
                <option value="N">Non-Vegetarian</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Schedule Booking
        </button>
      </form>

      {status && (
  <div className="mt-6 p-4 bg-gray-100 rounded">
    <p>{status}</p>
  </div>
)}
      {logs.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
          <h3 className="font-semibold mb-2">Booking Logs:</h3>
          {logs.map((log, index) => (
            <div key={index} className="text-sm text-gray-600 mb-1">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;