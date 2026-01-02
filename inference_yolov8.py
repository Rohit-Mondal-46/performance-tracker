"""
YOLOv8 Phone Detection Inference Script
Use this script to test your trained model on new images or videos
"""

import os
from pathlib import Path
import cv2
from ultralytics import YOLO
import argparse

def predict_image(model_path, image_path, conf_threshold=0.25, save_results=True):
    """
    Predict phone detection on a single image
    
    Args:
        model_path: Path to trained model (.pt file)
        image_path: Path to input image
        conf_threshold: Confidence threshold for detections
        save_results: Whether to save annotated results
    """
    # Load model
    model = YOLO(model_path)
    
    # Predict
    results = model.predict(
        source=image_path,
        save=save_results,
        conf=conf_threshold,
        show_labels=True,
        show_conf=True,
        project='phone_detection',
        name='predictions'
    )
    
    # Print results
    for result in results:
        boxes = result.boxes
        print(f"\nImage: {image_path}")
        print(f"Detected {len(boxes)} phone(s)")
        
        for i, box in enumerate(boxes):
            conf = box.conf[0].item()
            cls = int(box.cls[0].item())
            xyxy = box.xyxy[0].tolist()
            print(f"  Phone {i+1}: confidence={conf:.2f}, bbox={[int(x) for x in xyxy]}")
    
    if save_results:
        print(f"\n✓ Results saved to: phone_detection/predictions/")
    
    return results

def predict_video(model_path, video_path, conf_threshold=0.25, save_results=True):
    """
    Predict phone detection on a video
    
    Args:
        model_path: Path to trained model (.pt file)
        video_path: Path to input video
        conf_threshold: Confidence threshold for detections
        save_results: Whether to save annotated results
    """
    # Load model
    model = YOLO(model_path)
    
    # Predict
    results = model.predict(
        source=video_path,
        save=save_results,
        conf=conf_threshold,
        show_labels=True,
        show_conf=True,
        project='phone_detection',
        name='video_predictions',
        stream=True  # Stream processing for videos
    )
    
    # Process results
    frame_count = 0
    phone_detections = 0
    
    for result in results:
        frame_count += 1
        boxes = result.boxes
        if len(boxes) > 0:
            phone_detections += len(boxes)
            print(f"Frame {frame_count}: {len(boxes)} phone(s) detected")
    
    print(f"\n✓ Processed {frame_count} frames")
    print(f"✓ Total phone detections: {phone_detections}")
    
    if save_results:
        print(f"✓ Results saved to: phone_detection/video_predictions/")
    
    return results

def predict_webcam(model_path, conf_threshold=0.25):
    """
    Real-time phone detection using webcam
    
    Args:
        model_path: Path to trained model (.pt file)
        conf_threshold: Confidence threshold for detections
    """
    # Load model
    model = YOLO(model_path)
    
    # Start webcam
    cap = cv2.VideoCapture(0)
    
    print("\nStarting webcam detection...")
    print("Press 'q' to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Predict
        results = model.predict(
            source=frame,
            conf=conf_threshold,
            verbose=False
        )
        
        # Draw results on frame
        annotated_frame = results[0].plot()
        
        # Display
        cv2.imshow('Phone Detection', annotated_frame)
        
        # Break on 'q' key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print("\n✓ Webcam detection stopped")

def predict_folder(model_path, folder_path, conf_threshold=0.25, save_results=True):
    """
    Predict phone detection on all images in a folder
    
    Args:
        model_path: Path to trained model (.pt file)
        folder_path: Path to folder containing images
        conf_threshold: Confidence threshold for detections
        save_results: Whether to save annotated results
    """
    # Load model
    model = YOLO(model_path)
    
    # Get all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp']
    folder_path = Path(folder_path)
    image_files = [f for f in folder_path.glob('*') if f.suffix.lower() in image_extensions]
    
    print(f"\nFound {len(image_files)} images in {folder_path}")
    
    # Predict
    results = model.predict(
        source=str(folder_path),
        save=save_results,
        conf=conf_threshold,
        show_labels=True,
        show_conf=True,
        project='phone_detection',
        name='folder_predictions'
    )
    
    # Summary
    total_detections = 0
    images_with_phones = 0
    
    for result in results:
        boxes = result.boxes
        if len(boxes) > 0:
            total_detections += len(boxes)
            images_with_phones += 1
    
    print(f"\n✓ Processed {len(image_files)} images")
    print(f"✓ Images with phones: {images_with_phones}")
    print(f"✓ Total phone detections: {total_detections}")
    
    if save_results:
        print(f"✓ Results saved to: phone_detection/folder_predictions/")
    
    return results

def main():
    parser = argparse.ArgumentParser(description='YOLOv8 Phone Detection Inference')
    parser.add_argument('--model', type=str, default='phone_detection/train6/weights/best.pt',
                       help='Path to trained model')
    parser.add_argument('--source', type=str, required=True,
                       help='Path to image, video, folder, or "webcam"')
    parser.add_argument('--conf', type=float, default=0.25,
                       help='Confidence threshold (default: 0.25)')
    parser.add_argument('--save', action='store_true', default=True,
                       help='Save results')
    
    args = parser.parse_args()
    
    # Check if model exists
    if not os.path.exists(args.model):
        print(f"Error: Model not found at {args.model}")
        print("Please train the model first using train_yolov8.py")
        return
    
    print("\n" + "="*60)
    print("YOLOv8 PHONE DETECTION INFERENCE")
    print("="*60)
    print(f"Model: {args.model}")
    print(f"Source: {args.source}")
    print(f"Confidence threshold: {args.conf}")
    print("="*60 + "\n")
    
    # Determine source type and run appropriate prediction
    if args.source.lower() == 'webcam':
        predict_webcam(args.model, args.conf)
    elif os.path.isfile(args.source):
        # Check if it's a video or image
        video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
        if Path(args.source).suffix.lower() in video_extensions:
            predict_video(args.model, args.source, args.conf, args.save)
        else:
            predict_image(args.model, args.source, args.conf, args.save)
    elif os.path.isdir(args.source):
        predict_folder(args.model, args.source, args.conf, args.save)
    else:
        print(f"Error: Source not found: {args.source}")
        return
    
    print("\n" + "="*60)
    print("INFERENCE COMPLETED! 🎉")
    print("="*60 + "\n")

if __name__ == "__main__":
    # If running without command line arguments, use this simple example:
    if len(os.sys.argv) == 1:
        print("\nUsage Examples:")
        print("  Image:   python inference_yolov8.py --source path/to/image.jpg")
        print("  Video:   python inference_yolov8.py --source path/to/video.mp4")
        print("  Folder:  python inference_yolov8.py --source path/to/folder/")
        print("  Webcam:  python inference_yolov8.py --source webcam")
        print("\nOptional arguments:")
        print("  --model  path/to/model.pt  (default: phone_detection/train/weights/best.pt)")
        print("  --conf   0.5               (confidence threshold, default: 0.25)")
    else:
        main()
