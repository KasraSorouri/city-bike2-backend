# CityBike App
# About
This is the 2nd version app for showing bike trips and some statistics about bike stations. It was done based on a pre-assignment challenge from Solita, and Solita supplied the journey and station data.
In this version I used GraphQL with Apollo Server besides NodeJS and Express for the backend due to the ease of the calculations and the vast amount of records and data and ReactJS and GraphQL with Apollo Cient for the frontend. 
Additionally, I think MongoDB is a good choice for a database because in reality, the information for the journeys and stations for this app is not related to each other.

# Backend
The backend is based on NodeJS, Express, and GraphQL, and it uses Apollo Server with Express to service. The database is MongoDB, and it uses the Mongoose module.
The backend obtains and reads CSV files. Check the records for validity. To be valid, trips must be longer than 10 meters and last more than 10 seconds. 
A duplication check is also added to check the duplications. since users upload files, and if a file is uploaded many times, it results in duplicate entries, rendering statistical analysis worthless.
The data from the station is also checked for duplicates.

## Prerequisite 
If you want to run the backend server locally, you must have Node 18.12.1 and npm installed on your machine. The versions mentioned above are based on the version I have on my computer.<br/>
You can also use the cloud backend server with the following address:
```
https://citybike-v2.onrender.com/
```
Which is available until the end of May 2023.

### Database	
If you want to run the server locally, You also require a MongoDB database, though Claude platforms are another alternative.
You could configure the connections URI and authentication for the database in the ./utils/config.js file.

## Set up
You need Nodejs installed and then just install dependencies with
```
> npm install 
```

## Run
To run the server in production mode, you can use:
```
> npm start 
```
The server runs on port 3005 by default. The port can be changed by editing the ./utils/config.js file.

### Uploading data.
If you run the server locally, It is possible to upload data for both trips and stations as a CSV file. 
The app chooses the data type (Trips, Stations) based on the first file row.

The file should be sent by post method the address:
```
URI: /api/upload/upload-csv
Method: Post
Parameter ( ‘csvFile’ ) 
```

Successful Response:  
```
code: 200     body: (data in json format)
 { status: 'file uploaded successfully!' , Data type : (trip | Station) }
```

#####  * Uploading Trips 
For the trips, the first row should contain this information.
```
Departure, Return, Departure station id, Departure station name, Return station id, Return station name, Covered distance (m), Duration (sec.)
```
Except for the stations' names, if other information is missed, that row is considered invalid.  


#####  * Uploading Stations data.
For the trips, the first row should contain this information.
```
ID, Name, Adress, Kaupunki, Operaattor, Kapasiteet , x, y
````
If stations' ID, Name, and Adress is missed, that row is considered invalid.  

### Reading data
Serving data for the Front-end is based on GraphQL and uses the Apollo server. 
The data processing, filtering, and pagination are done on the backend because there are too many records for the trips and to prevent excessive data transmission between the Back-end and Front-end.
```
URI: /api/citybike
Method: post
Parameter ( GraphQL's Queyr  ) 
```
Successful Response:  
```
code: 200     body: ( Requested data in json format)
```

## Test Backend
I use Jest and the supertest package to test the backend. Test makes use of the "test-city-bike" database.
because Linux is the development environment in the script, I just defined the mode. Use the  cross-env library if you want to work in the Windows environment.
To run the test use: 
```
>npm test
```
##### Test 1. file processing 
✓ Trip file with correct format is converted to trip model     
✓ Only valid trips add to the database     
✓ Duplicate trips would not be added to the database    
✓ Station file with correct format is converted to trip model    
✓ Only valid stations add to the database    
✓ Duplicate stations would not be added to the database  
##### Test 2. GraphQL and ApolloServer
  **Receive trips**     
	✓ trips are returned as json      
	✓ Return All Trips 	<br/>
	✓ Pagination test     
	✓ Test Filter  					
    
**Receive Stations**  
✓ Stations are returned as json    
✓ Return all stations 