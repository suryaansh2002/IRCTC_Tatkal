
# IRCTC Booking App

An application for scheduling Tatkal IRCTC train bookings using Electron, React, and Python. This app automates the booking process on the IRCTC website, allowing users to schedule bookings in advance.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Building for Distribution](#building-for-distribution)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Automated Booking**: Schedule Tatkal train bookings on the IRCTC website.
- **Cross-Platform**: Available for both Windows and macOS.
- **User-Friendly Interface**: Built with React for a smooth user experience.
- **Secure**: Uses Electron's context isolation for secure IPC communication.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **Python**: Python 3.x is required for the backend scripts.
- **Tesseract OCR**: Required for captcha solving. Install it from [tesseract-ocr.github.io](https://tesseract-ocr.github.io/).

## Installation

1. **Clone the Repository**:
   - Use `git clone` to download the repository to your local machine.
   - Navigate into the project directory.

2. **Install Dependencies**:
   - Run `npm install` to install all Node.js dependencies.

3. **Set Up Python Environment**:
   - Create a virtual environment using `python -m venv venv`.
   - Activate the virtual environment.
   - Install Python dependencies using `pip install -r requirements.txt`.

## Usage

1. **Start the Application**:
   - Run `npm start` to launch the application in development mode.

2. **Access the App**:
   - The app will open in a new window. Fill in the required details and schedule your booking.

## Development

### Code Structure

- **Electron Main Process**: Manages window creation and IPC communication with the Python backend.
- **React Frontend**: Provides the user interface for entering booking details and viewing logs.
- **Python Backend**: Handles the booking logic, communicates with the IRCTC website, and sends status updates to the frontend.

### Running in Development Mode

- **Frontend**: The React app is served using Vite, a fast development server.
- **Backend**: The Python script is spawned by the Electron main process and runs in the background.

## Building for Distribution

To build the application for both Windows and macOS, run `npm run build`. This command uses `electron-builder` to package the app, generating `.dmg` and `.exe` files in the `dist` directory.

## Configuration

- **Vite Configuration**: Configures the development server, including the port and any plugins used.
- **Tailwind CSS**: Utilized for styling the React components, providing a utility-first CSS framework.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes. Ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

