from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

bus_location = {"lat": None, "lng": None}

@app.route('/')
def home():
    return render_template('home.html')  

@app.route('/driver')
def driver():
    return render_template('driver.html')  

@app.route('/user')
def user():
    return render_template('user.html')  

@socketio.on('update_location')
def handle_update_location(data):
    global bus_location
    bus_location = data
    socketio.emit('bus_location', bus_location, include_self=False)

@socketio.on('get_location')
def send_current_location():
    socketio.emit('bus_location', bus_location)

@socketio.on('stop_location')
def stop_location():
    global bus_location
    bus_location = {"lat": None, "lng": None}  # Clear location when driver stops
    socketio.emit('stop_location')

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0')
