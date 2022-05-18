# 3D ISS Tracker
A demo of this project can be found on my [website](https://jacobkapitein.com).
Most ISS trackers are on a 2D map, but this project shows the ISS location on a 3D globe. This software is as-is. If there are problems, feel free to open an issue or pull request.

I made this project just to tinker a bit with Three.JS. An interesting bit of this project is mapping real life coordinates to a vector.

I know the code is messy, but it's easy to understand anyway and I want to move on to new projects.

## Development
- Run `npm install`
- Run `npm run dev`

## Building
- Run `npm install`
- Run `npm run build`
- Host on a server (like `python -m http.server`)

## Buidling and serving with Docker
- Run `docker build -t iss-tracker .`
- Run `docker run -d -p {external_port}:80 --name iss-tracker-live iss-tracker`