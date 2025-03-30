# OpenCV Workshop Web Application

A web-based image processing application built with Flask and OpenCV. This application allows users to upload images and apply various image processing operations with adjustable parameters and real-time previews.

## Features

- **Image Upload**: Upload your images for processing
- **Image Processing Operations**:
  - Grayscale conversion
  - Blurring with adjustable kernel size
  - Edge detection with adjustable thresholds
  - Contour detection with adjustable threshold
  - Interactive cropping
  - Horizontal and vertical flipping
  - Resizing with adjustable scale factor
- **Image History and Editing**:
  - Thumbnail history of all transformations
  - Undo/redo functionality
  - Preview transformations before applying
  - Save or cancel any transformation
  - Download processed images
- **Drawing Canvas**:
  - Draw on a blank black canvas
  - Tools include pencil, line, rectangle, circle, and eraser
  - Fill entire canvas with selected color
  - Adjustable drawing color and brush size
  - Save drawings for further processing

## Technologies Used

- **Backend**: Flask, OpenCV, NumPy
- **Frontend**: HTML, CSS, JavaScript
- **Styling**: TailwindCSS

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/Yassineachkhity/openCV_workshop.git
   cd openCV-project
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the application:
   ```
   python app.py
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Requirements

- Python 3.6+
- Flask
- OpenCV
- NumPy
- Pillow

## Project Structure

```
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── static/                 # Static files
│   ├── js/                 # JavaScript files
│   │   └── main.js         # Main JavaScript for frontend functionality
│   ├
│   └── uploads/            # Directory for uploaded and processed images
└── templates/              # HTML templates
    └── index.html          # Main webpage
```

## Usage

1. Upload an image using the upload button
2. Select an image processing operation from the sidebar
3. Adjust parameters using the sliders provided
4. Preview the transformation before applying
5. Click "Apply" to keep the changes or "Cancel" to revert
6. Use the image history thumbnails to jump back to any previous state
7. The drawing canvas can be used to create your own images from scratch
8. Save your final image using the download button

## Feature Details

### Image Transformations
- **Grayscale**: Convert the image to black and white
- **Blur**: Apply Gaussian blur with adjustable kernel size
- **Edge Detection**: Detect edges using Canny edge detector with adjustable thresholds
- **Contour Detection**: Find and highlight contours in the image
- **Crop**: Interactively select an area to crop
- **Flip**: Mirror the image horizontally or vertically
- **Resize**: Scale the image up or down

### Drawing Tools
- **Pencil**: Free-hand drawing
- **Line**: Draw straight lines
- **Rectangle**: Draw rectangles
- **Circle**: Draw circles
- **Eraser**: Erase parts of the drawing
- **Fill**: Fill the entire canvas with selected color
