let vueApp = new Vue({
  el: "#app",
  data: {
    //ROS
    connected: false,
    ros: null,
    logs: [],
    loading: false,
    rosbridge_address: "ws://0.0.0.0:3033/",
    rosbridge_camera_address: "0.0.0.0:8080",
    port: "3030",

    // Camera
    rgbCamera: true,

    // Joystick
    dragging: false,
    x: "no",
    y: "no",
    dragCircleStyle: {
      margin: "0px",
      top: "0px",
      left: "0px",
      display: "none",
      width: "75px",
      height: "75px",
    },
    joystick: {
      vertical: 0,
      horizontal: 0,
    },

    // Modals
    show3D: false,
    showCamera: false,
  },
  methods: {
    connect: function () {
      this.loading = true;
      this.ros = new ROSLIB.Ros({
        url: this.rosbridge_address,
      });
      // define callbacks
      this.ros.on("connection", () => {
        this.logs.unshift(new Date().toTimeString() + " - Connected!");
        this.connected = true;
        this.loading = false;
        this.setCamera();
      });
      this.ros.on("error", (error) => {
        this.logs.unshift(new Date().toTimeString() + ` - Error: ${error}`);
      });
      this.ros.on("close", () => {
        this.logs.unshift(new Date().toTimeString() + " - Disconnected!");
        this.connected = false;
        this.loading = false;
        this.disableCamera();
      });
    },
    disconnect: function () {
      this.ros.close();
    },

    // Joystick
    sendJoystickCommand: function () {
      let topic = new ROSLIB.Topic({
        ros: this.ros,
        name: "/cmd_vel",
        messageType: "geometry_msgs/Twist",
      });
      let message = new ROSLIB.Message({
        linear: { x: this.joystick.vertical, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: -this.joystick.horizontal },
      });
      topic.publish(message);
    },
    startDrag() {
      this.dragging = true;
      this.x = this.y = 0;
    },
    stopDrag() {
      this.dragging = false;
      this.x = this.y = "no";
      this.dragCircleStyle.display = "none";
      this.setJoystickVals(true);
      if (this.ros) this.sendJoystickCommand();
    },
    doDrag(event) {
      if (this.dragging) {
        this.x = event.offsetX;
        this.y = event.offsetY;
        let ref = document.getElementById("dragstartzone");
        this.dragCircleStyle.display = "inline-block";

        let minTop = ref.offsetTop - parseInt(this.dragCircleStyle.height) / 2;
        let maxTop = minTop + 200;
        let top = this.y + minTop;
        this.dragCircleStyle.top = `${top}px`;

        let minLeft = ref.offsetLeft - parseInt(this.dragCircleStyle.width) / 2;
        let maxLeft = minLeft + 200;
        let left = this.x + minLeft;
        this.dragCircleStyle.left = `${left}px`;

        this.setJoystickVals();
        this.sendJoystickCommand();
      }
    },
    setJoystickVals(reset = false) {
      if (reset) {
        this.joystick.vertical = 0;
        this.joystick.horizontal = 0;
      } else {
        this.joystick.vertical = -1 * (this.y / 200 - 0.5);
        this.joystick.horizontal = +1 * (this.x / 200 - 0.5);
      }
    },

    // Camera
    setCamera: function () {
      new MJPEGCANVAS.Viewer({
        divID: "divCameraModal",
        host: this.rosbridge_camera_address,
        width: 640,
        height: 480,
        topic: "/camera/image_raw",
        ssl: false,
      });
      new MJPEGCANVAS.Viewer({
        divID: "divCamera",
        host: this.rosbridge_camera_address,
        width: 320,
        height: 240,
        topic: "/camera/image_raw",
        ssl: false,
      });
    },
    switchCamera: function () {
      this.rgbCamera = !this.rgbCamera;
      this.disableCamera();
      this.setCamera();
    },
    disableCamera: function () {
      document.getElementById("divCamera").innerHTML = "";
      document.getElementById("divCameraModal").innerHTML = "";
    },

    // Modals
    openModalCamera: function () {
      this.showCamera = true;
    },
    closeModalCamera: function () {
      this.showCamera = false;
    },
  },
  mounted() {
    window.addEventListener("mouseup", this.stopDrag);
    this.interval = setInterval(() => {
      if (this.ros != null && this.ros.isConnected) {
        this.ros.getNodes(
          (data) => {},
          (error) => {}
        );
      }
    }, 10000);
  },
});
