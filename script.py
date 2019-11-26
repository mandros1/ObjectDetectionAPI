import sys
import requests
import json
import base64
import cv2
import numpy as np
from PIL import Image
from io import BytesIO

image_path = sys.argv[1]
b64_image = None
with open(image_path, "rb") as imageFile:
    b64_image = base64.b64encode(imageFile.read())
image_open = Image.open(BytesIO(base64.b64decode(b64_image))).convert('RGB')
img = np.asarray(image_open)
img = img[:, :, ::-1]
img = cv2.resize(img, None, fx=0.5, fy=0.5)
image_pred = img.copy()
payload = {
    "instances": [{'images': img.tolist()}]
}
# What is printed is what gets stuck in the buffer and returned to node using flush()

# Making POST request
r = requests.post('http://158.177.66.70:9001/v1/models/ImageDetection:predict', json=payload)

# Decoding results from TensorFlow Serving server
pred_retina = json.loads(r.content.decode('utf-8'))

boxes, scores, labels = pred_retina.get('predictions')[0].get('output1'), pred_retina.get('predictions')[0].get('output2'), pred_retina.get('predictions')[0].get('output3')

predicted_images = []
predicted_boxes = []
predicted_scores = []
pred = []
IMG_WIDTH = 66
IMG_HEIGHT = 224
RETINA_THRESHOLD = 0.15
NMS_THRESHOLD = 0.15

for box, score_retina, labels in zip(boxes, scores, labels):

    if score_retina < RETINA_THRESHOLD:
        break

    #color = label_color(label)

    b = [int(x) for x in box]
    crop_pic = image_pred[b[1]:b[3], b[0]:b[2]]
    copy_resized = cv2.resize(crop_pic, (IMG_WIDTH, IMG_HEIGHT), interpolation = cv2.INTER_CUBIC)
    #copy_resized = np.ndarray(shape=(1, copy_resized.shape[0], copy_resized.shape[1], copy_resized.shape[2]))

    predicted_images.append(copy_resized)
    predicted_boxes.append(b)
    predicted_scores.append(score_retina)

pred_array = np.asanyarray(predicted_images, dtype=np.int32)
class_predictions = []

for image in pred_array:
    payload = {
        "instances": [{'input_image': image.tolist()}]
    }
    #pred = run_classification_prediction(class_model, 32, pred_array)
    r = requests.post('http://158.177.66.70:9001/v1/models/ImageClassification:predict', json=payload)

    pred_classification = json.loads(r.content.decode('utf-8'))
    class_predictions.append(int(np.argmax(pred_classification.get('predictions')[0], axis=0)))

zip_predictions = list(zip(predicted_boxes, predicted_scores, class_predictions))

predictions_list = []
for box, score, pred_class in zip(predicted_boxes, predicted_scores, class_predictions):
    predictions_list.append({
    'box': box,
    'score': score,
    'class' : pred_class
    })

dump = json.dumps(predictions_list)

print(dump)
