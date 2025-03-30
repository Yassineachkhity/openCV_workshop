document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const imageProcessingOptions = document.getElementById('imageProcessingOptions');
    const drawingCanvasContainer = document.getElementById('drawingCanvasContainer');
    const imageDisplayContainer = document.getElementById('imageDisplayContainer');
    const showDrawingCanvasBtn = document.getElementById('showDrawingCanvasBtn');
    const closeDrawingCanvasBtn = document.getElementById('closeDrawingCanvasBtn');
    const imageHistoryContainer = document.getElementById('imageHistory');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const transformControls = document.getElementById('transformControls');
    const confirmTransform = document.getElementById('confirmTransform');
    const cancelTransform = document.getElementById('cancelTransform');
    const transformPreview = document.getElementById('transformPreview');
    const previewImage = document.getElementById('previewImage');
    const imageContainer = document.getElementById('imageContainer');
    const imageInfo = document.getElementById('imageInfo');
    const imageDimensions = document.getElementById('imageDimensions');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Image processing buttons
    const grayscaleBtn = document.getElementById('grayscaleBtn');
    const blurBtn = document.getElementById('blurBtn');
    const edgeBtn = document.getElementById('edgeBtn');
    const contourBtn = document.getElementById('contourBtn');
    const cropBtn = document.getElementById('cropBtn');
    const flipHorizBtn = document.getElementById('flipHorizBtn');
    const flipVertBtn = document.getElementById('flipVertBtn');
    const resizeBtn = document.getElementById('resizeBtn');
    
    // Parameter elements
    const blurParams = document.getElementById('blurParams');
    const blurKernelSize = document.getElementById('blurKernelSize');
    const blurKernelSizeValue = document.getElementById('blurKernelSizeValue');
    
    const edgeParams = document.getElementById('edgeParams');
    const edgeThreshold1 = document.getElementById('edgeThreshold1');
    const edgeThreshold1Value = document.getElementById('edgeThreshold1Value');
    const edgeThreshold2 = document.getElementById('edgeThreshold2');
    const edgeThreshold2Value = document.getElementById('edgeThreshold2Value');
    
    const contourParams = document.getElementById('contourParams');
    const contourThreshold = document.getElementById('contourThreshold');
    const contourThresholdValue = document.getElementById('contourThresholdValue');
    
    const resizeParams = document.getElementById('resizeParams');
    const resizeScale = document.getElementById('resizeScale');
    const resizeScaleValue = document.getElementById('resizeScaleValue');
    
    // Drawing canvas elements
    const drawingCanvas = document.getElementById('drawingCanvas');
    const ctx = drawingCanvas.getContext('2d');
    const pencilTool = document.getElementById('pencilTool');
    const lineTool = document.getElementById('lineTool');
    const rectangleTool = document.getElementById('rectangleTool');
    const circleTool = document.getElementById('circleTool');
    const eraserTool = document.getElementById('eraserTool');
    const drawingColor = document.getElementById('drawingColor');
    const drawingSize = document.getElementById('drawingSize');
    const drawingSizeValue = document.getElementById('drawingSizeValue');
    const clearCanvas = document.getElementById('clearCanvas');
    const fillCanvas = document.getElementById('fillCanvas');
    const saveDrawing = document.getElementById('saveDrawing');
    
    // Global state
    let currentImage = null;
    let previousImage = null;
    let isDrawing = false;
    let startX, startY;
    let currentTool = 'pencil';
    let currentDrawingColor = '#ffffff';
    let currentDrawingSize = 5;
    let isPreviewingTransform = false;
    let lastOperation = '';
    let lastParams = {};
    
    // Image history
    let imageHistoryArray = [];
    let currentHistoryIndex = -1;
    let maxHistorySize = 20;
    
    // Initialize black canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    // Event Listeners for Image Upload and Processing
    imageUpload.addEventListener('change', handleImageUpload);
    grayscaleBtn.addEventListener('click', () => previewTransform('grayscale'));
    blurBtn.addEventListener('click', toggleParams.bind(null, blurParams));
    edgeBtn.addEventListener('click', toggleParams.bind(null, edgeParams));
    contourBtn.addEventListener('click', toggleParams.bind(null, contourParams));
    cropBtn.addEventListener('click', enableCropping);
    flipHorizBtn.addEventListener('click', () => previewTransform('flip', { flip_code: 1 }));
    flipVertBtn.addEventListener('click', () => previewTransform('flip', { flip_code: 0 }));
    resizeBtn.addEventListener('click', toggleParams.bind(null, resizeParams));
    
    // Transform controls
    confirmTransform.addEventListener('click', confirmTransformation);
    cancelTransform.addEventListener('click', cancelTransformation);
    
    // History controls
    undoBtn.addEventListener('click', undoImage);
    redoBtn.addEventListener('click', redoImage);
    
    // Download button
    downloadBtn.addEventListener('click', downloadCurrentImage);
    
    // Parameters event listeners
    blurKernelSize.addEventListener('input', updateParamValue.bind(null, blurKernelSizeValue));
    edgeThreshold1.addEventListener('input', updateParamValue.bind(null, edgeThreshold1Value));
    edgeThreshold2.addEventListener('input', updateParamValue.bind(null, edgeThreshold2Value));
    contourThreshold.addEventListener('input', updateParamValue.bind(null, contourThresholdValue));
    resizeScale.addEventListener('input', function(e) {
        resizeScaleValue.textContent = e.target.value + 'x';
    });
    
    // Drawing canvas event listeners
    showDrawingCanvasBtn.addEventListener('click', toggleDrawingCanvas);
    closeDrawingCanvasBtn.addEventListener('click', toggleDrawingCanvas);
    
    pencilTool.addEventListener('click', () => setActiveTool('pencil'));
    lineTool.addEventListener('click', () => setActiveTool('line'));
    rectangleTool.addEventListener('click', () => setActiveTool('rectangle'));
    circleTool.addEventListener('click', () => setActiveTool('circle'));
    eraserTool.addEventListener('click', () => setActiveTool('eraser'));
    
    drawingColor.addEventListener('input', (e) => {
        currentDrawingColor = e.target.value;
    });
    
    drawingSize.addEventListener('input', (e) => {
        currentDrawingSize = parseInt(e.target.value);
        drawingSizeValue.textContent = `${currentDrawingSize}px`;
    });
    
    clearCanvas.addEventListener('click', () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    });
    
    fillCanvas.addEventListener('click', () => {
        ctx.fillStyle = currentDrawingColor;
        ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    });
    
    saveDrawing.addEventListener('click', saveCanvasDrawing);
    
    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', stopDrawing);
    
    // Functions for Image Processing
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                displayImage(img);
                uploadImage(file);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function displayImage(img) {
        imagePreview.innerHTML = '';
        imagePreview.appendChild(img);
        img.style.maxWidth = '100%';
        img.style.maxHeight = '500px';
        currentImage = img;
        
        // Show image processing options and info
        imageProcessingOptions.classList.remove('hidden');
        imageInfo.classList.remove('hidden');
        
        // Update image dimensions
        updateImageDimensions();
        
        // Add to history if not already there
        if (!currentImage.dataset.inHistory) {
            addToHistory(currentImage);
            currentImage.dataset.inHistory = "true";
        }
    }
    
    function updateImageDimensions() {
        if (currentImage) {
            imageDimensions.textContent = `${currentImage.naturalWidth} × ${currentImage.naturalHeight}`;
        }
    }
    
    function downloadCurrentImage() {
        if (!currentImage || !currentImage.src) return;
        
        // Create an anchor element
        const a = document.createElement('a');
        a.href = currentImage.src;
        a.download = currentImage.dataset.filename || 'image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    function uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentImage.dataset.filename = data.filename;
                currentImage.dataset.filepath = data.filepath;
                
                // Add to history
                addToHistory(currentImage);
            } else {
                alert('Error uploading image: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while uploading the image');
        });
    }
    
    function previewTransform(operation, paramOverrides = {}) {
        if (!currentImage || !currentImage.dataset.filename) {
            alert('Please upload an image first');
            return;
        }
        
        // Save the current image for cancellation
        previousImage = currentImage;
        
        // Get parameters based on operation
        let params = {};
        
        if (operation === 'blur') {
            params.kernel_size = parseInt(blurKernelSize.value);
        } else if (operation === 'edge') {
            params.threshold1 = parseInt(edgeThreshold1.value);
            params.threshold2 = parseInt(edgeThreshold2.value);
        } else if (operation === 'contour') {
            params.threshold = parseInt(contourThreshold.value);
        } else if (operation === 'resize') {
            params.scale = parseFloat(resizeScale.value);
        }
        
        // Override with any provided params
        params = { ...params, ...paramOverrides };
        
        // Save operation and params for confirmation
        lastOperation = operation;
        lastParams = params;
        
        // Set preview mode
        isPreviewingTransform = true;
        transformControls.classList.remove('hidden');
        
        // Process the image
        processImage(operation, params, true);
    }
    
    function confirmTransformation() {
        if (!isPreviewingTransform) return;
        
        // Get the current preview image
        const previewImgElement = previewImage.querySelector('img');
        if (previewImgElement) {
            // Apply the preview image to the main view
            currentImage = new Image();
            currentImage.src = previewImgElement.src;
            currentImage.onload = function() {
                currentImage.dataset.filename = previewImgElement.dataset.filename;
                currentImage.dataset.filepath = previewImgElement.dataset.filepath;
                
                // Clear the preview first
                transformPreview.classList.add('hidden');
                
                // Then update the main display with the new image
                imagePreview.innerHTML = '';
                imagePreview.appendChild(currentImage);
                currentImage.style.maxWidth = '100%';
                currentImage.style.maxHeight = '500px';
                
                // Add to history
                addToHistory(currentImage);
                
                // Update dimensions
                updateImageDimensions();
                
                // Reset preview state
                isPreviewingTransform = false;
                transformControls.classList.add('hidden');
            };
        } else {
            // Reset preview state if no preview image found
            isPreviewingTransform = false;
            transformControls.classList.add('hidden');
            transformPreview.classList.add('hidden');
        }
    }
    
    function cancelTransformation() {
        if (!isPreviewingTransform || !previousImage) return;
        
        // Restore previous image
        displayImage(previousImage);
        
        // Reset preview state
        isPreviewingTransform = false;
        transformControls.classList.add('hidden');
        transformPreview.classList.add('hidden');
    }
    
    function processImage(operation, paramOverrides = {}, isPreview = false) {
        if (!currentImage || !currentImage.dataset.filename) {
            alert('Please upload an image first');
            return;
        }
        
        // Get parameters based on operation
        let params = {};
        
        if (operation === 'blur') {
            params.kernel_size = parseInt(blurKernelSize.value);
        } else if (operation === 'edge') {
            params.threshold1 = parseInt(edgeThreshold1.value);
            params.threshold2 = parseInt(edgeThreshold2.value);
        } else if (operation === 'contour') {
            params.threshold = parseInt(contourThreshold.value);
        } else if (operation === 'resize') {
            params.scale = parseFloat(resizeScale.value);
        }
        
        // Override with any provided params
        params = { ...params, ...paramOverrides };
        
        fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: currentImage.dataset.filename,
                operation: operation,
                params: params
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display the processed image
                const img = new Image();
                // Add cache-busting query parameter
                img.src = data.result_filepath + '?t=' + new Date().getTime();
                img.onload = function() {
                    if (isPreview) {
                        // Show in preview layer
                        previewImage.innerHTML = '';
                        previewImage.appendChild(img);
                        transformPreview.classList.remove('hidden');
                        img.style.maxWidth = '100%';
                        img.style.maxHeight = '400px';
                    } else {
                        displayImage(img);
                    }
                    img.dataset.filename = data.result_filename;
                    img.dataset.filepath = data.result_filepath;
                };
            } else {
                alert('Error processing image: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while processing the image');
        });
    }
    
    function toggleParams(paramsEl) {
        // Hide all parameter divs first
        document.querySelectorAll('[id$="Params"]').forEach(el => {
            if (el !== paramsEl) el.classList.add('hidden');
        });
        
        // Toggle the clicked one
        paramsEl.classList.toggle('hidden');
        
        // If it's now visible, process the image when parameters change
        if (!paramsEl.classList.contains('hidden')) {
            const operation = paramsEl.id.replace('Params', '');
            
            // Add event listeners for real-time processing
            const inputs = paramsEl.querySelectorAll('input');
            inputs.forEach(input => {
                const originalListener = input._paramChangeListener;
                if (originalListener) {
                    input.removeEventListener('change', originalListener);
                }
                
                const newListener = () => previewTransform(operation);
                input._paramChangeListener = newListener;
                input.addEventListener('change', newListener);
            });
        }
    }
    
    function updateParamValue(valueEl, e) {
        valueEl.textContent = e.target.value;
    }
    
    let isCropping = false;
    let cropStart = { x: 0, y: 0 };
    let cropEnd = { x: 0, y: 0 };
    let cropSelection = document.createElement('div');
    
    function enableCropping() {
        if (!currentImage) {
            alert('Please upload an image first');
            return;
        }
        
        if (isCropping) {
            // Disable cropping
            isCropping = false;
            imagePreview.style.cursor = 'default';
            if (cropSelection.parentNode) {
                cropSelection.parentNode.removeChild(cropSelection);
            }
            return;
        }
        
        // Enable cropping
        isCropping = true;
        imagePreview.style.cursor = 'crosshair';
        
        // Save current image for cancellation
        previousImage = currentImage;
        isPreviewingTransform = true;
        transformControls.classList.remove('hidden');
        
        // Add crop selection div with improved visibility
        cropSelection.style.position = 'absolute';
        cropSelection.style.border = '2px dashed #ff0000';
        cropSelection.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        cropSelection.style.pointerEvents = 'none';
        cropSelection.style.zIndex = '5'; // Ensure it's visible above other elements
        
        // Make sure image container is set to relative for proper positioning
        imageContainer.style.position = 'relative';
        
        // Add event listeners for cropping
        currentImage.addEventListener('mousedown', startCrop);
        document.addEventListener('mousemove', updateCrop);
        document.addEventListener('mouseup', finishCrop);
    }
    
    function startCrop(e) {
        if (!isCropping) return;
        
        const rect = currentImage.getBoundingClientRect();
        cropStart.x = e.clientX - rect.left;
        cropStart.y = e.clientY - rect.top;
        
        // Position the selection relative to the image container
        const imageContainerRect = imageContainer.getBoundingClientRect();
        const imageRect = currentImage.getBoundingClientRect();
        
        // Calculate the image's position within the container
        const offsetX = imageRect.left - imageContainerRect.left;
        const offsetY = imageRect.top - imageContainerRect.top;
        
        // Add the selection div with proper positioning
        cropSelection.style.left = (offsetX + cropStart.x) + 'px';
        cropSelection.style.top = (offsetY + cropStart.y) + 'px';
        cropSelection.style.width = '0';
        cropSelection.style.height = '0';
        
        imageContainer.appendChild(cropSelection);
        e.preventDefault(); // Prevent text selection during cropping
    }
    
    function updateCrop(e) {
        if (!isCropping || !cropSelection.parentNode) return;
        
        const rect = currentImage.getBoundingClientRect();
        cropEnd.x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
        cropEnd.y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);
        
        const width = Math.abs(cropEnd.x - cropStart.x);
        const height = Math.abs(cropEnd.y - cropStart.y);
        
        // Calculate the image's position within the container
        const imageContainerRect = imageContainer.getBoundingClientRect();
        const imageRect = currentImage.getBoundingClientRect();
        const offsetX = imageRect.left - imageContainerRect.left;
        const offsetY = imageRect.top - imageContainerRect.top;
        
        cropSelection.style.left = (offsetX + Math.min(cropStart.x, cropEnd.x)) + 'px';
        cropSelection.style.top = (offsetY + Math.min(cropStart.y, cropEnd.y)) + 'px';
        cropSelection.style.width = width + 'px';
        cropSelection.style.height = height + 'px';
    }
    
    function finishCrop(e) {
        if (!isCropping || !cropSelection.parentNode) return;
        
        // Remove event listeners
        currentImage.removeEventListener('mousedown', startCrop);
        document.removeEventListener('mousemove', updateCrop);
        document.removeEventListener('mouseup', finishCrop);
        
        // Get crop coordinates
        const rect = currentImage.getBoundingClientRect();
        const imgWidth = currentImage.naturalWidth;
        const imgHeight = currentImage.naturalHeight;
        
        // Calculate scale factors
        const scaleX = imgWidth / rect.width;
        const scaleY = imgHeight / rect.height;
        
        // Convert crop coordinates to image coordinates
        const left = Math.min(cropStart.x, cropEnd.x) * scaleX;
        const top = Math.min(cropStart.y, cropEnd.y) * scaleY;
        const width = Math.abs(cropEnd.x - cropStart.x) * scaleX;
        const height = Math.abs(cropEnd.y - cropStart.y) * scaleY;
        
        // Clean up
        if (cropSelection.parentNode) {
            cropSelection.parentNode.removeChild(cropSelection);
        }
        isCropping = false;
        imagePreview.style.cursor = 'default';
        
        // Process the crop only if a valid selection was made
        if (width > 5 && height > 5) { // Minimum size check to avoid accidental tiny crops
            lastOperation = 'crop';
            lastParams = {
                x: Math.round(left),
                y: Math.round(top),
                width: Math.round(width),
                height: Math.round(height)
            };
            
            processImage('crop', lastParams, true);
        } else {
            // Cancel if no proper area selected
            cancelTransformation();
        }
    }
    
    // Image History Functions
    function addToHistory(image) {
        if (!image || !image.src) return;
        
        // Create a copy of the image data
        const historyItem = {
            src: image.src,
            filename: image.dataset.filename,
            filepath: image.dataset.filepath
        };
        
        // If we're not at the end of the history, truncate
        if (currentHistoryIndex < imageHistoryArray.length - 1) {
            imageHistoryArray = imageHistoryArray.slice(0, currentHistoryIndex + 1);
        }
        
        // Check if this item is different from the last one
        const lastItem = imageHistoryArray.length > 0 ? imageHistoryArray[imageHistoryArray.length - 1] : null;
        if (lastItem && lastItem.src === historyItem.src) {
            // Skip adding duplicate history items
            return;
        }
        
        // Add to history
        imageHistoryArray.push(historyItem);
        
        // Limit history size
        if (imageHistoryArray.length > maxHistorySize) {
            imageHistoryArray.shift();
        }
        
        // Update current index
        currentHistoryIndex = imageHistoryArray.length - 1;
        
        // Update UI
        updateHistoryUI();
    }
    
    function updateHistoryUI() {
        const historyContainer = imageHistoryContainer;
        historyContainer.innerHTML = '';
        
        if (imageHistoryArray.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-xs italic">No history yet</p>';
            return;
        }
        
        // Create a container div for all thumbnails to enable horizontal scrolling
        const thumbnailsContainer = document.createElement('div');
        thumbnailsContainer.classList.add('flex', 'flex-nowrap', 'overflow-x-auto', 'w-full', 'gap-2', 'py-1');
        
        imageHistoryArray.forEach((item, index) => {
            // Create wrapper div for each thumbnail
            const thumbnailWrapper = document.createElement('div');
            thumbnailWrapper.classList.add('flex-shrink-0');
            
            // Create the thumbnail image
            const thumbnail = document.createElement('img');
            thumbnail.src = item.src;
            thumbnail.classList.add('history-thumbnail');
            thumbnail.title = item.filename || `Image ${index + 1}`;
            
            if (index === currentHistoryIndex) {
                thumbnail.classList.add('active');
            }
            
            // Add click event to load the image
            thumbnailWrapper.addEventListener('click', () => {
                loadHistoryItem(index);
            });
            
            thumbnailWrapper.appendChild(thumbnail);
            thumbnailsContainer.appendChild(thumbnailWrapper);
        });
        
        historyContainer.appendChild(thumbnailsContainer);
        
        // Update undo/redo buttons
        undoBtn.disabled = currentHistoryIndex <= 0;
        redoBtn.disabled = currentHistoryIndex >= imageHistoryArray.length - 1;
    }
    
    function loadHistoryItem(index) {
        if (index < 0 || index >= imageHistoryArray.length) return;
        
        // Cancel any ongoing transformation
        if (isPreviewingTransform) {
            cancelTransformation();
        }
        
        const historyItem = imageHistoryArray[index];
        const img = new Image();
        
        // Preload the image
        img.onload = function() {
            // Copy all data attributes
            img.dataset.filename = historyItem.filename;
            img.dataset.filepath = historyItem.filepath;
            img.dataset.inHistory = "true"; // Mark as already in history
            
            // Update the display
            imagePreview.innerHTML = '';
            imagePreview.appendChild(img);
            img.style.maxWidth = '100%';
            img.style.maxHeight = '500px';
            
            // Update global state
            currentImage = img;
            
            // Update current index
            currentHistoryIndex = index;
            
            // Update the UI
            updateHistoryUI();
            updateImageDimensions();
        };
        
        // Set the image source to trigger loading
        img.src = historyItem.src;
    }
    
    function undoImage() {
        if (currentHistoryIndex > 0) {
            loadHistoryItem(currentHistoryIndex - 1);
        }
    }
    
    function redoImage() {
        if (currentHistoryIndex < imageHistoryArray.length - 1) {
            loadHistoryItem(currentHistoryIndex + 1);
        }
    }
    
    // Functions for Drawing Canvas
    function toggleDrawingCanvas() {
        drawingCanvasContainer.classList.toggle('hidden');
        imageDisplayContainer.classList.toggle('hidden');
    }
    
    function setActiveTool(tool) {
        currentTool = tool;
        
        // Remove active class from all tools
        document.querySelectorAll('#pencilTool, #lineTool, #rectangleTool, #circleTool, #eraserTool').forEach(el => {
            el.classList.remove('active');
            el.classList.remove('bg-blue-700');
            el.classList.add('bg-blue-500');
        });
        
        // Add active class to selected tool
        const selectedTool = document.getElementById(`${tool}Tool`);
        selectedTool.classList.add('active');
        selectedTool.classList.remove('bg-blue-500');
        selectedTool.classList.add('bg-blue-700');
    }
    
    // Canvas state for shape drawing
    let canvasState = null;
    
    function startDrawing(e) {
        isDrawing = true;
        const rect = drawingCanvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        
        // Save canvas state for shapes
        if (currentTool !== 'pencil' && currentTool !== 'eraser') {
            canvasState = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
        
        if (currentTool === 'pencil' || currentTool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
        }
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineWidth = currentDrawingSize;
        ctx.lineCap = 'round';
        
        if (currentTool === 'eraser') {
            ctx.strokeStyle = 'black';  // Eraser uses black color (canvas background)
        } else {
            ctx.strokeStyle = currentDrawingColor;
        }
        
        if (currentTool === 'pencil' || currentTool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (canvasState) {
            // Restore canvas state before drawing shape preview
            ctx.putImageData(canvasState, 0, 0);
            
            // Draw shape preview
            ctx.beginPath();
            
            if (currentTool === 'line') {
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
            } else if (currentTool === 'rectangle') {
                const width = x - startX;
                const height = y - startY;
                ctx.rect(startX, startY, width, height);
            } else if (currentTool === 'circle') {
                const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            }
            
            ctx.stroke();
        }
    }
    
    function stopDrawing(e) {
        if (!isDrawing) return;
        
        const rect = drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (currentTool !== 'pencil' && currentTool !== 'eraser') {
            ctx.beginPath();
            
            if (currentTool === 'line') {
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
            } else if (currentTool === 'rectangle') {
                const width = x - startX;
                const height = y - startY;
                ctx.rect(startX, startY, width, height);
            } else if (currentTool === 'circle') {
                const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            }
            
            ctx.stroke();
        }
        
        isDrawing = false;
        canvasState = null;
    }
    
    function saveCanvasDrawing() {
        const imageData = drawingCanvas.toDataURL('image/png');
        
        fetch('/save_canvas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageData: imageData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Drawing saved successfully!');
                
                // Option to load the saved drawing as the current image
                if (confirm('Do you want to load this drawing as the current image for further processing?')) {
                    toggleDrawingCanvas();
                    
                    const img = new Image();
                    img.src = data.filepath + '?t=' + new Date().getTime();
                    img.onload = function() {
                        displayImage(img);
                        img.dataset.filename = data.filename;
                        img.dataset.filepath = data.filepath;
                    };
                }
            } else {
                alert('Error saving drawing: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while saving the drawing');
        });
    }
}); 