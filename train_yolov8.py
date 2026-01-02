"""
YOLOv8 Phone Detection Model Training Script
This script trains a YOLOv8 model on the phone detection dataset
"""

import os
import sys
from pathlib import Path
import torch
from ultralytics import YOLO
import yaml

def check_dataset_structure(dataset_path):
    """Verify dataset structure and paths"""
    print("Checking dataset structure...")
    
    required_folders = ['train/images', 'train/labels', 
                       'valid/images', 'valid/labels',
                       'test/images', 'test/labels']
    
    for folder in required_folders:
        folder_path = dataset_path / folder
        if not folder_path.exists():
            print(f"Warning: {folder} not found!")
        else:
            file_count = len(list(folder_path.glob('*')))
            print(f"✓ {folder}: {file_count} files")
    
    # Check data.yaml
    yaml_path = dataset_path / 'data.yaml'
    if yaml_path.exists():
        with open(yaml_path, 'r') as f:
            data_config = yaml.safe_load(f)
            print(f"\n✓ Dataset configuration loaded:")
            print(f"  - Classes: {data_config.get('nc', 'N/A')}")
            print(f"  - Names: {data_config.get('names', 'N/A')}")
    else:
        print("✗ data.yaml not found!")
        return False
    
    return True

def update_data_yaml(dataset_path):
    """Update data.yaml with absolute paths"""
    yaml_path = dataset_path / 'data.yaml'
    
    with open(yaml_path, 'r') as f:
        data_config = yaml.safe_load(f)
    
    # Update paths to absolute paths
    data_config['train'] = str(dataset_path / 'train' / 'images')
    data_config['val'] = str(dataset_path / 'valid' / 'images')
    data_config['test'] = str(dataset_path / 'test' / 'images')
    
    # Save updated config
    with open(yaml_path, 'w') as f:
        yaml.dump(data_config, f, default_flow_style=False)
    
    print(f"\n✓ Updated data.yaml with absolute paths")
    return yaml_path

def train_model(data_yaml_path, 
                model_size='n',
                epochs=20, 
                img_size=640, 
                batch_size=16,
                project_name='phone_detection',
                device=''):
    """
    Train YOLOv8 model
    
    Args:
        data_yaml_path: Path to data.yaml file
        model_size: YOLOv8 model size ('n', 's', 'm', 'l', 'x')
                   n=nano, s=small, m=medium, l=large, x=xlarge
        epochs: Number of training epochs
        img_size: Image size for training
        batch_size: Batch size (adjust based on GPU memory)
        project_name: Project name for saving results
        device: Device to use ('', '0', '0,1', 'cpu', 'mps')
    """
    
    # Check CUDA availability
    print("\n" + "="*60)
    print("SYSTEM INFORMATION")
    print("="*60)
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA version: {torch.version.cuda}")
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    
    # Check MPS (Apple Silicon) availability
    if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        print(f"MPS (Apple Silicon) available: True")
        if not device:
            device = 'mps'
    
    if not device:
        device = '0' if torch.cuda.is_available() else 'cpu'
    
    print(f"Training device: {device}")
    print("="*60 + "\n")
    
    # Load pretrained YOLOv8 model
    model_name = f'yolov8{model_size}.pt'
    print(f"Loading YOLOv8 model: {model_name}")
    model = YOLO(model_name)
    
    # Train the model
    print(f"\nStarting training with the following parameters:")
    print(f"  - Model: YOLOv8{model_size}")
    print(f"  - Epochs: {epochs}")
    print(f"  - Image size: {img_size}")
    print(f"  - Batch size: {batch_size}")
    print(f"  - Device: {device}")
    print(f"  - Dataset: {data_yaml_path}")
    print("\n" + "="*60 + "\n")
    
    results = model.train(
        data=str(data_yaml_path),
        epochs=epochs,
        imgsz=img_size,
        batch=batch_size,
        device=device,
        project=project_name,
        name='train',
        save=True,
        save_period=10,  # Save checkpoint every 10 epochs
        verbose=True,
        patience=50,  # Early stopping patience
        # Optimization parameters
        optimizer='Adam',  # or 'SGD', 'AdamW'
        lr0=0.01,  # Initial learning rate
        lrf=0.01,  # Final learning rate (lr0 * lrf)
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1,
        # Augmentation parameters
        hsv_h=0.015,  # HSV-Hue augmentation
        hsv_s=0.7,  # HSV-Saturation augmentation
        hsv_v=0.4,  # HSV-Value augmentation
        degrees=0.0,  # Rotation augmentation
        translate=0.1,  # Translation augmentation
        scale=0.5,  # Scale augmentation
        shear=0.0,  # Shear augmentation
        perspective=0.0,  # Perspective augmentation
        flipud=0.0,  # Flip up-down augmentation
        fliplr=0.5,  # Flip left-right augmentation
        mosaic=1.0,  # Mosaic augmentation
        mixup=0.0,  # MixUp augmentation
    )
    
    print("\n" + "="*60)
    print("TRAINING COMPLETED!")
    print("="*60)
    
    return model, results

