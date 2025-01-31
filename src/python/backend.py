import sys
import json
import logging
from datetime import datetime
import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from irctc_booking import IRCTCBooking, BookingConfig, PassengerDetails

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def send_to_frontend(message_type, message):
    """Send formatted message to frontend"""
    print(json.dumps({
        'type': message_type,
        'message': message
    }))
    sys.stdout.flush()

class BookingManager:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        self.active_jobs = {}

    def booking_job(self, config, passenger):
        """Execute the booking process"""
        job_id = f"booking_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        try:
            send_to_frontend('log', f'Starting booking process for {passenger.name}')
            
            booking = IRCTCBooking(config)
            booking.initialize_driver()
            
            send_to_frontend('log', 'Initialized Chrome driver')
            
            booking.login()
            send_to_frontend('log', 'Successfully logged in to IRCTC')
            
            booking.handle_source_and_destination()
            send_to_frontend('log', 'Selected journey details')
            
            booking.select_train_and_class()
            send_to_frontend('log', f'Selected train {config.train_number}')
            
            booking.fill_passenger_details(passenger)
            send_to_frontend('log', 'Filled passenger details')
            
            booking.handle_final_captcha()
            send_to_frontend('log', 'Completed booking process')
            
        except Exception as e:
            error_msg = f'Booking failed: {str(e)}'
            logger.error(error_msg)
            send_to_frontend('status', error_msg)
        finally:
            if 'booking' in locals():
                booking.cleanup()
            
            if job_id in self.active_jobs:
                del self.active_jobs[job_id]

    def schedule_booking(self, booking_data):
        """Schedule a new booking job"""
        try:
            # Parse booking data
            journey_date = datetime.strptime(booking_data['journeyDate'], '%Y-%m-%d')
            
            config = BookingConfig(
                username=booking_data['username'],
                password=booking_data['password'],
                source=booking_data['source'],
                destination=booking_data['destination'],
                train_number=booking_data['trainNumber'],
                coach_class=booking_data['coachClass'],
                journey_date=journey_date.strftime('%d %B %Y')
            )
            
            passenger = PassengerDetails(
                name=booking_data['passengerName'],
                age=int(booking_data['passengerAge']),
                gender=booking_data['passengerGender'],
                food_preference=booking_data['foodPreference']
            )

            # Schedule job for 10 AM IST on journey date
            ist_timezone = pytz.timezone('Asia/Kolkata')
            print("JD: ", journey_date)
            trigger = CronTrigger(
                year=journey_date.year,
                month=journey_date.month,
                day=journey_date.day,
                hour=0,
                minute=0,
                timezone=ist_timezone
            )
            
            job = self.scheduler.add_job(
                self.booking_job,
                trigger=trigger,
                args=[config, passenger]
            )
            
            job_id = f"booking_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            self.active_jobs[job_id] = job
            
            success_msg = f'Booking scheduled for {journey_date.strftime("%d %B %Y")} at 10:00 AM IST'
            send_to_frontend('status', success_msg)
            send_to_frontend('log', success_msg)
            
        except Exception as e:
            error_msg = f'Failed to schedule booking: {str(e)}'
            logger.error(error_msg)
            send_to_frontend('status', error_msg)

def main():
    booking_manager = BookingManager()
    
    send_to_frontend('status', 'Backend service started')
    
    while True:
        try:
            print("In service")
            message = input()
            if message.strip():
                booking_data = json.loads(message)
                booking_manager.schedule_booking(booking_data)
        except Exception as e:
            logger.error(f'Error processing message: {str(e)}')
            send_to_frontend('status', f'Error: {str(e)}')

if __name__ == '__main__':
    main()