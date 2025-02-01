import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException, 
    TimeoutException, 
    ElementNotInteractableException
)
from PIL import Image
import pytesseract
import time
import io
from typing import Dict, Optional
from dataclasses import dataclass
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import pytz

# Configuration
@dataclass
class BookingConfig:
    username: str
    password: str
    source: str
    destination: str
    train_number: str
    coach_class: str
    journey_date: str
    quota: str = "TATKAL"
    wait_time: int = 10
    tesseract_path: str = r'/opt/homebrew/bin/tesseract'
    irctc_url: str = "https://www.irctc.co.in/nget/train-search"

@dataclass
class PassengerDetails:
    name: str
    age: int
    gender: str
    food_preference: str
    country: str = "India"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IRCTCBooking:
    def __init__(self, config: BookingConfig):
        self.config = config
        pytesseract.pytesseract.tesseract_cmd = config.tesseract_path
        self.driver = None
        self.wait = None

    def initialize_driver(self):
        """Initialize the web driver and wait object"""
        try:
            self.driver = webdriver.Chrome()
            self.wait = WebDriverWait(self.driver, self.config.wait_time)
            self.driver.maximize_window()
            logger.info("Web driver initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize web driver: {str(e)}")
            raise

    def solve_captcha(self) -> str:
        """Solve the captcha using OCR"""
        try:
            captcha_img = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "captcha-img"))
            )
            captcha_screenshot = captcha_img.screenshot_as_png
            captcha_image = Image.open(io.BytesIO(captcha_screenshot))
            captcha_text = pytesseract.image_to_string(
                captcha_image, 
                config="--psm 6"
            ).strip()
            logger.info("Captcha processed successfully")
            return captcha_text
        except Exception as e:
            logger.error(f"Failed to solve captcha: {str(e)}")
            raise

    def login(self):
        """Handle the login process"""
        try:
            self.driver.get(self.config.irctc_url)
            login_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//a[text()=' LOGIN ']"))
            )
            login_button.click()
            
            time.sleep(2)  # Wait for form load
            
            username_field = self.driver.find_element(
                By.XPATH, "//input[@placeholder='User Name']"
            )
            password_field = self.driver.find_element(
                By.XPATH, "//input[@placeholder='Password']"
            )
            
            username_field.send_keys(self.config.username)
            password_field.send_keys(self.config.password)
            
            captcha_text = self.solve_captcha()
            captcha_field = self.driver.find_element(
                By.XPATH, "//input[@placeholder='Enter Captcha']"
            )
            captcha_field.send_keys(captcha_text)
            
            submit_button = self.driver.find_element(
                By.XPATH, "//button[text()='SIGN IN']"
            )
            submit_button.click()
            logger.info("Login successful")
            
            time.sleep(2)  # Wait for login completion
        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            raise

    def select_journey_date(self):
        """Select the journey date from the calendar"""
        try:
            calendar_input = self.wait.until(
                EC.element_to_be_clickable((By.ID, "jDate"))
            )
            calendar_input.click()
            time.sleep(1)

            day, month, year = self.config.journey_date.split(" ")
            
            while True:
                current_year = self.driver.find_element(
                    By.XPATH, "//span[contains(@class, 'ui-datepicker-year')]"
                ).text
                current_month = self.driver.find_element(
                    By.XPATH, "//span[contains(@class, 'ui-datepicker-month')]"
                ).text
                
                if current_year == year and current_month == month.capitalize():
                    break

                next_button = self.driver.find_element(
                    By.CLASS_NAME, "ui-datepicker-next"
                )
                next_button.click()
                time.sleep(0.5)

            day_element = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, f"//a[text()='{int(day)}']"))
            )
            day_element.click()
            logger.info(f"Journey date selected: {self.config.journey_date}")
        except Exception as e:
            logger.error(f"Failed to select journey date: {str(e)}")
            raise

    def handle_source_and_destination(self):
        """Handle source and destination selection"""
        try:
            source_field = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//input[@aria-controls='pr_id_1_list']")
                )
            )
            source_field.send_keys(self.config.source)
            time.sleep(1)
            
            source_first_option = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//ul[@id='pr_id_1_list']/li[1]")
                )
            )
            source_first_option.click()

            destination_field = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//input[@aria-controls='pr_id_2_list']")
                )
            )
            destination_field.send_keys(self.config.destination)
            time.sleep(1)
            
            destination_first_option = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//ul[@id='pr_id_2_list']/li[1]")
                )
            )
            destination_first_option.click()

            journey_quota_dropdown = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//p-dropdown[@id='journeyQuota']")
                )
            )
            journey_quota_dropdown.click()
            
            tatkal_option = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, f"//li[@role='option' and @aria-label='{self.config.quota}']")
                )
            )
            tatkal_option.click()

            self.select_journey_date()
            time.sleep(2)

            find_trains_button = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[@type='submit' and contains(@class, 'search_btn train_Search')]")
                )
            )
            find_trains_button.click()
            logger.info("Source and destination details submitted successfully")
        except Exception as e:
            logger.error(f"Failed to handle source and destination: {str(e)}")
            raise

    def select_train_and_class(self):
        """Select the specified train and class"""
        try:
            time.sleep(2)  # Wait for train list to load
            divs = self.driver.find_elements(By.CLASS_NAME, "bull-back")
            
            for div in divs:
                if self.config.train_number in div.text:
                    strong_tag = div.find_element(
                        By.XPATH, f".//strong[text()='{self.config.coach_class}']"
                    )
                    strong_tag.click()
                    
                    td_element = self.wait.until(
                        EC.presence_of_element_located(
                            (By.XPATH, "//td[contains(@class, 'link') and contains(@class, 'ng-star-inserted')]")
                        )
                    )
                    
                    td_text = td_element.text.strip().upper()
                    if "NOT AVAILABLE" in td_text or "REGRET" in td_text:
                        logger.error("Selected option is not available")
                        raise Exception("Selected train/class not available")
                    
                    td_element.click()
                    book_now_button = div.find_element(
                        By.XPATH, ".//button[contains(@class, 'train_Search') and contains(text(), 'Book Now')]"
                    )
                    book_now_button.click()
                    logger.info(f"Selected train {self.config.train_number} and class {self.config.coach_class}")
                    return
                    
            raise Exception(f"Train {self.config.train_number} not found")
        except Exception as e:
            logger.error(f"Failed to select train and class: {str(e)}")
            raise

    def fill_passenger_details(self, all_passengers):
        """Fill in the passenger details"""
        try:
            self.wait.until(
                EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Name']"))
            )

            for index in range(len(all_passengers)):
                passenger = all_passengers[index]

                # Find all name input elements and use the one corresponding to the current index.
                name_inputs = self.driver.find_elements(By.XPATH, "//input[@placeholder='Name']")
                if index < len(name_inputs):
                    name_input = name_inputs[index]
                    name_input.clear()
                    name_input.send_keys(passenger.name)
                else:
                    logger.error(f"No name input found for passenger index {index}")

                # Find all age input elements.
                age_inputs = self.driver.find_elements(By.XPATH, "//input[@formcontrolname='passengerAge']")
                if index < len(age_inputs):
                    age_input = age_inputs[index]
                    age_input.clear()
                    age_input.send_keys(str(passenger.age))
                else:
                    logger.error(f"No age input found for passenger index {index}")

                # Find all gender select elements.
                gender_select_elements = self.driver.find_elements(By.XPATH, "//select[@formcontrolname='passengerGender']")
                if index < len(gender_select_elements):
                    gender_select = Select(gender_select_elements[index])
                    gender_mapping = {'Male': 'M', 'Female': 'F', 'Transgender': 'T'}
                    gender_value = gender_mapping.get(passenger.gender, 'M')
                    gender_select.select_by_value(gender_value)
                else:
                    logger.error(f"No gender select found for passenger index {index}")

                # Wait and find all food dropdown elements.
                try:
                    # Wait until all food dropdowns are present
                    self.wait.until(EC.presence_of_all_elements_located((By.XPATH, "//select[@id='FOOD_0']")))
                    food_dropdowns = self.driver.find_elements(By.XPATH, "//select[@id='FOOD_0']")
                    if index < len(food_dropdowns):
                        dropdown = food_dropdowns[index]
                        food_select = Select(dropdown)
                        food_select.select_by_value(passenger.food_preference)
                        logger.info(f"Food preference '{passenger.food_preference}' selected for passenger index {index}")
                    else:
                        logger.warning(f"No food dropdown available for passenger index {index}")
                except Exception as e:
                    logger.warning(f"Food selection not available for passenger index {index}: {str(e)}")

                # If not the last passenger, click the "+ Add Passenger" button to add the next one.
                if index != len(all_passengers) - 1:
                    try:
                        # Find the add passenger button. Adjust this locator if necessary.
                        add_passenger_elements = self.driver.find_elements(By.XPATH, "//span[contains(text(),'+ Add Passenger')]")
                        if add_passenger_elements:
                            add_passenger_element = add_passenger_elements[0]
                            add_passenger_element.click()
                        else:
                            logger.error("'+ Add Passenger' button not found")
                    except Exception as e:
                        logger.error(f"Error clicking '+ Add Passenger' for passenger index {index}: {str(e)}")

            continue_button = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(@class, 'train_Search') and contains(text(), 'Continue')]")
                )
            )
            continue_button.click()
            logger.info("Passenger details submitted successfully")
        except Exception as e:
            logger.error(f"Failed to fill passenger details: {str(e)}")
            raise

    def handle_final_captcha(self):
        """Handle the final captcha before booking confirmation"""
        try:
            time.sleep(10)
            captcha_text = self.solve_captcha()
            captcha_field = self.driver.find_element(
                By.XPATH, "//input[@placeholder='Enter Captcha']"
            )
            captcha_field.send_keys(captcha_text)

            submit_button = self.driver.find_element(
                By.XPATH, "//button[text()='Continue ']"
            )
            time.sleep(10)
            
            submit_button.click()
            logger.info("Final captcha submitted successfully")
        except Exception as e:
            logger.error(f"Failed to handle final captcha: {str(e)}")
            raise

    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()
            logger.info("Browser session closed")


