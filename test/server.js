let server = require("../src/server");
let chai = require("chai");
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp); 
const { expect } = chai;
var assert = chai.assert;


describe("Search Page", () => {
    it("makes sure search page loads", done => {
        chai
          .request(server)
          .get("/search")
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          });
      });
});

describe("Home Page", () => {
    it("makes sure home page loads", done => {
        chai
          .request(server)
          .get("/")
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          });
      });
});