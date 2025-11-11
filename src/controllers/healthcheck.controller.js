import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/* const healthCheck = async (req, res, next) => {
  //When someone sends a request (like GET /api/health), it responds with a success message — confirming that the server is online and responding.
  try {
    res
      .status(200) //This sets the HTTP response status code to 200 OK, meaning “successful request.”
      .json(new ApiResponse(200, { message: "Server is running!!" })); //This sends back a JSON-formatted response using your custom ApiResponse class.
  } catch (err) {
    next(err);
  }
}; commented out because we made async handler*/

const healthCheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: "Server is running!!" }));
});

export { healthCheck };
