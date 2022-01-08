# Spot Swap - ShellHacks 2018
This repo contains the back-end code for our ShellHacks 2018 (FIU) project. Click [here](https://devpost.com/software/spot-swap) for more details about the project.

<p align="center">
  <img src="https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/000/681/841/datas/gallery.jpg" width="33%" /> 
  <img src="https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/000/681/837/datas/gallery.jpg" width="33%" /> 
  <img src="https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/000/681/839/datas/gallery.jpg" width="33%" /> 
</p>

## Inspiration
The inspiration for this project was provoked by the continuous, hopeless parking spots in the college campus. Every year, great new students arrive, and yet, the number of parking spots seem to dwindle. Its an uphill battle against real estate! Hence, this application is for students by students to aid in their every college-day life, by minimizing the time wasted in the Battle of the Spots, circa 1pm daily.

## What it does
The app has two distinct options: request a parking spot or request a ride to your parking spot. For the first option, you enlist in a queue of students waiting for a parking spot, whereas the second option, it is for students leaving the campus that could use a ride to their vehicle in exchange for their parking spot. The application matches students based on distance-proximity: each leaving student is paired with an arriving student.

## How we built it
For the front end, we utilized React-Native for a quicker GUI setup and cross-platform capabilities, and used socket.io-client to interact with the server. As for the back end, we resorted to socket.io + node.js for the networking aspect of the application, where we built a server and client architecture. Furthermore, Heroku was the perfect choice for the server as it's simple to configure and is highly accessible.

## The future of Spot Swap
With a dedication to save time, finding parking spots would be something of the past. Thus, we plan to generalize the application for more universities, malls, and essentially every parking spot. Also, implement a more secure layer of security for our users.
