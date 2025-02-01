import { useState, useEffect } from "react";

const ipcRenderer = window.electron;

const App = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    source: "",
    destination: "",
    trainNumber: "",
    coachClass: "",
    journeyDate: "",
    passengers: [
      {
        passengerName: "",
        passengerAge: "",
        passengerGender: "Male",
        foodPreference: "V",
      },
    ],
  });

  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (window.electron) {
      window.electron.receive("fromMain", (data) => {
        console.log("Received from main:", data);
      });
      window.electron.receive("python-message", (event, message) => {
        try {
          const parsedMessage = JSON.parse(event);
          console.log("In receive", parsedMessage, parsedMessage.type);
          if (parsedMessage.type === "log") {
            setLogs((prev) => [...prev, parsedMessage.message]);
          } else if (parsedMessage.type === "status") {
            console.log("Status is: ", parsedMessage.message);
            setStatus(parsedMessage.message);
          }
        } catch (e) {
          setLogs((prev) => [...prev, message]);
        }
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.electron.send("schedule-booking", formData);
    setStatus("Scheduling booking...");
  };

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...formData.passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setFormData({ ...formData, passengers: newPassengers });
  };

  const addPassenger = () => {
    setFormData({
      ...formData,
      passengers: [
        ...formData.passengers,
        {
          passengerName: "",
          passengerAge: "",
          passengerGender: "Male",
          foodPreference: "V",
        },
      ],
    });
  };

  const removePassenger = (index) => {
    const newPassengers = formData.passengers.filter((_, i) => i !== index);
    setFormData({ ...formData, passengers: newPassengers });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
            IRCTC Tatkal Booking Scheduler
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Login Details Section */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Login Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Journey Details Section */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Journey Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Station
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Station
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Train Number
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.trainNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, trainNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coach Class
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.coachClass}
                    onChange={(e) =>
                      setFormData({ ...formData, coachClass: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="AC 3 Tier (3A)">AC 3 Tier (3A)</option>
                    <option value="AC 2 Tier (2A)">AC 2 Tier (2A)</option>
                    <option value="AC First Class (1A)">
                      AC First Class (1A)
                    </option>
                    <option value="Sleeper (SL)">Sleeper (SL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Journey Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.journeyDate}
                    onChange={(e) =>
                      setFormData({ ...formData, journeyDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Passenger Details Section */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Passenger Details
              </h2>
              {formData.passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="mb-6 pb-6 border-b border-gray-200 last:border-b-0"
                >
                  <h3 className="text-lg font-medium mb-4 text-gray-700">
                    Passenger {index + 1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={passenger.passengerName}
                        onChange={(e) =>
                          handlePassengerChange(
                            index,
                            "passengerName",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={passenger.passengerAge}
                        onChange={(e) =>
                          handlePassengerChange(
                            index,
                            "passengerAge",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={passenger.passengerGender}
                        onChange={(e) =>
                          handlePassengerChange(
                            index,
                            "passengerGender",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Food Preference
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={passenger.foodPreference}
                        onChange={(e) =>
                          handlePassengerChange(
                            index,
                            "foodPreference",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="V">Vegetarian</option>
                        <option value="N">Non-Vegetarian</option>
                      </select>
                    </div>
                  </div>
                  {formData.passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(index)}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Remove Passenger
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPassenger}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Add Passenger
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors font-semibold text-lg shadow-md"
            >
              Schedule Booking
            </button>
          </form>

          {status ? (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-700 font-medium">{logs.includes('Completed booking process')  ? 'Booking Completed' :  status}</p>
            </div>
          )
        : <></>
        }
          
          {logs.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto border border-gray-200">
              <h3 className="font-semibold mb-2 text-gray-700">
                Booking Logs:
              </h3>
              {logs.map((log, index) => ( index%2 ? 
                <div key={index} className="text-sm text-gray-600 mb-1">
                  {log}
                </div> : <></>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
