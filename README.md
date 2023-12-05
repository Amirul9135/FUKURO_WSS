![FUKURO](http://139.59.233.99:5002/res/images/fukuro%20name.png)

Documentation & User Manual: http://amirulasraf.com/fukuro

FUKURO stands for FUndamental Kernel Utilization Realtime Overseer which is a Monitoring system consisting of Agent application and Mobile application designed to assist users in monitoring and managing remote computer/hosts or servers. 

FUKURO allows monitoring the fundamental metrics which have significant impact on a remote host performance which is the CPU, Memory, Disk and Network usage. Futhermore, FUKURO also provide customizable Metrics report based on the readings extracted by the agent application along with alert notificationa feature to notify user on when usage reaches configured threshold.

This repository consist of the source code of  the Web Services Server Application part of the FUKURO system.
The server application is the center of FUKURO which facilitate communication between user mobile application and agent application via HTTP and also WebSocket.
Technology used/integrated:
- NodeJS
- ExpressJS
- OneSignal
- MySQL
- WebSocket
- JSON Web Token (JWT)
- REST API endpoints 
