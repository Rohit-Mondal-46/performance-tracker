from ultralytics import YOLO

model = YOLO("phone_detection/train6/weights/best.pt")

model.export(format="onnx")
