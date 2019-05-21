CIT Resource Scheduling Tool


This repo contains both the backend AND frontend (bad repo naming on our part) for this project.

Frontend files:

/resources/js

each page has its own folder in /resources/js/components (which mostly now only has a single React.js component, but the folder structure is there for scalability if more components are added in the future)

Backend files:

routes are defined in /routes- web.php represents regular routes, api.php represents api routes.

Bulk of backend logic (interfacing with the database layer) is in /routes/api.php. Bulk of the logic follows a RESTful API. Routes with payloads (PUT/POST requests) have sample payload documentation (alongside general documentation for each route).

Automated testing files are in /tests.