def schedule_booking(config: BookingConfig, all_passengers):
    """Schedule the booking job for 10 AM IST on journey date"""
    scheduler = BlockingScheduler()
    
    # Parse journey date
    journey_date = datetime.strptime(config.journey_date, "%d %B %Y")
    
    # Create booking function
    def booking_job():
        booking = IRCTCBooking(config)
        try:
            booking.initialize_driver()
            booking.login()
            booking.handle_source_and_destination()
            time.sleep(2)
            booking.select_train_and_class()
            time.sleep(2)
            booking.fill_passenger_details(all_passengers)
            time.sleep(20)
            # booking.handle_final_captcha()
            time.sleep(60)
        except Exception as e:
            logger.error(f"Booking failed: {str(e)}")
        finally:
            booking.cleanup()

    # Schedule job for 10 AM IST on journey date
    ist_timezone = pytz.timezone('Asia/Kolkata')
    trigger = CronTrigger(
        year=journey_date.year,
        month=journey_date.month,
        day=journey_date.day,
        hour=10,
        minute=0,
        timezone=ist_timezone
    )
    
    scheduler.add_job(booking_job, trigger=trigger)
    
    try:
        logger.info(f"Scheduler started. Will run at 10 AM IST on {config.journey_date}")
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()


def booking_main(config, all_passengers):
    booking = IRCTCBooking(config)
    try:
        booking.initialize_driver()
        booking.login()
        booking.handle_source_and_destination()
        time.sleep(2)
        booking.select_train_and_class()
        time.sleep(2)
        booking.fill_passenger_details(all_passengers)
        time.sleep(20)
        # booking.handle_final_captcha()
        # time.sleep(60)
    except Exception as e:
        logger.error(f"Booking failed: {str(e)}")
    finally:
        booking.cleanup()


def main():
    config = BookingConfig(
        username="Suryaansh2002",
        password="Suryaansh*123*",
        source="Pune",
        destination="PNVL",
        train_number="22150",
        coach_class="AC 3 Tier (3A)",
        journey_date="02 February 2025"
    )

    passenger1 = PassengerDetails(
        name="John Doe",
        age=25,
        gender="Male",
        food_preference="V"
    )

    passenger2 = PassengerDetails(
        name="Jane Doe",
        age=22,
        gender="Female",
        food_preference="V"
    )

    all_passengers = [passenger1, passenger2]

    schedule_booking(config, all_passengers)
    # booking_main(config, all_passengers)
    

if __name__ == "__main__":
    main()