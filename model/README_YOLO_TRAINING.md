# YOLOv8 Phone Detection Training Guide

This guide will help you train a YOLOv8 model for phone detection using your dataset.

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- (Optional) NVIDIA GPU with CUDA support for faster training
- (Optional) Apple Silicon Mac (M1/M2) for MPS acceleration

## 🚀 Quick Start

### 1. Install Dependencies

First, install all required Python packages:

```bash
pip install -r requirements_yolo.txt
```

Or install the main package directly:

```bash
pip install ultralytics
```

### 2. Verify Installation

Check if everything is installed correctly:

```bash
python -c "from ultralytics import YOLO; print('✓ YOLOv8 installed successfully')"
```

### 3. Train the Model

Run the training script:

```bash
python train_yolov8.py
```

The script will:
- ✅ Check your dataset structure
- ✅ Update data.yaml with absolute paths
- ✅ Download pretrained YOLOv8 weights
- ✅ Train the model for 100 epochs (default)
- ✅ Validate the model
- ✅ Test on the test set
- ✅ Save the best model weights

### 4. Monitor Training

Training progress will be displayed in the terminal. You can also view:
- Training curves: `phone_detection/train/results.png`
- Confusion matrix: `phone_detection/train/confusion_matrix.png`
- Validation predictions: `phone_detection/train/val_batch*_pred.jpg`

## 📊 Training Configuration

You can modify training parameters in `train_yolov8.py`:

```python
TRAINING_CONFIG = {
    'model_size': 'n',  # Options: 'n', 's', 'm', 'l', 'x'
    'epochs': 100,      # Number of training epochs
    'img_size': 640,    # Image size
    'batch_size': 16,   # Batch size (adjust based on GPU memory)
    'device': '',       # '' for auto, '0' for GPU, 'cpu', 'mps'
}
```

### Model Sizes

| Model | Size | Speed | mAP | Use Case |
|-------|------|-------|-----|----------|
| YOLOv8n | 3.2M params | ⚡⚡⚡⚡⚡ Fastest | ⭐⭐⭐ | Mobile/Edge devices |
| YOLOv8s | 11.2M params | ⚡⚡⚡⚡ Fast | ⭐⭐⭐⭐ | General purpose |
| YOLOv8m | 25.9M params | ⚡⚡⚡ Medium | ⭐⭐⭐⭐⭐ | Balanced |
| YOLOv8l | 43.7M params | ⚡⚡ Slow | ⭐⭐⭐⭐⭐⭐ | High accuracy |
| YOLOv8x | 68.2M params | ⚡ Slowest | ⭐⭐⭐⭐⭐⭐⭐ | Maximum accuracy |

### Batch Size Guidelines

Adjust `batch_size` based on your GPU memory:
- 4GB GPU: batch_size = 8
- 8GB GPU: batch_size = 16
- 12GB+ GPU: batch_size = 32

If you get an out-of-memory error, reduce the batch size.

## 🧪 Testing Your Model

### Test on an Image

```bash
python inference_yolov8.py --source path/to/image.jpg
```

### Test on a Video

```bash
python inference_yolov8.py --source path/to/video.mp4
```

### Test on a Folder of Images

```bash
python inference_yolov8.py --source path/to/folder/
```

### Real-time Webcam Detection

```bash
python inference_yolov8.py --source webcam
```

### Custom Confidence Threshold

```bash
python inference_yolov8.py --source image.jpg --conf 0.5
```

## 📁 Output Files

After training, you'll find:

```
phone_detection/
├── train/
│   ├── weights/
│   │   ├── best.pt          # Best model (use this for inference)
│   │   └── last.pt          # Last epoch checkpoint
│   ├── results.png          # Training curves
│   ├── confusion_matrix.png # Confusion matrix
│   ├── F1_curve.png        # F1 score curve
│   ├── PR_curve.png        # Precision-Recall curve
│   ├── P_curve.png         # Precision curve
│   ├── R_curve.png         # Recall curve
│   └── val_batch*_pred.jpg # Validation predictions
└── test_predictions/        # Test set predictions
```

## 🔧 Advanced Usage

### Resume Training from Checkpoint

```python
from ultralytics import YOLO

# Load the last checkpoint
model = YOLO('phone_detection/train/weights/last.pt')

# Resume training
model.train(resume=True)
```

### Export Model to Different Formats

```python
from ultralytics import YOLO

model = YOLO('phone_detection/train/weights/best.pt')

# Export to ONNX (for production)
model.export(format='onnx')

# Export to TensorFlow Lite (for mobile)
model.export(format='tflite')

# Export to CoreML (for iOS)
model.export(format='coreml')
```

### Use Trained Model in Python

```python
from ultralytics import YOLO
from PIL import Image

# Load model
model = YOLO('phone_detection/train/weights/best.pt')

# Predict on an image
results = model.predict('phone.jpg')

# Get bounding boxes
for result in results:
    boxes = result.boxes
    for box in boxes:
        # Get box coordinates
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        confidence = box.conf[0].item()
        class_id = int(box.cls[0].item())
        
        print(f"Phone detected at [{x1:.0f}, {y1:.0f}, {x2:.0f}, {y2:.0f}]")
        print(f"Confidence: {confidence:.2f}")
```

## 📈 Expected Results

With the phone detection dataset (503 images), you should expect:
- Training time: ~15-30 minutes (with GPU)
- mAP50: 85-95% (depending on model size)
- Inference speed: 
  - YOLOv8n: ~2-5ms per image (on GPU)
  - YOLOv8s: ~5-10ms per image (on GPU)

## 🐛 Troubleshooting

### Issue: CUDA out of memory
**Solution**: Reduce batch size in training config

### Issue: Model not converging
**Solution**: 
- Increase number of epochs
- Try a larger model (e.g., 's' instead of 'n')
- Check if dataset is properly annotated

### Issue: Slow training on CPU
**Solution**: 
- Use a smaller model (YOLOv8n)
- Reduce image size to 416
- Consider using Google Colab with free GPU

### Issue: ModuleNotFoundError
**Solution**: Install missing packages:
```bash
pip install -r requirements_yolo.txt
```

## 📚 Additional Resources

- [Ultralytics YOLOv8 Documentation](https://docs.ultralytics.com/)
- [YOLOv8 GitHub Repository](https://github.com/ultralytics/ultralytics)
- [YOLOv8 Training Tips](https://docs.ultralytics.com/modes/train/)

## 🎯 Next Steps

1. Train with different model sizes to compare accuracy vs. speed
2. Experiment with different augmentation parameters
3. Fine-tune hyperparameters for better performance
4. Export model for deployment in your application
5. Integrate with your desktop app for real-time phone detection

## 📞 Support

If you encounter any issues, please check:
1. Python version (>= 3.8)
2. PyTorch installation
3. Dataset structure and paths
4. GPU drivers (if using GPU)

Good luck with your training! 🚀
