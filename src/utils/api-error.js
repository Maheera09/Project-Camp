class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.errors = errors;
    this.success = false;

    if (stack) {
      //This code handles how your error’s stack trace (the list of where the error occurred in your code) is stored. When an error happens in JavaScript, the stack trace shows the path of function calls that led to that error.
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor); //This is a built-in Node.js method that captures the current stack trace. It lets you manually create or control the stack property of an error.
      //“Skip all frames until after the constructor (ApiError). Start recording from where the ApiError was actually created.”
    }
  }
}

/*When you run this:
a() is called → added to the stack
a() calls b() → added to the stack
b() calls c() → added to the stack
c() throws an error → 💥 program stops
JavaScript prints the call stack — showing the path of calls
That list of function calls (from last to first) is called the stack trace.*/

export { ApiError };
