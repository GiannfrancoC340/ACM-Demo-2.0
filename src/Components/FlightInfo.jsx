import { useParams, Link } from 'react-router-dom';

export default function FlightInfo() {
  const { flightId } = useParams();
  
  // Flight data - in a real app, this would come from a database
  const flightData = {
    'flight-1': {
      route: "RDU to BCT",
      time: "2:56 PM",
      boardingTime: "2:26 PM", // 30 minutes before departure
      arrivalTime: "5:11 PM", // departure + duration
      airline: "SkyWay Express",
      flightNumber: "SW1234",
      aircraft: "Cessna Citation CJ3",
      status: "On Time",
      gate: "A3",
      terminal: "Private Aviation Terminal",
      duration: "2 hours 15 minutes",
      distance: "678 miles",
      departureAirport: {
        code: "RDU",
        name: "Raleigh-Durham International Airport",
        city: "Raleigh",
        state: "North Carolina"
      },
      arrivalAirport: {
        code: "BCT",
        name: "Boca Raton Airport",
        city: "Boca Raton",
        state: "Florida"
      }
    },
    'flight-2': {
      route: "BCT to MIA",
      time: "4:30 PM",
      boardingTime: "4:00 PM", // 30 minutes before departure
      arrivalTime: "5:15 PM", // departure + duration
      airline: "Florida Connect",
      flightNumber: "FC567",
      aircraft: "Pilatus PC-12",
      status: "On Time",
      gate: "B2",
      terminal: "Main Terminal",
      duration: "45 minutes",
      distance: "52 miles",
      departureAirport: {
        code: "BCT",
        name: "Boca Raton Airport",
        city: "Boca Raton",
        state: "Florida"
      },
      arrivalAirport: {
        code: "MIA",
        name: "Miami International Airport",
        city: "Miami",
        state: "Florida"
      }
    },
    'flight-3': {
      route: "BCT to ATL",
      time: "5:15 PM",
      boardingTime: "4:45 PM", // 30 minutes before departure
      arrivalTime: "7:10 PM", // departure + duration
      airline: "Southern Airways",
      flightNumber: "SA789",
      aircraft: "Embraer Phenom 300",
      status: "On Time",
      gate: "C1",
      terminal: "Private Aviation Terminal",
      duration: "1 hour 55 minutes",
      distance: "581 miles",
      departureAirport: {
        code: "BCT",
        name: "Boca Raton Airport",
        city: "Boca Raton",
        state: "Florida"
      },
      arrivalAirport: {
        code: "ATL",
        name: "Hartsfield-Jackson Atlanta International Airport",
        city: "Atlanta",
        state: "Georgia"
      }
    },
    'flight-4': {
      route: "BCT to LGA",
      time: "6:45 PM",
      boardingTime: "6:15 PM", // 30 minutes before departure
      arrivalTime: "9:30 PM", // departure + duration
      airline: "East Coast Express",
      flightNumber: "ECE456",
      aircraft: "Bombardier Challenger 350",
      status: "Delayed (7:15 PM)",
      gate: "A5",
      terminal: "Private Aviation Terminal",
      duration: "2 hours 45 minutes",
      distance: "1,070 miles",
      departureAirport: {
        code: "BCT",
        name: "Boca Raton Airport",
        city: "Boca Raton",
        state: "Florida"
      },
      arrivalAirport: {
        code: "LGA",
        name: "LaGuardia Airport",
        city: "New York",
        state: "New York"
      }
    },
    'flight-5': {
      route: "MCO to BCT",
      time: "7:30 PM",
      boardingTime: "7:00 PM", // 30 minutes before departure
      arrivalTime: "8:20 PM", // departure + duration
      airline: "Florida Sky",
      flightNumber: "FS321",
      aircraft: "Beechcraft King Air 350",
      status: "On Time",
      gate: "D4",
      terminal: "Main Terminal",
      duration: "50 minutes",
      distance: "162 miles",
      departureAirport: {
        code: "MCO",
        name: "Orlando International Airport",
        city: "Orlando",
        state: "Florida"
      },
      arrivalAirport: {
        code: "BCT",
        name: "Boca Raton Airport",
        city: "Boca Raton",
        state: "Florida"
      }
    }
  };
  
  // Get the flight data for the selected flight
  const flight = flightData[flightId];
  
  if (!flight) {
    return (
      <div className="flight-not-found">
        <h2>Flight Not Found</h2>
        <p>Sorry, the flight information you requested could not be found.</p>
        <Link to="/map">Return to Map</Link>
      </div>
    );
  }
  
  return (
    <div className="flight-info-container">
      <div className="flight-header">
        <h1>{flight.route}</h1>
        <div className="flight-time">{flight.time}</div>
        <div className="flight-status">Status: <span className={`status ${flight.status.includes('Delayed') ? 'delayed' : 'on-time'}`}>{flight.status}</span></div>
      </div>
      
      <div className="flight-details">
        <div className="flight-card">
          <h2>Flight Details</h2>
          <table className="details-table">
            <tbody>
              <tr>
                <td>Airline:</td>
                <td>{flight.airline}</td>
              </tr>
              <tr>
                <td>Flight Number:</td>
                <td>{flight.flightNumber}</td>
              </tr>
              <tr>
                <td>Aircraft:</td>
                <td>{flight.aircraft}</td>
              </tr>
              <tr>
                <td>Duration:</td>
                <td>{flight.duration}</td>
              </tr>
              <tr>
                <td>Distance:</td>
                <td>{flight.distance}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flight-card">
          <h2>Departure</h2>
          <div className="airport-code">{flight.departureAirport.code}</div>
          <div className="airport-name">{flight.departureAirport.name}</div>
          <div className="airport-location">{flight.departureAirport.city}, {flight.departureAirport.state}</div>
          
          <div className="time-info">
            <div className="time-label">Boarding Time:</div>
            <div className="time-value">{flight.boardingTime}</div>
          </div>
          
          <div className="gate-info">
            <span>Terminal: {flight.terminal}</span>
            <span>Gate: {flight.gate}</span>
          </div>
        </div>
        
        <div className="flight-card">
          <h2>Arrival</h2>
          <div className="airport-code">{flight.arrivalAirport.code}</div>
          <div className="airport-name">{flight.arrivalAirport.name}</div>
          <div className="airport-location">{flight.arrivalAirport.city}, {flight.arrivalAirport.state}</div>
          
          <div className="time-info">
            <div className="time-label">Estimated Arrival:</div>
            <div className="time-value">{flight.arrivalTime}</div>
          </div>
        </div>
      </div>
      
      <div className="flight-actions">
        <Link to="/map" className="back-button">Back to Map</Link>
      </div>
    </div>
  );
}