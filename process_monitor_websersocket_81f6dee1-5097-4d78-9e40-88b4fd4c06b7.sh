pid_websersocket=$(pgrep -f "websersocket_81f6dee1-5097-4d78-9e40-88b4fd4c06b7.js")
watch -n 1 ps -p $pid_websersocket -o pid,etime,%cpu,%mem,cmd