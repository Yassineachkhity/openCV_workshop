import os
import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import base64
from PIL import Image
import io

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'filepath': f'/static/uploads/{filename}'
        })
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/process', methods=['POST'])
def process_image():
    data = request.json
    filename = data.get('filename')
    operation = data.get('operation')
    params = data.get('params', {})
    
    if not filename or not operation:
        return jsonify({'error': 'Missing filename or operation'}), 400
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    # Read the image
    img = cv2.imread(filepath)
    
    # Process image based on the requested operation
    result_img = None
    
    if operation == 'grayscale':
        result_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Convert back to 3 channels for consistent display
        result_img = cv2.cvtColor(result_img, cv2.COLOR_GRAY2BGR)
    
    elif operation == 'blur':
        kernel_size = int(params.get('kernel_size', 5))
        result_img = cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)
    
    elif operation == 'edge':
        threshold1 = int(params.get('threshold1', 100))
        threshold2 = int(params.get('threshold2', 200))
        result_img = cv2.Canny(img, threshold1, threshold2)
        # Convert back to 3 channels for consistent display
        result_img = cv2.cvtColor(result_img, cv2.COLOR_GRAY2BGR)
    
    elif operation == 'contour':
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        threshold = int(params.get('threshold', 127))
        ret, thresh = cv2.threshold(blur, threshold, 255, cv2.THRESH_BINARY)
        contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        result_img = img.copy()
        cv2.drawContours(result_img, contours, -1, (0, 255, 0), 2)
    
    elif operation == 'crop':
        x = int(params.get('x', 0))
        y = int(params.get('y', 0))
        width = int(params.get('width', img.shape[1] // 2))
        height = int(params.get('height', img.shape[0] // 2))
        result_img = img[y:y+height, x:x+width]
    
    elif operation == 'flip':
        flip_code = int(params.get('flip_code', 1))
        result_img = cv2.flip(img, flip_code)
    
    elif operation == 'resize':
        scale = float(params.get('scale', 1.0))
        width = int(img.shape[1] * scale)
        height = int(img.shape[0] * scale)
        result_img = cv2.resize(img, (width, height), interpolation=cv2.INTER_AREA)
    
    else:
        return jsonify({'error': 'Unknown operation'}), 400
    
    # Save the processed image
    result_filename = f"processed_{operation}_{filename}"
    result_filepath = os.path.join(app.config['UPLOAD_FOLDER'], result_filename)
    cv2.imwrite(result_filepath, result_img)
    
    return jsonify({
        'success': True,
        'result_filename': result_filename,
        'result_filepath': f'/static/uploads/{result_filename}'
    })

@app.route('/save_canvas', methods=['POST'])
def save_canvas():
    data = request.json
    image_data = data.get('imageData')
    
    if not image_data:
        return jsonify({'error': 'No image data provided'}), 400
    
    # Remove the data URL header
    image_data = image_data.split(',')[1]
    
    # Decode the base64 image
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    # Save the image
    filename = f"drawing_{os.urandom(4).hex()}.png"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image.save(filepath)
    
    return jsonify({
        'success': True,
        'filename': filename,
        'filepath': f'/static/uploads/{filename}'
    })

if __name__ == '__main__':
    app.run(debug=True) 