def validate_model(model, data_yaml_path):
    """Validate the trained model"""
    print("\n" + "="*60)
    print("VALIDATING MODEL")
    print("="*60)
    
    metrics = model.val(data=str(data_yaml_path))
    
    print(f"\nValidation Results:")
    print(f"  - mAP50: {metrics.box.map50:.4f}")
    print(f"  - mAP50-95: {metrics.box.map:.4f}")
    print(f"  - Precision: {metrics.box.mp:.4f}")
    print(f"  - Recall: {metrics.box.mr:.4f}")
    
    return metrics

def test_model(model, test_images_path):
    """Test the model on test images"""
    print("\n" + "="*60)
    print("TESTING MODEL ON TEST SET")
    print("="*60)
    
    results = model.predict(
        source=str(test_images_path),
        save=True,
        conf=0.25,  # Confidence threshold
        iou=0.45,   # IoU threshold for NMS
        show_labels=True,
        show_conf=True,
        project='phone_detection',
        name='test_predictions'
    )
    
    print(f"✓ Test predictions saved to: phone_detection/test_predictions/")
    
    return results

def export_model(model, format='onnx'):
    """Export the model to different formats"""
    print("\n" + "="*60)
    print(f"EXPORTING MODEL TO {format.upper()}")
    print("="*60)
    
    export_path = model.export(format=format)
    print(f"✓ Model exported to: {export_path}")
    
    return export_path

def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("YOLOv8 PHONE DETECTION MODEL TRAINING")
    print("="*60 + "\n")
    
    # Set dataset path
    current_dir = Path(__file__).parent
    dataset_path = current_dir / 'dataset'
    
    if not dataset_path.exists():
        print(f"Error: Dataset not found at {dataset_path}")
        sys.exit(1)
    
    # Check dataset structure
    if not check_dataset_structure(dataset_path):
        print("Error: Dataset structure is invalid!")
        sys.exit(1)
    
    # Update data.yaml with absolute paths
    data_yaml_path = update_data_yaml(dataset_path)
    
    # Training configuration
    TRAINING_CONFIG = {
        'model_size': 'n',  # Change to 's', 'm', 'l', or 'x' for larger models
        'epochs': 20,
        'img_size': 640,
        'batch_size': 16,  # Adjust based on your GPU memory
        'project_name': 'phone_detection',
        'device': '',  # Auto-detect ('' for auto, '0' for GPU, 'cpu', 'mps' for Apple Silicon)
    }
    
    print(f"\nTraining Configuration:")
    for key, value in TRAINING_CONFIG.items():
        print(f"  - {key}: {value}")
    
    # Train the model
    model, results = train_model(data_yaml_path, **TRAINING_CONFIG)
    
    # Validate the model
    validate_model(model, data_yaml_path)
    
    # Test on test set
    test_images_path = dataset_path / 'test' / 'images'
    if test_images_path.exists():
        test_model(model, test_images_path)
    
    # Export model (optional)
    print("\nWould you like to export the model? (uncomment the line below)")
    # export_model(model, format='onnx')  # Options: 'onnx', 'torchscript', 'tflite', 'coreml'
    
    print("\n" + "="*60)
    print("ALL DONE! 🎉")
    print("="*60)
    print(f"\nTrained model saved in: phone_detection/train/weights/")
    print(f"  - best.pt (best model)")
    print(f"  - last.pt (last epoch)")
    print(f"\nTo use the model:")
    print(f"  from ultralytics import YOLO")
    print(f"  model = YOLO('phone_detection/train/weights/best.pt')")
    print(f"  results = model.predict('path/to/image.jpg')")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
