const { getUserByEmail } = require('../helpers');

const chai = require("chai");
const chaiHttp = require("chai-http");

// Assuming your server is running on localhost:3000
const serverUrl = "http://localhost:3000";

chai.use(chaiHttp);
const expect = chai.expect;



const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$V17p/2mCozn/S5IcJxdZk.gwvEo79TYoC2GAWavR9OqjpIIYJfwYu" //purple-monkey-dinosaur
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$cZlBYY26T0AuZTU9xTSPme0lno7ejaB7rhvWUoGcDmOJrXZ2SGaNi" //dishwasher-funk
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    chai.assert.equal(user.id, expectedUserID);
  });
  it('should return false if passed an email that does not belong to a user in the user database', () => {
    const user = getUserByEmail("example@user.com", testUsers);
    const expectedOutput = undefined;
    chai.assert.equal(user, expectedOutput);
  });
});




describe("Login and Access with Session Cookie", () => {
  it("should return status code 403 for unauthorized access", () => {
    // Perform login with POST request
    return chai
      .request(serverUrl)
      .post("/login")
      .send({
        email: "user2@example.com",
        password: "dishwasher-funk",
      })
      .then((loginRes) => {
        // Assert that login was successful
        expect(loginRes).to.have.status(200);
        expect(loginRes).to.have.cookie("session"); // Assuming your session cookie is named 'session'

        // Use the session cookie in subsequent requests
        const agent = chai.request.agent(serverUrl);

        // Make GET request with session cookie
        return agent.get("/urls/b2xVn2").then((getResponse) => {
          // Expecting status code 403 for unauthorized access
          expect(getResponse).to.have.status(403);

          // Close the agent to clean up the session
          agent.close();
        });
      });
  });
});




