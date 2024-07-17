
# Receipt Processor

This project is a web service that processes receipts and calculates points based on specific rules. It provides two main endpoints: one for processing receipts and another for retrieving points for a processed receipt.

## Setup and Running (using Docker)

This method requires no prerequisites other than Docker. If you don't have Docker installed, you can download and install it from [https://www.docker.com/get-started](https://www.docker.com/get-started).

1. Clone this repository:
   * using HTTPS
     ```
     git clone <repository-url>
     cd receipt-processor
     ```
   * using SSH
     ```
     git clone <repository-url>
     cd receipt-processor
     ```

3. Create a file named `Dockerfile` in the project root with the following content:
    ```
    FROM node:14
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 3000
    CMD [ "node", "app.js" ]
    ```
4. Build the Docker image:
    ```
    docker build -t receipt-processor .
    ```
5. Run the Docker container:
    ```
    docker run -p 3000:3000 receipt-processor
    ```

The server will start running on `http://localhost:3000`.


## Testing

You can use tools like Postman, cURL, or any HTTP client to test the API endpoints.

### Using Postman

1. Process a receipt:
   - Method: POST
   - URL: http://localhost:3000/receipts/process
   - Headers: 
     Key: Content-Type, Value: application/json
   - Body (raw JSON):
     ```json
      {
        "retailer": "Target",
        "purchaseDate": "2022-01-01",
        "purchaseTime": "13:01",
        "items": [
          {
            "shortDescription": "Mountain Dew 12PK",
            "price": "6.49"
          },{
            "shortDescription": "Emils Cheese Pizza",
            "price": "12.25"
          },{
            "shortDescription": "Knorr Creamy Chicken",
            "price": "1.26"
          },{
            "shortDescription": "Doritos Nacho Cheese",
            "price": "3.35"
          },{
            "shortDescription": "   Klarbrunn 12-PK 12 FL OZ  ",
            "price": "12.00"
          }
        ],
        "total": "35.35"
      }
     ```

2. Get points for a receipt:
   - Method: GET
   - URL: http://localhost:3000/receipts/{id}/points
     (Replace {id} with the ID returned from the process endpoint)

### Using cURL

1. Process a receipt:
   ```
   curl -X POST -H "Content-Type: application/json" -d '{"retailer": "Target", "purchaseDate": "2022-01-01", "purchaseTime": "13:01", "items": [{"shortDescription": "Mountain Dew 12PK", "price": "6.49"}, {"shortDescription": "Emils Cheese Pizza", "price": "12.25"}], "total": "35.35"}' http://localhost:3000/receipts/process
   ```
2. Get points for a receipt (replace `{id}` with the ID returned from the process endpoint):
   ```
   curl http://localhost:3000/receipts/{id}/points
   ```

## Notes

This application stores receipt data in memory. Data will be lost when the application restarts.
Make sure to use the ID returned from the process endpoint when requesting points.
