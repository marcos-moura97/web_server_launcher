# Web Server Launcher for ROS2

Simple web server Launch package for ROS2 topics using [rosbridge](https://github.com/RobotWebTools/rosbridge_suite/tree/ros2/rosbridge_server) library.

This package handles the connection between topics to send messages to a turtlebot3 robot and receives the RGB images from the robot, due the [MJPEGCANVAS](https://github.com/rctoris/mjpegcanvasjs) library.

## Requirements
- turtlebot3_gazebo
- [web_video_server](https://github.com/fictionlab/web_video_server-ros2/tree/humble)
- rosbridge_suite

## How to Run

To launch the web server, just launch:

```
ros2 launch web_server_launcher web.launch.xml
```

The rosbridge, the video server and the web interface will be available in the following addresses:

- rosbridge: ws://0.0.0.0:3033
- video_server: 0.0.0.0:8080
- web interface: 0.0.0.0:7000

