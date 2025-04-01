import flask
from flask import Flask, request, jsonify, render_template
import os
import pickle
from flask_cors import CORS

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Flag to track if we're using the mock predictor
using_mock = False

# Mock prediction function (to use when scikit-learn is not available)
def mock_predict(text):
    # Simple keyword-based sentiment analysis
    text = text.lower()
    positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'perfect', 'awesome', 'fantastic']
    negative_words = ['bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'disappointing', 'horrible', 'useless']
    
    positive_count = sum(1 for word in positive_words if word in text)
    negative_count = sum(1 for word in negative_words if word in text)
    
    if positive_count > negative_count:
        return 'positive'
    elif negative_count > positive_count:
        return 'negative'
    else:
        return 'neutral'

# Try to load scikit-learn and the models
try:
    import sklearn
    with open('vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
    
    with open('https://drive.google.com/file/d/1ox3MUMj---Osj8tBCKsWs-HzJMPAU3sa/view?usp=drive_link', 'rb') as f:
        model = pickle.load(f)
    
    # If models loaded successfully, use them for prediction
    def predict_sentiment(text):
        text_vectorized = vectorizer.transform([text])
        prediction = model.predict(text_vectorized)[0]
        sentiment_map = {
            0: 'negative',
            1: 'neutral',
            2: 'positive'
        }
        return sentiment_map.get(prediction, 'unknown')
    
    print("Using ML models for prediction")
    
except ImportError:
    # If scikit-learn is not installed
    print("scikit-learn is not installed. Using mock prediction function instead.")
    predict_sentiment = mock_predict
    using_mock = True
    
except Exception as e:
    # If models failed to load for other reasons
    print(f"Error loading models: {e}")
    print("Using mock prediction function instead")
    predict_sentiment = mock_predict
    using_mock = True

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Use the prediction function (either real or mock)
        sentiment = predict_sentiment(text)
        
        return jsonify({
            'sentiment': sentiment,
            'text': text,
            'using_mock': using_mock
        })
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

